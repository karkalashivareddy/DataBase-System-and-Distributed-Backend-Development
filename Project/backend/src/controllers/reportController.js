import { getStockByMedicine } from "../services/dashboardService.js";
import { getSupplierMetrics } from "../services/supplierService.js";
import { badRequest } from "../utils/errors.js";
import Batch from "../models/Batch.js";
import Medicine from "../models/Medicine.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import { ok } from "../utils/http.js";
import { serializeBatch, serializeMedicine, serializePurchase, serializeSale } from "../utils/serializers.js";

const REPORT_TYPES = new Set(["inventory", "sales", "purchase", "expiry", "low-stock", "supplier"]);

export async function report(req, res) {
  const type = String(req.query.type || "inventory").toLowerCase();
  if (!REPORT_TYPES.has(type)) throw badRequest("Unsupported report type");
  if (type === "inventory") {
    const [medicines, stock] = await Promise.all([Medicine.find().sort({ name: 1 }).lean(), getStockByMedicine()]);
    return ok(res, medicines.map((medicine) => serializeMedicine(medicine, stock.get(String(medicine._id))?.stock || 0)));
  }
  if (type === "sales") {
    const rows = await Sale.find().populate("medicine", "name").populate("batch", "batchNo").sort({ date: -1 }).limit(1000).lean();
    return ok(res, rows.map((row) => serializeSale(row)));
  }
  if (type === "purchase") {
    const rows = await Purchase.find().populate("supplier", "name").populate("medicine", "name").populate("batch", "batchNo").sort({ date: -1 }).limit(1000).lean();
    return ok(res, rows.map((row) => serializePurchase(row)));
  }
  if (type === "expiry") {
    const rows = await Batch.find({ expiryDate: { $lte: new Date(Date.now() + 60 * 86400000) } }).populate("medicine", "name").populate("supplier", "name").sort({ expiryDate: 1 }).lean();
    return ok(res, rows.map((row) => serializeBatch(row)));
  }
  if (type === "low-stock") {
    const [medicines, stock] = await Promise.all([Medicine.find().sort({ name: 1 }).lean(), getStockByMedicine()]);
    return ok(res, medicines.filter((medicine) => (stock.get(String(medicine._id))?.stock || 0) < medicine.reorderLevel).map((medicine) => serializeMedicine(medicine, stock.get(String(medicine._id))?.stock || 0)));
  }
  const suppliers = await getSupplierMetrics();
  return ok(res, suppliers);
}
