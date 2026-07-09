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

module.exports = router;
