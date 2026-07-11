-- Between Lights — production schema
-- Apply first against a fresh managed Postgres database:
--   psql "$DATABASE_URL" -f backend/db/migrations/001_schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('eyeglasses', 'sunglasses');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE frame_shape AS ENUM (
    'square', 'rectangle', 'oval', 'round', 'cat_eye', 'aviator'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE frame_color AS ENUM (
    'black', 'brown', 'tortoise', 'crystal', 'metallic',
    'gold', 'silver', 'cream', 'green'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE image_view AS ENUM ('front', 'side');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  created_at TIMESTAMP DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category product_category NOT NULL,
  shape frame_shape NOT NULL,
  color frame_color NOT NULL,
  collection_name TEXT,
  image_url TEXT,
  stock_units INTEGER NOT NULL DEFAULT 0 CHECK (stock_units >= 0),
  created_at TIMESTAMP DEFAULT now()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  view image_view NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_product_view UNIQUE (product_id, view)
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON product_images (product_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount_total INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  status VARCHAR(32) NOT NULL DEFAULT 'paid',
  customer_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_amount INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- Checkout session staging (used by Stripe webhook)
CREATE TABLE IF NOT EXISTS checkout_session_items (
  id SERIAL PRIMARY KEY,
  stripe_checkout_session_id VARCHAR(255) NOT NULL,
  product_id UUID,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  name TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkout_session_items_session
  ON checkout_session_items (stripe_checkout_session_id);

-- Inventory movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL
    CHECK (movement_type = ANY (ARRAY['sale'::text, 'restock'::text, 'adjustment'::text])),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
