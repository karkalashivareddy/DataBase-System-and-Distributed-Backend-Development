import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import Batch from "../models/Batch.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import InventoryAdjustment from "../models/InventoryAdjustment.js";

const REQUIRED_FIELDS = {
  users: ["name", "email", "password", "role", "status", "joined"],
  medicines: ["name", "generic", "category", "manufacturer", "dosage", "unitPrice", "reorderLevel"],
  suppliers: ["name", "contact", "status"],
  batches: ["batchNo", "medicine", "supplier", "manufactureDate", "expiryDate", "quantity", "costPerUnit"],
  purchases: ["purchaseNo", "supplier", "medicine", "batch", "quantity", "unitCost", "total", "date", "status", "createdBy"],
  sales: ["saleNo", "medicine", "batch", "allocations", "quantity", "unitPrice", "total", "date", "status", "createdBy"],
  inventoryAdjustments: ["medicine", "batch", "quantityDelta", "reason", "createdBy"],
};

const SEED_COUNTS = { users: 6, medicines: 12, suppliers: 5, batches: 12, purchases: 18, sales: 20 };

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function idOf(value) {
  return value ? String(value._id || value) : "";
}

function hasRequiredFields(documents, fields) {
  return documents.every((document) => fields.every((field) => document[field] !== undefined && document[field] !== null));
}

