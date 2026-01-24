const express = require("express");
const router = express.Router();
const pool = require("../db"); // DB connection

// GET /api/products?category=eyeglasses&shape=square&color=black&sort=newest
router.get("/", async (req, res) => {
  const { category, shape, color, sort } = req.query;

  let query = "SELECT * FROM products";
  const conditions = [];
  const values = [];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  if (shape) {
    values.push(shape);
    conditions.push(`shape = $${values.length}`);
  }
  if (color) {
    values.push(color);
    conditions.push(`color = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "newest") {
    query += " ORDER BY created_at DESC";
  } else if (sort === "collection") {
    query += " ORDER BY collection_name ASC";
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
