require('dotenv').config();

const pool = require('../src/db');
const { upsertCustomers, upsertOrders } = require('../service/airtable');
const { toCustomerFields, toOrderFields } = require('../service/orderSync');

async function loadOrdersFromDb() {
  const result = await pool.query(`
    SELECT
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
    ORDER BY o.created_at ASC
  `);
  return result.rows;
}

// Keyed on the account's registered email (`users.email`), not
// `orders.customer_email` — see the comment on `toCustomerFields` in
// `service/orderSync.js` for why.
function dedupeCustomers(orders) {
  const byEmail = new Map();
  for (const row of orders) {
    if (!row.user_email) continue;
    if (!byEmail.has(row.user_email)) {
      byEmail.set(row.user_email, toCustomerFields(row));
    }
  }
  return Array.from(byEmail.values());
}

async function main() {
  console.log('Loading orders from Postgres...');
  const orders = await loadOrdersFromDb();
  console.log(`Loaded ${orders.length} orders`);

  if (orders.length === 0) {
    console.log('Nothing to sync.');
    return;
  }

  const customers = dedupeCustomers(orders);
  console.log(`Upserting ${customers.length} customers into Airtable...`);
  const customerRecords = await upsertCustomers(customers);

  const customerIdByEmail = new Map();
  for (const record of customerRecords) {
    customerIdByEmail.set(record.get('Email'), record.id);
  }

  const orderFields = orders
    .filter((row) => customerIdByEmail.has(row.user_email))
    .map((row) => toOrderFields(row, customerIdByEmail.get(row.user_email)));

  console.log(`Upserting ${orderFields.length} orders into Airtable...`);
  await upsertOrders(orderFields);

  console.log('Sync complete.');
}

main()
  .catch((err) => {
    console.error('Airtable sync failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    // Note: ../src/db leaks one checked-out client on module load (it never
    // releases the client from its startup `pool.connect()` test), which
    // makes `pool.end()` hang forever waiting for it. Don't await it here —
    // fire it and force-exit shortly after so this script always terminates.
    pool.end().catch(() => {});
    setTimeout(() => process.exit(process.exitCode ?? 0), 200);
  });
