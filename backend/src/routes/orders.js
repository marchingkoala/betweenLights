const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `SELECT id, order_number, amount_total, currency, status, customer_email, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const orders = ordersResult.rows;
    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const itemsResult = await pool.query(
      `SELECT order_id, name, quantity, unit_amount
       FROM order_items
       WHERE order_id = ANY($1::int[])
       ORDER BY id ASC`,
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const row of itemsResult.rows) {
      if (!itemsByOrder.has(row.order_id)) {
        itemsByOrder.set(row.order_id, []);
      }
      itemsByOrder.get(row.order_id).push({
        name: row.name,
        quantity: row.quantity,
        unit_amount: row.unit_amount,
      });
    }

    const payload = orders.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      amount_total: o.amount_total,
      currency: o.currency,
      status: o.status,
      customer_email: o.customer_email,
      created_at: o.created_at,
      items: itemsByOrder.get(o.id) || [],
    }));

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

module.exports = router;
