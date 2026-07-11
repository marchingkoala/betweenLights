const Airtable = require('airtable');
const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
  throw new Error('Airtable credentials are not set');
}

const base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE_ID);

const CUSTOMERS_TABLE = 'Customers';
const ORDERS_TABLE = 'Orders';

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function injectRecords(tableName, records, mergeOnField) {
  const table = base(tableName);
  const results = [];
  for (const batch of chunk(records, 10)) {
    const updated = await table.update(batch, {
      performUpsert: { fieldsToMergeOn: [mergeOnField] },
      typecast: true,
    });
    results.push(...updated);
  }
  return results;
}

// customers: [{ Email, Name }]  -- only writable fields; leave rollups (Total
// Orders/Total Spent) for Airtable to compute from the Orders link.

async function upsertCustomers(customers) {
  const records = customers.map((fields) => ({ fields }));
  return injectRecords(CUSTOMERS_TABLE, records, 'Email');
}

// orders: [{ 'Order Number', Customer: [customerRecordId], 'Amount Total',
// Currency, Status, 'Created At' }]
async function upsertOrders(orders) {
  const records = orders.map((fields) => ({ fields }));
  return injectRecords(ORDERS_TABLE, records, 'Order Number');
}
module.exports = { base, upsertCustomers, upsertOrders };
