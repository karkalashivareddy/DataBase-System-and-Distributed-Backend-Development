import Batch from "../models/Batch.js";
import Medicine from "../models/Medicine.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import Supplier from "../models/Supplier.js";
import { badRequest } from "../utils/errors.js";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function monthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return `${monthNames[month - 1]} ${year}`;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export async function getStockByMedicine(asOf = new Date()) {
  const rows = await Batch.aggregate([
    { $match: { expiryDate: { $gte: startOfDay(asOf) }, quantity: { $gt: 0 } } },
    { $group: { _id: "$medicine", stock: { $sum: "$quantity" }, value: { $sum: { $multiply: ["$quantity", "$costPerUnit"] } } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row]));
}

export async function getDashboardData() {
  const now = new Date();
  const [medicines, suppliers, stockRows, recentBatches, sales, purchases] = await Promise.all([
    Medicine.find().lean(),
    Supplier.find().lean(),
    getStockByMedicine(now),
    Batch.find({ expiryDate: { $gte: startOfDay(now) }, quantity: { $gt: 0 } }).select("batchNo medicine supplier expiryDate quantity").populate("medicine", "name").populate("supplier", "name").lean(),
    Sale.find({ status: "Completed" }).sort({ date: -1 }).limit(500).lean(),
    Purchase.find().sort({ date: -1 }).limit(500).lean(),
  ]);
  const stock = new Map();
  for (const medicine of medicines) {
    const row = stockRows.get(String(medicine._id));
    stock.set(String(medicine._id), { quantity: row?.stock || 0, value: row?.value || 0 });
  }
  const totalStockUnits = [...stock.values()].reduce((total, row) => total + row.quantity, 0);
  const inventoryValue = [...stock.values()].reduce((total, row) => total + row.value, 0);
  const lowStock = medicines.filter((medicine) => (stock.get(String(medicine._id))?.quantity || 0) < medicine.reorderLevel);
  const nearExpiry = recentBatches.filter((batch) => {
    const days = Math.ceil((new Date(batch.expiryDate) - now) / 86400000);
    return days >= 0 && days <= 30;
  });
  const monthlySales = sales.filter((sale) => new Date(sale.date).getMonth() === now.getMonth() && new Date(sale.date).getFullYear() === now.getFullYear());
  const monthlySalesValue = sum(monthlySales, "total");
  const salesByMonth = new Map();
  const purchaseByMonth = new Map();
  for (const sale of sales) {
    const key = monthKey(new Date(sale.date));
    salesByMonth.set(key, (salesByMonth.get(key) || 0) + Number(sale.total || 0));
  }
  for (const purchase of purchases) {
    const key = monthKey(new Date(purchase.date));
    purchaseByMonth.set(key, (purchaseByMonth.get(key) || 0) + Number(purchase.total || 0));
  }
  const trend = [...new Set([...salesByMonth.keys(), ...purchaseByMonth.keys()])].sort().slice(-12).map((key) => ({
    month: monthLabel(key),
    sales: Math.round(salesByMonth.get(key) || 0),
    purchases: Math.round(purchaseByMonth.get(key) || 0),
  }));
  const categoryMap = new Map();
  for (const medicine of medicines) {
    const quantity = stock.get(String(medicine._id))?.quantity || 0;
    categoryMap.set(medicine.category, (categoryMap.get(medicine.category) || 0) + quantity);
  }
  const category = [...categoryMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const expiryTimeline = [
    { range: "0–7 days", count: 0 },
    { range: "8–15 days", count: 0 },
    { range: "16–30 days", count: 0 },
    { range: "31–60 days", count: 0 },
    { range: "60+ days", count: 0 },
  ];
  for (const batch of recentBatches) {
    const days = Math.ceil((new Date(batch.expiryDate) - now) / 86400000);
    const index = days <= 7 ? 0 : days <= 15 ? 1 : days <= 30 ? 2 : days <= 60 ? 3 : 4;
    expiryTimeline[index].count += 1;
  }
  const healthy = medicines.filter((medicine) => (stock.get(String(medicine._id))?.quantity || 0) >= medicine.reorderLevel).length;
  const critical = medicines.filter((medicine) => {
    const quantity = stock.get(String(medicine._id))?.quantity || 0;
    return medicine.reorderLevel > 0 && quantity < medicine.reorderLevel * 0.5;
  }).length;
  const low = lowStock.length - critical;
  return {
    kpis: {
      totalMedicines: { value: medicines.length, delta: "Current catalogue", trend: "neutral", label: "medicines" },
      totalStockUnits: { value: totalStockUnits, delta: "Sellable units", trend: "neutral", label: "across active batches" },
      lowStock: { value: lowStock.length, delta: "Needs attention", trend: "neutral", label: "below reorder level" },
      nearExpiry: { value: nearExpiry.length, delta: "Within 30 days", trend: "neutral", label: "batches expiring" },
      inventoryValue: { value: Math.round(inventoryValue * 100) / 100, delta: "Current cost value", trend: "neutral", label: "active stock" },
      monthlySales: { value: Math.round(monthlySalesValue * 100) / 100, delta: "Current month", trend: "neutral", label: "completed sales" },
    },
    salesTrend: trend,
    category,
    stockHealth: { healthy, lowStock: low, critical, expired: await Batch.countDocuments({ expiryDate: { $lt: startOfDay(now) } }) },
    expiryTimeline,
    lowStockAlerts: lowStock.map((medicine) => {
      const quantity = stock.get(String(medicine._id))?.quantity || 0;
      return { id: String(medicine._id), name: medicine.name, generic: medicine.generic, stock: quantity, reorderLevel: medicine.reorderLevel, severity: quantity < medicine.reorderLevel * 0.5 ? "critical" : "warning" };
    }),
    expiringSoon: nearExpiry.map((batch) => ({ id: String(batch._id), batchNo: batch.batchNo, medicineName: batch.medicine?.name || "Unknown", expiryDate: batch.expiryDate, days: Math.ceil((new Date(batch.expiryDate) - now) / 86400000) })),
    notifications: [],
    searchIndex: [],
  };
}

export async function getAnalytics({ from, to }) {
  const start = from ? new Date(from) : new Date(Date.now() - 90 * 86400000);
  const end = to ? new Date(to) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw badRequest("Invalid analytics date range");
  const [sales, purchases, medicines, batches, suppliers] = await Promise.all([
    Sale.find({ date: { $gte: start, $lte: end }, status: "Completed" }).populate("medicine", "name category").lean(),
    Purchase.find({ date: { $gte: start, $lte: end } }).lean(),
    Medicine.find().lean(),
    Batch.find({ expiryDate: { $gte: startOfDay() }, quantity: { $gt: 0 } }).populate("medicine", "name category").lean(),
    Supplier.find().lean(),
  ]);
  const salesByMonth = new Map();
  const purchaseByMonth = new Map();
  for (const sale of sales) {
    const key = monthKey(new Date(sale.date));
    salesByMonth.set(key, (salesByMonth.get(key) || 0) + Number(sale.total || 0));
  }
  for (const purchase of purchases) {
    const key = monthKey(new Date(purchase.date));
    purchaseByMonth.set(key, (purchaseByMonth.get(key) || 0) + Number(purchase.total || 0));
  }
  const trend = [...new Set([...salesByMonth.keys(), ...purchaseByMonth.keys()])].sort().map((key) => ({ month: monthLabel(key), sales: salesByMonth.get(key) || 0, purchases: purchaseByMonth.get(key) || 0 }));
  const revenue = sum(sales, "total");
  const cogs = sales.reduce((total, sale) => total + (sale.allocations || []).reduce((saleTotal, allocation) => saleTotal + Number(allocation.quantity || 0) * Number(allocation.unitCost || 0), 0), 0);
  const grossProfit = roundMoney(revenue - cogs);
  const inventoryValue = batches.reduce((total, batch) => total + batch.quantity * batch.costPerUnit, 0);
  const medicineMap = new Map(medicines.map((medicine) => [String(medicine._id), medicine]));
  const salesByMedicine = new Map();
  for (const sale of sales) {
    const id = String(sale.medicine?._id || sale.medicine);
    const current = salesByMedicine.get(id) || { name: sale.medicine?.name || medicineMap.get(id)?.name || "Unknown", value: 0 };
    current.value += Number(sale.total || 0);
    salesByMedicine.set(id, current);
  }
  const topSelling = [...salesByMedicine.values()].sort((a, b) => b.value - a.value).slice(0, 6);
  const slowMoving = [...salesByMedicine.values()].sort((a, b) => a.value - b.value).slice(0, 5);
  const categoryMap = new Map();
  for (const batch of batches) {
    const categoryName = batch.medicine?.category || medicineMap.get(String(batch.medicine?._id || batch.medicine))?.category || "Other";
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + batch.quantity);
  }
  const supplierPerformance = suppliers.map((supplier) => {
    const related = purchases.filter((purchase) => String(purchase.supplier) === String(supplier._id));
    const paid = related.filter((purchase) => purchase.status === "Paid").length;
    return { name: supplier.name, active: related.length ? Math.round((paid / related.length) * 100) : supplier.status === "Active" ? 100 : 0 };
  });
  const risk = [
    { label: "0–7 days", value: batches.filter((batch) => { const d = Math.ceil((new Date(batch.expiryDate) - new Date()) / 86400000); return d >= 0 && d <= 7; }).length, color: "#f87171" },
    { label: "8–30 days", value: batches.filter((batch) => { const d = Math.ceil((new Date(batch.expiryDate) - new Date()) / 86400000); return d > 7 && d <= 30; }).length, color: "#fbbf24" },
    { label: "31–60 days", value: batches.filter((batch) => { const d = Math.ceil((new Date(batch.expiryDate) - new Date()) / 86400000); return d > 30 && d <= 60; }).length, color: "#38bdf8" },
    { label: "60+ days", value: batches.filter((batch) => Math.ceil((new Date(batch.expiryDate) - new Date()) / 86400000) > 60).length, color: "#34d399" },
  ];
  const stock = new Map();
  for (const batch of batches) {
    const id = String(batch.medicine?._id || batch.medicine);
    stock.set(id, (stock.get(id) || 0) + batch.quantity);
  }
  const lowStock = medicines.filter((medicine) => (stock.get(String(medicine._id)) || 0) < medicine.reorderLevel);
  return {
    summary: {
      revenue: roundMoney(revenue),
      cogs: roundMoney(cogs),
      grossProfit,
      grossMargin: revenue ? (grossProfit / revenue) * 100 : 0,
      inventoryValue: roundMoney(inventoryValue),
      turnover: revenue / (inventoryValue || 1),
      lowStock: lowStock.length,
    },
    trend,
    topSelling,
    slowMoving,
    category: [...categoryMap.entries()].map(([name, value]) => ({ name, value })),
    supplierPerformance,
    expiryRisk: risk,
  };
}
