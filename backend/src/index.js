require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Must match the exported pool
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.get('/', (req, res) => res.send('API is running'));
// serve static files from /public
app.use(express.static('public'));

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Use pool.query directly
    res.json({ now: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
