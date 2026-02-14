const express = require('express');
const router = express.Router();
const pool = require('../db'); // DB connection

// GET /api/products?category=eyeglasses&shape=square&color=black&sort=newest
router.get('/', async (req, res) => {
  const { category, shape, color, sort } = req.query;

  // let query = "SELECT * FROM products";
  let query = `
  SELECT
    p.*,
    COALESCE(
      json_agg(
        json_build_object(
          'view', pi.view,
          'url', pi.url,
          'sort_order', pi.sort_order
        )
        ORDER BY pi.sort_order
      ) FILTER (WHERE pi.id IS NOT NULL),
      '[]'::json
    ) AS images
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
`;
  const conditions = [];
  const values = [];

  if (category) {
    values.push(category);
    conditions.push(`p.category = $${values.length}`);
  }
  if (shape) {
    values.push(shape);
    conditions.push(`p.shape = $${values.length}`);
  }
  if (color) {
    values.push(color);
    conditions.push(`p.color = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY p.id';

  if (sort === 'newest') {
    query += ' ORDER BY p.created_at DESC';
  } else if (sort === 'collection') {
    query += ' ORDER BY p.collection_name ASC';
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
