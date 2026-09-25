import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { dateValue, enumValue, numberValue, objectId, requiredString, validateBody } from "../src/utils/validation.js";
import { batchStatus, serializeBatch } from "../src/utils/serializers.js";
import { sortFefoBatches } from "../src/services/transactionService.js";

test("requiredString trims and rejects short values", () => {
  assert.equal(requiredString("  value  ", "field"), "value");
  assert.throws(() => requiredString("", "field"), (error) => error.status === 400);
});

test("numberValue enforces bounds and integer mode", () => {
  assert.equal(numberValue("4", "quantity", { min: 1, integer: true }), 4);
  assert.throws(() => numberValue("1.5", "quantity", { integer: true }));
  assert.throws(() => numberValue("-1", "quantity", { min: 0 }));
});

test("objectId, enumValue, and dateValue normalize valid input", () => {
  const id = new mongoose.Types.ObjectId();
  assert.equal(objectId(String(id), "id"), String(id));
  assert.equal(enumValue("Active", "status", ["Active", "Inactive"]), "Active");
  assert.equal(dateValue("2026-01-02", "date").toISOString().slice(0, 10), "2026-01-02");
});

test("validateBody applies rules without dropping unrelated fields", () => {
  const req = { body: { name: "  Demo  ", extra: true } };
  const res = {};
  let called = false;
  validateBody({ name: [(value) => requiredString(value, "name")] })(req, res, () => { called = true; });
  assert.equal(called, true);
  assert.deepEqual(req.body, { name: "Demo", extra: true });
});

test("FEFO ordering uses expiry before creation and id tie-breakers", () => {
  const first = new mongoose.Types.ObjectId();
  const second = new mongoose.Types.ObjectId();
  const batches = [
    { _id: second, expiryDate: "2027-01-01", createdAt: "2026-01-01" },
    { _id: first, expiryDate: "2026-01-01", createdAt: "2026-02-01" },
  ];
  assert.equal(sortFefoBatches(batches)[0]._id, first);
  assert.deepEqual(sortFefoBatches(batches).map((batch) => String(batch._id)), [String(first), String(second)]);
});

test("batch serialization preserves references and derives status", () => {
  const medicineId = new mongoose.Types.ObjectId();
  const supplierId = new mongoose.Types.ObjectId();
  const tomorrow = new Date(Date.now() + 86400000);
  const batch = serializeBatch({
    _id: new mongoose.Types.ObjectId(),
    batchNo: "B-1",
    medicine: medicineId,
    supplier: supplierId,
    manufactureDate: new Date(Date.now() - 86400000),
    expiryDate: tomorrow,
    quantity: 4,
    costPerUnit: 2.5,
  });
  assert.equal(batch.medicineId, String(medicineId));
  assert.equal(batch.supplierId, String(supplierId));
  assert.equal(batch.status, "Near Expiry");
  assert.equal(batchStatus({ expiryDate: new Date(Date.now() - 86400000), quantity: 2 }), "Expired");
});
