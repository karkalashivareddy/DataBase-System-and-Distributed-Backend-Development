import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";
import Batch from "../models/Batch.js";
import { serializeSupplier } from "../utils/serializers.js";

export async function getSupplierMetrics() {
  const [suppliers, purchases, batches] = await Promise.all([
    Supplier.find().lean(),
    Purchase.find().lean(),
    Batch.find().lean(),
  ]);
  const metrics = new Map();
  for (const supplier of suppliers) {
    const related = purchases.filter((purchase) => String(purchase.supplier) === String(supplier._id));
    const relatedBatches = batches.filter((batch) => String(batch.supplier) === String(supplier._id));
    const paid = related.filter((purchase) => purchase.status === "Paid").length;
    metrics.set(String(supplier._id), {
      medicinesSupplied: new Set(related.map((purchase) => String(purchase.medicine))).size,
      outstanding: related.reduce((total, purchase) => total + Math.max(0, Number(purchase.total || 0) - Number(purchase.paidAmount || 0)), 0),
      reliability: related.length ? Math.round((paid / related.length) * 100) : supplier.status === "Active" ? 100 : 0,
    });
  }
  return suppliers.map((supplier) => serializeSupplier(supplier, metrics.get(String(supplier._id))));
}
