const Stripe = require('stripe');
const pool = require('../db');
const { syncOrderById } = require('../../service/orderSync');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function handleCheckoutSessionCompleted(session) {
  const userIdRaw = session.client_reference_id;
  if (!userIdRaw) {
    console.log('Checkout completed (guest); no order row persisted.');
    return;
  }

  const userId =
    typeof userIdRaw === 'string' ? userIdRaw.trim() : String(userIdRaw);
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(userId)) {
    console.warn(
      'checkout.session.completed: invalid client_reference_id',
      userIdRaw
    );
    return;
  }

  const dup = await pool.query(
    'SELECT id FROM orders WHERE stripe_checkout_session_id = $1',
    [session.id]
  );
  if (dup.rows.length > 0) return;

  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [
    userId,
  ]);
  if (userCheck.rows.length === 0) {
    console.warn('checkout.session.completed: unknown user id', userId);
    return;
  }

  const amountTotal = session.amount_total;
  if (amountTotal == null) {
    console.warn(
      'checkout.session.completed: missing amount_total',
      session.id
    );
    return;
  }

  const currency = (session.currency || 'usd').toLowerCase();
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;
  const customerEmail =
    session.customer_details?.email || session.customer_email || null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertRes = await client.query(
      `INSERT INTO orders (
        user_id, order_number, stripe_checkout_session_id, stripe_payment_intent_id,
        amount_total, currency, status, customer_email
      ) VALUES ($1, $2, $3, $4, $5, $6, 'paid', $7)
      RETURNING id`,
      [
        userId,
        'TEMP_PENDING',
        session.id,
        paymentIntentId,
        amountTotal,
        currency,
        customerEmail,
      ]
    );
    const orderId = insertRes.rows[0].id;
    const createdMs = session.created ? session.created * 1000 : Date.now();
    const year = new Date(createdMs).getFullYear();
    const orderNumber = `BL-${year}-${String(orderId).padStart(6, '0')}`;
    await client.query('UPDATE orders SET order_number = $1 WHERE id = $2', [
      orderNumber,
      orderId,
    ]);

    const savedItemsRes = await client.query(
      `SELECT product_id, quantity, name, unit_amount
       FROM checkout_session_items
       WHERE stripe_checkout_session_id = $1`,
      [session.id]
    );

    if (savedItemsRes.rows.length === 0) {
      throw new Error(
        `No checkout_session_items found for session ${session.id}`
      );
    }

    for (const row of savedItemsRes.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, unit_amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          row.product_id,
          row.name,
          row.quantity,
          row.unit_amount,
        ]
      );

      if (row.product_id) {
        const stockRes = await client.query(
          `UPDATE products
           SET stock_units = stock_units - $1
           WHERE id = $2 AND stock_units >= $1
           RETURNING id, stock_units`,
          [row.quantity, row.product_id]
        );

        if (stockRes.rows.length === 0) {
          throw new Error(
            `Insufficient stock for product ${row.product_id} (session ${session.id})`
          );
        }

        await client.query(
          `INSERT INTO inventory_movements (product_id, order_id, movement_type, quantity)
           VALUES ($1, $2, 'sale', $3)`,
          [row.product_id, orderId, -row.quantity]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Order persisted:', orderNumber, orderId);

    // Best-effort real-time mirror into Airtable (customer, order, and
    // updated Stock on sold catalog items). Never let a failure here affect
    // the webhook response — Stripe would otherwise retry the whole event,
    // and the order is already safely persisted above regardless.
    try {
      await syncOrderById(orderId);
    } catch (airtableErr) {
      console.error('Airtable sync failed for order', orderId, airtableErr);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Order persist failed:', e);
    throw e;
  } finally {
    client.release();
  }
}

module.exports = async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).send('Webhook not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        await handleCheckoutSessionCompleted(session);
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
};
