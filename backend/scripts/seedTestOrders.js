/**
 * One-time seed script: creates 28 test users, each with 1-4 orders
 * containing 1-2 items (real eyeglasses/sunglasses or custom "Selena" builds).
 *
 * Mirrors the side effects normally performed by the Stripe webhook
 * (order_items, stock_units decrement, inventory_movements) so both
 * admin dashboard views (/api/admin/sold-products and /api/admin/orders)
 * have consistent, realistic data to test against.
 *
 * Usage:
 *   cd backend
 *   node scripts/seedTestOrders.js
 *
 * Safe to re-run: users are looked up by email first (no duplicates created).
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../src/db');

const SEED_PASSWORD = 'Test1234!';

const FIRST_NAMES = [
  'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Lucas', 'Mia', 'Elijah', 'Amelia', 'James', 'Harper', 'Benjamin',
  'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Emily', 'Michael', 'Ella',
  'Daniel', 'Scarlett', 'Matthew', 'Grace', 'Samuel',
];

const LAST_NAMES = [
  'Bennett', 'Carter', 'Diaz', 'Ellison', 'Foster', 'Grant', 'Hayes', 'Irwin',
  'Jenkins', 'Kessler', 'Lambert', 'Monroe', 'Nolan', 'Ortiz', 'Parker',
  'Quinn', 'Reyes', 'Sawyer', 'Turner', 'Underwood', 'Vance', 'Walsh',
  'Xiong', 'Yates', 'Zimmerman', 'Adler', 'Brooks', 'Cross',
];

const CUSTOM_FRAME_LABELS = ['Black', 'Red', 'Lime', 'Cream'];
const CUSTOM_GLASS_LABELS = ['Black', 'Brown', 'Clear'];
const CUSTOM_PRICE = 128;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function randomPastDate(daysBack) {
  const now = Date.now();
  const past = now - randInt(0, daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past);
}

async function seedUsers() {
  const users = [];
  for (let i = 0; i < FIRST_NAMES.length; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];
    const email = `${firstName.toLowerCase()}@test.com`;

    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (existing.rows.length > 0) {
      users.push(existing.rows[0]);
      continue;
    }

    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [firstName, lastName, email, passwordHash]
    );
    users.push(result.rows[0]);
  }
  return users;
}

async function loadProducts() {
  const result = await pool.query(
    `SELECT id, name, color, category, price, stock_units
     FROM products
     WHERE category IN ('eyeglasses', 'sunglasses')`
  );
  return {
    eyeglasses: result.rows.filter((p) => p.category === 'eyeglasses'),
    sunglasses: result.rows.filter((p) => p.category === 'sunglasses'),
  };
}

function buildCustomItem() {
  const frameLabel = pickRandom(CUSTOM_FRAME_LABELS);
  const glassLabel = pickRandom(CUSTOM_GLASS_LABELS);
  return {
    productId: null,
    name: `Selena — ${frameLabel} / ${glassLabel}`,
    unitAmount: Math.round(CUSTOM_PRICE * 100),
    quantity: Math.random() < 0.7 ? 1 : 2,
  };
}

function buildRealItem(product) {
  return {
    productId: product.id,
    name: `${product.name} — ${product.color}`,
    unitAmount: Math.round(Number(product.price) * 100),
    quantity: Math.random() < 0.7 ? 1 : 2,
  };
}

function buildItem(products) {
  const r = Math.random();
  if (r < 0.4 && products.eyeglasses.length > 0) {
    return buildRealItem(pickRandom(products.eyeglasses));
  }
  if (r < 0.8 && products.sunglasses.length > 0) {
    return buildRealItem(pickRandom(products.sunglasses));
  }
  return buildCustomItem();
}

async function createOrderForUser(user, products) {
  const itemCount = Math.random() < 0.6 ? 1 : 2;
  const items = Array.from({ length: itemCount }, () => buildItem(products));

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitAmount * item.quantity,
    0
  );
  const discountApplied = Math.random() < 0.4;
  const amountTotal = discountApplied
    ? Math.round(subtotal * 0.8)
    : subtotal;

  const createdAt = randomPastDate(90);
  const sessionId = `cs_test_seed_${crypto.randomUUID()}`;
  const paymentIntentId = `pi_seed_${crypto.randomUUID()}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders
        (user_id, order_number, stripe_checkout_session_id, stripe_payment_intent_id,
         amount_total, currency, status, customer_email, created_at)
       VALUES ($1, $2, $3, $4, $5, 'usd', 'paid', $6, $7)
       RETURNING id`,
      [
        user.id,
        crypto.randomUUID(),
        sessionId,
        paymentIntentId,
        amountTotal,
        user.email,
        createdAt,
      ]
    );
    const orderId = orderResult.rows[0].id;
    const year = createdAt.getFullYear();
    const orderNumber = `BL-${year}-${String(orderId).padStart(6, '0')}`;
    await client.query('UPDATE orders SET order_number = $1 WHERE id = $2', [
      orderNumber,
      orderId,
    ]);

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, quantity, unit_amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productId, item.name, item.quantity, item.unitAmount]
      );

      if (item.productId) {
        await client.query(
          `UPDATE products
           SET stock_units = GREATEST(stock_units - $1, 0)
           WHERE id = $2`,
          [item.quantity, item.productId]
        );
        await client.query(
          `INSERT INTO inventory_movements (product_id, order_id, movement_type, quantity)
           VALUES ($1, $2, 'sale', $3)`,
          [item.productId, orderId, -item.quantity]
        );
      }
    }

    await client.query('COMMIT');
    return { orderNumber, amountTotal, discountApplied, itemCount: items.length };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  ✗ Failed to create order for ${user.email}:`, err.message);
    return null;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('Seeding test users and orders...\n');

  const users = await seedUsers();
  console.log(`✓ ${users.length} users ready (shared password: ${SEED_PASSWORD})\n`);

  const products = await loadProducts();
  console.log(
    `✓ Loaded ${products.eyeglasses.length} eyeglasses / ${products.sunglasses.length} sunglasses products for real line items\n`
  );

  let ordersCreated = 0;
  let itemsCreated = 0;
  let discountedOrders = 0;

  for (const user of users) {
    const orderCount = randInt(1, 4);
    for (let i = 0; i < orderCount; i++) {
      const order = await createOrderForUser(user, products);
      if (order) {
        ordersCreated += 1;
        itemsCreated += order.itemCount;
        if (order.discountApplied) discountedOrders += 1;
      }
    }
  }

  console.log('--- Summary ---');
  console.log(`Users:            ${users.length}`);
  console.log(`Orders created:   ${ordersCreated}`);
  console.log(`Items created:    ${itemsCreated}`);
  console.log(`Discounted orders: ${discountedOrders}`);
  console.log(`\nLogin with any seed user email (e.g. ${users[0].email}) and password: ${SEED_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('Seed script failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    pool.end();
  });
