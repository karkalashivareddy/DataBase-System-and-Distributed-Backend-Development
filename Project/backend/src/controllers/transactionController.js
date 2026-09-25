import Purchase from "../models/Purchase.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import Sale from "../models/Sale.js";
import InventoryAdjustment from "../models/InventoryAdjustment.js";
import { recordAudit } from "../middleware/audit.js";
import { adjustInventory, recordPurchase, recordSale, refundSale } from "../services/transactionService.js";
import { notFound } from "../utils/errors.js";
import { created, ok, pageMeta, parsePaging } from "../utils/http.js";
import { serializePurchase, serializeSale } from "../utils/serializers.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dateFilter(query) {
  const filter = {};
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = new Date(query.from);
    if (query.to) filter.date.$lte = new Date(query.to);
  }
  return filter;
}

export async function listPurchases(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 100, 100);
  const filter = dateFilter(req.query);
  if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
  if (req.query.supplierId) filter.supplier = req.query.supplierId;
  if (req.query.medicineId) filter.medicine = req.query.medicineId;
  if (req.query.search) {
    const expression = new RegExp(escapeRegex(req.query.search), "i");
    const [matchingMedicines, matchingSuppliers] = await Promise.all([
      Medicine.find({ $or: [{ name: expression }, { generic: expression }] }).select("_id").lean(),
      Supplier.find({ $or: [{ name: expression }, { contact: expression }] }).select("_id").lean(),
    ]);
    filter.$or = [
      { purchaseNo: expression },
      { medicine: { $in: matchingMedicines.map((medicine) => medicine._id) } },
      { supplier: { $in: matchingSuppliers.map((supplier) => supplier._id) } },
    ];
  }
  const [total, rows] = await Promise.all([
    Purchase.countDocuments(filter),
    Purchase.find(filter).populate("supplier", "name").populate("medicine", "name").populate("batch", "batchNo").sort({ date: -1 }).skip(skip).limit(limit),
  ]);
  return ok(res, rows.map((row) => serializePurchase(row)), pageMeta(total, page, limit));
}

export async function getPurchase(req, res) {
  const row = await Purchase.findById(req.params.id).populate("supplier", "name").populate("medicine", "name").populate("batch", "batchNo");
  if (!row) throw notFound("Purchase not found");
  return ok(res, serializePurchase(row));
}

export async function createPurchase(req, res) {
  const row = await recordPurchase(req.body, req.user._id);
  await recordAudit(req, { action: "PURCHASE_CREATE", entityType: "Purchase", entityId: row._id, metadata: { purchaseNo: row.purchaseNo, quantity: row.quantity, total: row.total } });
  const populated = await Purchase.findById(row._id).populate("supplier", "name").populate("medicine", "name").populate("batch", "batchNo");
  return created(res, serializePurchase(populated));
}

export async function listSales(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 100, 100);
  const filter = dateFilter(req.query);
  if (req.query.status && req.query.status !== "All") filter.status = req.query.status;
  if (req.query.medicineId) filter.medicine = req.query.medicineId;
  if (req.query.search) {
    const expression = new RegExp(escapeRegex(req.query.search), "i");
    const matchingMedicines = await Medicine.find({ $or: [{ name: expression }, { generic: expression }] }).select("_id").lean();
    filter.$or = [
      { saleNo: expression },
      { customer: expression },
      { medicine: { $in: matchingMedicines.map((medicine) => medicine._id) } },
    ];
  }
  const [total, rows] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).populate("medicine", "name").populate("batch", "batchNo").sort({ date: -1 }).skip(skip).limit(limit),
  ]);
  return ok(res, rows.map((row) => serializeSale(row)), pageMeta(total, page, limit));
}

export async function getSale(req, res) {
  const row = await Sale.findById(req.params.id).populate("medicine", "name").populate("batch", "batchNo");
  if (!row) throw notFound("Sale not found");
  return ok(res, serializeSale(row));
}

export async function createSale(req, res) {
  const row = await recordSale(req.body, req.user._id);
  await recordAudit(req, { action: "SALE_CREATE", entityType: "Sale", entityId: row._id, metadata: { saleNo: row.saleNo, quantity: row.quantity, total: row.total } });
  const populated = await Sale.findById(row._id).populate("medicine", "name").populate("batch", "batchNo");
  return created(res, serializeSale(populated));
}

export async function refundSaleController(req, res) {
  const row = await refundSale(req.params.id, req.user._id);
  await recordAudit(req, { action: "SALE_REFUND", entityType: "Sale", entityId: row._id, metadata: { saleNo: row.saleNo } });
  return ok(res, serializeSale(row));
}

export async function adjustInventoryController(req, res) {
  const row = await adjustInventory(req.body, req.user._id);
  await recordAudit(req, { action: "INVENTORY_ADJUSTMENT", entityType: "InventoryAdjustment", entityId: row._id, metadata: { quantityDelta: row.quantityDelta, reason: row.reason } });
  return created(res, row);
}

export async function listAdjustments(req, res) {
  const { page, limit, skip } = parsePaging(req.query, 50, 100);
  const [total, rows] = await Promise.all([
    InventoryAdjustment.countDocuments(),
    InventoryAdjustment.find().populate("medicine", "name").populate("batch", "batchNo").sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);
  return ok(res, rows, pageMeta(total, page, limit));
}