async function verify() {
  let allOk = true;
  const fail = (message) => { allOk = false; console.error(`FAIL: ${message}`); };
  const pass = (message) => console.log(`OK: ${message}`);
  const [users, medicines, suppliers, batches, purchases, sales, adjustments] = await Promise.all([
    User.find().select("+password").lean(),
    Medicine.find().lean(),
    Supplier.find().lean(),
    Batch.find().lean(),
    Purchase.find().lean(),
    Sale.find().lean(),
    InventoryAdjustment.find().lean(),
  ]);
  const ids = {
    users: new Set(users.map(idOf)),
    medicines: new Set(medicines.map(idOf)),
    suppliers: new Set(suppliers.map(idOf)),
    batches: new Set(batches.map(idOf)),
  };
  if (!hasRequiredFields(users, REQUIRED_FIELDS.users)) fail("users contain missing required fields");
  else if (!users.every((user) => /^\$2[aby]\$/.test(user.password || ""))) fail("one or more user passwords are not bcrypt hashed");
  else pass(`${users.length} users contain required fields and bcrypt hashes`);
  if (!hasRequiredFields(medicines, REQUIRED_FIELDS.medicines)) fail("medicines contain missing required fields");
  else pass(`${medicines.length} medicines contain required fields`);
  if (!hasRequiredFields(suppliers, REQUIRED_FIELDS.suppliers)) fail("suppliers contain missing required fields");
  else pass(`${suppliers.length} suppliers contain required fields`);
  if (!hasRequiredFields(batches, REQUIRED_FIELDS.batches)) fail("batches contain missing required fields");
  for (const batch of batches) {
    if (!ids.medicines.has(idOf(batch.medicine))) fail(`batch ${batch.batchNo} has an orphan medicine reference`);
    if (!ids.suppliers.has(idOf(batch.supplier))) fail(`batch ${batch.batchNo} has an orphan supplier reference`);
    if (!Number.isInteger(batch.quantity) || batch.quantity < 0) fail(`batch ${batch.batchNo} has invalid quantity`);
    if (new Date(batch.expiryDate) <= new Date(batch.manufactureDate)) fail(`batch ${batch.batchNo} has an invalid expiry state`);
  }
  if (allOk) pass(`${batches.length} batches contain required fields and valid references`);
  if (!hasRequiredFields(purchases, REQUIRED_FIELDS.purchases)) fail("purchases contain missing required fields");
  for (const purchase of purchases) {
    if (!ids.suppliers.has(idOf(purchase.supplier))) fail(`purchase ${purchase.purchaseNo} has an orphan supplier reference`);
    if (!ids.medicines.has(idOf(purchase.medicine))) fail(`purchase ${purchase.purchaseNo} has an orphan medicine reference`);
    if (!ids.batches.has(idOf(purchase.batch))) fail(`purchase ${purchase.purchaseNo} has an orphan batch reference`);
    if (!ids.users.has(idOf(purchase.createdBy))) fail(`purchase ${purchase.purchaseNo} has an orphan user reference`);
    if (Number(purchase.paidAmount || 0) > Number(purchase.total || 0)) fail(`purchase ${purchase.purchaseNo} has an invalid paid amount`);
    if (Math.abs(Number(purchase.total || 0) - roundMoney(Number(purchase.quantity || 0) * Number(purchase.unitCost || 0))) > 0.01) fail(`purchase ${purchase.purchaseNo} has an invalid total`);
  }
  if (allOk) pass(`${purchases.length} purchases contain required fields and valid references`);
  if (!hasRequiredFields(sales, REQUIRED_FIELDS.sales)) fail("sales contain missing required fields");
  for (const sale of sales) {
    if (!ids.medicines.has(idOf(sale.medicine))) fail(`sale ${sale.saleNo} has an orphan medicine reference`);
    if (!ids.batches.has(idOf(sale.batch))) fail(`sale ${sale.saleNo} has an orphan batch reference`);
    if (!ids.users.has(idOf(sale.createdBy))) fail(`sale ${sale.saleNo} has an orphan user reference`);
    if (Math.abs(Number(sale.total || 0) - roundMoney(Number(sale.quantity || 0) * Number(sale.unitPrice || 0))) > 0.01) fail(`sale ${sale.saleNo} has an invalid total`);
    let allocatedQuantity = 0;
    for (const allocation of sale.allocations || []) {
      if (!ids.batches.has(idOf(allocation.batch))) fail(`sale ${sale.saleNo} has an orphan allocation batch reference`);
      if (!Number.isInteger(allocation.quantity) || allocation.quantity < 1) fail(`sale ${sale.saleNo} has an invalid allocation quantity`);
      allocatedQuantity += Number(allocation.quantity || 0);
      const allocatedBatch = batches.find((batch) => idOf(batch) === idOf(allocation.batch));
      if (allocatedBatch && idOf(allocatedBatch.medicine) !== idOf(sale.medicine)) fail(`sale ${sale.saleNo} allocates a batch from another medicine`);
    }
    if (!Array.isArray(sale.allocations) || sale.allocations.length === 0) fail(`sale ${sale.saleNo} has no stock allocations`);
    if (allocatedQuantity !== Number(sale.quantity)) fail(`sale ${sale.saleNo} allocation quantity does not match sale quantity`);
  }
  if (allOk) pass(`${sales.length} sales contain required fields and valid references`);
  if (!hasRequiredFields(adjustments, REQUIRED_FIELDS.inventoryAdjustments)) fail("inventory adjustments contain missing required fields");
  for (const adjustment of adjustments) {
    if (!ids.medicines.has(idOf(adjustment.medicine))) fail(`inventory adjustment ${idOf(adjustment)} has an orphan medicine reference`);
    if (!ids.batches.has(idOf(adjustment.batch))) fail(`inventory adjustment ${idOf(adjustment)} has an orphan batch reference`);
    if (!ids.users.has(idOf(adjustment.createdBy))) fail(`inventory adjustment ${idOf(adjustment)} has an orphan user reference`);
    if (!Number.isInteger(adjustment.quantityDelta) || adjustment.quantityDelta === 0) fail(`inventory adjustment ${idOf(adjustment)} has an invalid quantity delta`);
  }
  if (allOk) pass(`${adjustments.length} inventory adjustments contain valid references`);
  await Batch.init();
  const batchIndexes = await Batch.collection.indexes();
  if (!batchIndexes.some((index) => index.key?.medicine === 1 && index.key?.expiryDate === 1)) fail("batch medicine/expiry compound index is missing");
  else pass("batch medicine/expiry compound index exists");
  return allOk;
}

export async function runVerify() {
  let connected = false;
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    connected = true;
    const names = Object.keys(SEED_COUNTS);
    const counts = {};
    let countsOk = true;
    for (const name of names) {
      const count = await mongoose.connection.db.collection(name).countDocuments();
      counts[name] = count;
      const expected = SEED_COUNTS[name];
      const matches = process.env.VERIFY_SEED_COUNTS === "true" ? count === expected : count > 0;
      if (!matches) countsOk = false;
      console.log(`${name.padEnd(10)} ${count} documents ${matches ? "OK" : "FAIL"}`);
    }
    const referencesOk = await verify();
    if (countsOk && referencesOk) {
      console.log("Database verification: PASS");
    } else {
      console.error("Database verification: FAIL");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Verification failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (connected) await mongoose.disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith("verifyDb.js")) await runVerify();
