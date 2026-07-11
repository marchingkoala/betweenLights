const pool = require('../src/db');
const { upsertCustomers, upsertOrders } = require('./airtable');

function buildCustomerName(row) {
  const name = `${row.first_name || ''} ${row.last_name || ''}`.trim();
  return name || row.user_email;
}

// Identity is keyed on the account's registered email (`users.email`), not
// `orders.customer_email` — the latter comes from whatever email Stripe
// Checkout happened to collect for that specific payment (e.g. from browser
// autofill), which can differ from the account that placed the order and is
// not reliably unique per customer. Using it as an upsert key can silently
// merge unrelated accounts into a single Airtable Customer record.
function toCustomerFields(row) {
  return { Email: row.user_email, Name: buildCustomerName(row) };
}

function toOrderFields(row, customerRecordId) {
  return {
    'Order Number': row.order_number,
    Customer: [customerRecordId],
    'Amount Total': Number(row.amount_total) / 100,
    Currency: (row.currency || 'usd').toUpperCase(),
    Status: row.status,
    'Created At': row.created_at.toISOString(),
  };
}

async function loadOrderById(orderId) {
  const result = await pool.query(
    `SELECT
       o.order_number,
       o.amount_total,
       o.currency,
       o.status,
       o.created_at,
       u.first_name,
       u.last_name,
       u.email AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

// Real-time sync for a single order — used by the Stripe webhook right after
// an order is persisted. Kept separate from the bulk `syncAirtable.js` script
// so a single checkout only costs 2 Airtable API calls, not a full resync.
async function syncOrderById(orderId) {
  const row = await loadOrderById(orderId);
  if (!row) {
    console.warn(`syncOrderById: order ${orderId} not found, skipping Airtable sync`);
    return;
  }
  if (!row.user_email) {
    console.warn(`syncOrderById: order ${orderId} has no user account email, skipping Airtable sync`);
    return;
  }

  const customerRecords = await upsertCustomers([toCustomerFields(row)]);
  const customerRecord = customerRecords.find(
    (record) => record.get('Email') === row.user_email
  );
  if (!customerRecord) {
    throw new Error(
      `syncOrderById: Airtable did not return a Customers record for ${row.user_email}`
    );
  }

  await upsertOrders([toOrderFields(row, customerRecord.id)]);
}

module.exports = {
  loadOrderById,
  syncOrderById,
  buildCustomerName,
  toCustomerFields,
  toOrderFields,
};
