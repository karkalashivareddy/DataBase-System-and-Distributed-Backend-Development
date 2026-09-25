import Batch from "../models/Batch.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import { recordAudit } from "../middleware/audit.js";
import { badRequest, notFound } from "../utils/errors.js";
import { created, ok, pageMeta, parsePaging } from "../utils/http.js";
import { serializeBatch, serializeMedicine, serializeSupplier } from "../utils/serializers.js";
import { getStockByMedicine } from "../services/dashboardService.js";
import { getSupplierMetrics as getSupplierRows } from "../services/supplierService.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listMedicines(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 100, 100);
  const filter = {};
  if (req.query.search) {
    const expression = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ name: expression }, { generic: expression }, { manufacturer: expression }];
  }
  if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
  const [total, medicines, stock] = await Promise.all([
    Medicine.countDocuments(filter),
    Medicine.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    getStockByMedicine(),
  ]);
  const data = medicines.map((medicine) => serializeMedicine(medicine, stock.get(String(medicine._id))?.stock || 0));
  return ok(res, data, pageMeta(total, page, limit));
}

export async function getMedicine(req, res) {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw notFound("Medicine not found");
  const stock = await getStockByMedicine();
  return ok(res, serializeMedicine(medicine, stock.get(String(medicine._id))?.stock || 0));
}

export async function createMedicine(req, res) {
  const medicine = await Medicine.create(req.body);
  await recordAudit(req, { action: "MEDICINE_CREATE", entityType: "Medicine", entityId: medicine._id, metadata: { name: medicine.name } });
  return created(res, serializeMedicine(medicine, 0));
}

export async function updateMedicine(req, res) {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!medicine) throw notFound("Medicine not found");
  await recordAudit(req, { action: "MEDICINE_UPDATE", entityType: "Medicine", entityId: medicine._id, metadata: req.body });
  const stock = await getStockByMedicine();
  return ok(res, serializeMedicine(medicine, stock.get(String(medicine._id))?.stock || 0));
}

export async function deleteMedicine(req, res) {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw notFound("Medicine not found");
  if (await Batch.exists({ medicine: medicine._id })) throw badRequest("Medicine cannot be deleted while batches exist");
  await medicine.deleteOne();
  await recordAudit(req, { action: "MEDICINE_DELETE", entityType: "Medicine", entityId: medicine._id, metadata: { name: medicine.name } });
  return ok(res, { id: req.params.id });
}

export async function listBatches(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 100, 100);
  const filter = {};
  if (req.query.medicineId) filter.medicine = req.query.medicineId;
  if (req.query.supplierId) filter.supplier = req.query.supplierId;
  if (req.query.search) {
    const expression = new RegExp(escapeRegex(req.query.search), "i");
    const matchingMedicines = await Medicine.find({ $or: [{ name: expression }, { generic: expression }] }).select("_id").lean();
    filter.$or = [{ batchNo: expression }, { medicine: { $in: matchingMedicines.map((medicine) => medicine._id) } }];
  }
  const [total, batches] = await Promise.all([
    Batch.countDocuments(filter),
    Batch.find(filter).populate("medicine", "name").populate("supplier", "name").sort({ expiryDate: 1 }).skip(skip).limit(limit),
  ]);
  return ok(res, batches.map((batch) => serializeBatch(batch)), pageMeta(total, page, limit));
}

export async function getBatch(req, res) {
  const batch = await Batch.findById(req.params.id).populate("medicine", "name").populate("supplier", "name");
  if (!batch) throw notFound("Batch not found");
  return ok(res, serializeBatch(batch));
}

function batchPayload(body) {
  const { medicineId, supplierId, ...fields } = body;
  const payload = { ...fields };
  if (medicineId !== undefined) payload.medicine = medicineId;
  if (supplierId !== undefined) payload.supplier = supplierId;
  return payload;
}

export async function createBatch(req, res) {
  const batch = await Batch.create(batchPayload(req.body));
  await recordAudit(req, { action: "BATCH_CREATE", entityType: "Batch", entityId: batch._id, metadata: { batchNo: batch.batchNo } });
  const populated = await Batch.findById(batch._id).populate("medicine", "name").populate("supplier", "name");
  return created(res, serializeBatch(populated));
}

