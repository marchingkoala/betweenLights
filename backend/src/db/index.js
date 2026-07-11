const { Pool } = require("pg"); // Import Pool from pg
require("dotenv").config(); // Load environment variables

// Managed Postgres (Render, Neon, etc.) requires SSL; local Postgres does not.
const useSsl = process.env.DB_SSL === "true";

// Create a new pool instance
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Test the connection immediately
pool
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("DB connection error", err));

module.exports = pool; // Export the pool object
