const express = require('express');
const Stripe = require('stripe');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');

router.post('/create-checkout-session', optionalAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required' });
    }

    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (const item of items) {
      if (!item?.name || typeof item.name !== 'string') {
        return res.status(400).json({ error: 'Invalid item name' });
      }

      if (!Number.isInteger(item.unitAmount) || item.unitAmount <= 0) {
        return res.status(400).json({ error: 'Invalid item unitAmount' });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid item quantity' });
      }

      const isCustom =
        typeof item.productId === 'string' &&
        item.productId.startsWith('custom:');

      if (!isCustom && !uuidRe.test(item.productId)) {
        return res.status(400).json({ error: 'Invalid productId' });
      }
    }

    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.unitAmount,
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    };

    if (req.user?.id) {
      sessionParams.client_reference_id = String(req.user.id);
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    for (const item of items) {
      const isCustom =
        typeof item.productId === 'string' &&
        item.productId.startsWith('custom:');
      await pool.query(
        `INSERT INTO checkout_session_items
     (stripe_checkout_session_id, product_id, quantity, name, unit_amount)
     VALUES ($1, $2, $3, $4, $5)`,
        [
          session.id,
          isCustom ? null : item.productId,
          item.quantity,
          item.name,
          item.unitAmount,
        ]
      );
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