export async function updateBatch(req, res) {
  const batch = await Batch.findByIdAndUpdate(req.params.id, batchPayload(req.body), { new: true, runValidators: true }).populate("medicine", "name").populate("supplier", "name");
  if (!batch) throw notFound("Batch not found");
  await recordAudit(req, { action: "BATCH_UPDATE", entityType: "Batch", entityId: batch._id, metadata: req.body });
  return ok(res, serializeBatch(batch));
}

export async function deleteBatch(req, res) {
  const batch = await Batch.findById(req.params.id);
  if (!batch) throw notFound("Batch not found");
  if (await Batch.exists({ _id: batch._id, quantity: { $gt: 0 } })) throw badRequest("Batches with stock cannot be deleted");
  await batch.deleteOne();
  await recordAudit(req, { action: "BATCH_DELETE", entityType: "Batch", entityId: batch._id, metadata: { batchNo: batch.batchNo } });
  return ok(res, { id: req.params.id });
}

export async function listSuppliers(req, res) {
  const rows = await getSupplierRows();
  const query = String(req.query.search || "").toLowerCase().trim();
  const filtered = query ? rows.filter((supplier) => `${supplier.name} ${supplier.contact} ${supplier.email}`.toLowerCase().includes(query)) : rows;
  const status = req.query.status;
  const result = status && status !== "All" ? filtered.filter((supplier) => supplier.status === status) : filtered;
  return ok(res, result, pageMeta(result.length, 1, result.length || 1));
}

export async function getSupplier(req, res) {
  const rows = await getSupplierRows();
  const supplier = rows.find((row) => row.id === req.params.id);
  if (!supplier) throw notFound("Supplier not found");
  return ok(res, supplier);
}

export async function createSupplier(req, res) {
  const supplier = await Supplier.create(req.body);
  await recordAudit(req, { action: "SUPPLIER_CREATE", entityType: "Supplier", entityId: supplier._id, metadata: { name: supplier.name } });
  return created(res, serializeSupplier(supplier));
}

export async function updateSupplier(req, res) {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!supplier) throw notFound("Supplier not found");
  await recordAudit(req, { action: "SUPPLIER_UPDATE", entityType: "Supplier", entityId: supplier._id, metadata: req.body });
  const rows = await getSupplierRows();
  return ok(res, rows.find((row) => row.id === String(supplier._id)) || serializeSupplier(supplier));
}

export async function deleteSupplier(req, res) {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw notFound("Supplier not found");
  if (await Batch.exists({ supplier: supplier._id })) throw badRequest("Supplier cannot be deleted while batches exist");
  await supplier.deleteOne();
  await recordAudit(req, { action: "SUPPLIER_DELETE", entityType: "Supplier", entityId: supplier._id, metadata: { name: supplier.name } });
  return ok(res, { id: req.params.id });
}

export async function search(req, res) {
  const query = String(req.query.q || "").trim();
  if (!query) return ok(res, { medicines: [], suppliers: [], batches: [], transactions: [] });
  const expression = new RegExp(escapeRegex(query), "i");
  const [medicines, suppliers, batches, sales, purchases] = await Promise.all([
    Medicine.find({ $or: [{ name: expression }, { generic: expression }] }).select("name generic category").limit(5).lean(),
    Supplier.find({ $or: [{ name: expression }, { contact: expression }] }).select("name contact").limit(5).lean(),
    Batch.find({ batchNo: expression }).populate("medicine", "name").limit(5).lean(),
    Sale.find({ $or: [{ saleNo: expression }, { customer: expression }] }).populate("medicine", "name").sort({ date: -1 }).limit(5).lean(),
    Purchase.find({ purchaseNo: expression }).populate("medicine", "name").sort({ date: -1 }).limit(5).lean(),
  ]);
  return ok(res, {
    medicines: medicines.map((item) => ({ id: String(item._id), name: item.name, generic: item.generic, category: item.category })),
    suppliers: suppliers.map((item) => ({ id: String(item._id), name: item.name, contact: item.contact })),
    batches: batches.map((item) => ({ id: String(item._id), batchNo: item.batchNo, medicineName: item.medicine?.name || "Unknown" })),
    transactions: [
      ...sales.map((item) => ({ id: String(item._id), label: item.saleNo, sub: item.medicine?.name || "Medicine", kind: "Sale" })),
      ...purchases.map((item) => ({ id: String(item._id), label: item.purchaseNo, sub: item.medicine?.name || "Medicine", kind: "Purchase" })),
    ],
  });
}
