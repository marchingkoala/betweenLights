const express = require('express');
const { authRequired, adminRequired } = require('../middleware/auth');
const pool = require('../db');

const router = express.Router();

// GET /api/admin/me
router.get('/me', authRequired, adminRequired, (req, res) => {
  res.json({
    ok: true,
    message: 'Admin access granted',
    user: req.user,
  });
});

// GET /api/admin/sold-products?view=summary|details
router.get('/sold-products', authRequired, adminRequired, async (req, res) => {
  const view = req.query.view === 'details' ? 'details' : 'summary';

  try {
    if (view === 'details') {
      const result = await pool.query(`
        SELECT
          im.id AS movement_id,
          im.created_at AS sold_at,
          im.quantity,
          ABS(im.quantity) AS units_sold,
          im.movement_type,
          o.id AS order_id,
          o.order_number,
          o.status AS order_status,
          o.customer_email,
          p.id AS product_id,
          p.name,
          p.color,
          p.category,
          p.shape,
          p.price,
          p.stock_units
        FROM inventory_movements im
        JOIN products p ON p.id = im.product_id
        LEFT JOIN orders o ON o.id = im.order_id
        WHERE im.movement_type = 'sale'
        ORDER BY im.created_at DESC
      `);

      return res.json(result.rows);
    }

    // summary view (default)
    const result = await pool.query(`
      SELECT
        p.id AS product_id,
        p.name,
        p.color,
        p.category,
        p.shape,
        p.price,
        p.stock_units,
        COALESCE(SUM(ABS(im.quantity)), 0) AS units_sold,
        COUNT(im.id) AS sale_events
      FROM products p
      LEFT JOIN inventory_movements im
        ON im.product_id = p.id
       AND im.movement_type = 'sale'
      GROUP BY p.id
      HAVING COALESCE(SUM(ABS(im.quantity)), 0) > 0
      ORDER BY units_sold DESC, p.name ASC
    `);

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load sold products' });
  }
});

// GET /api/admin/orders — all orders across all users, with buyer info and line items
router.get('/orders', authRequired, adminRequired, async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.amount_total,
        o.currency,
        o.status,
        o.customer_email,
        o.created_at,
        u.id AS user_id,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    const orders = ordersResult.rows;
    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);
    const itemsResult = await pool.query(
      `SELECT order_id, product_id, name, quantity, unit_amount
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
        product_id: row.product_id,
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
      buyer_name:
        o.first_name || o.last_name
          ? `${o.first_name || ''} ${o.last_name || ''}`.trim()
          : null,
      user_id: o.user_id,
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
