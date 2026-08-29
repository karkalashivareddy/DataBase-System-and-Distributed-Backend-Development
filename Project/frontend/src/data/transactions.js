import { medicines } from "./medicines";
import { addDaysISO } from "../utils/formatters";

const today = () => new Date().toISOString().slice(0, 10);

const mPrice = (id) => medicines.find((m) => m.id === id)?.unitPrice || 10;

function genPurchases(base) {
  const rows = [];
  const meds = medicines;
  for (let i = 0; i < 18; i++) {
    const m = meds[i % meds.length];
    const qty = [500, 800, 1000, 300, 600, 1200, 400, 750][i % 8];
    const unitCost = Math.round(m.unitPrice * 0.82 * 100) / 100;
    const status =
      i % 6 === 0 ? "Pending" : i % 5 === 0 ? "Partially Paid" : "Paid";
    rows.push({
      id: `pur-${String(i + 1).padStart(3, "0")}`,
      purchaseNo: `PO-2025-${String(1000 + i)}`,
      supplier: ["MediCore Distributors", "PharmaLink Trading", "HealthBridge Supplies", "GlobalMed Traders"][i % 4],
      medicine: m.name,
      batch: `B-${String(2400 + i)}`,
      quantity: qty,
      unitCost,
      total: Math.round(qty * unitCost),
      date: addDaysISO(base, -(i * 9)),
      status,
    });
  }
  return rows.reverse();
}

function genSales(base) {
  const rows = [];
  const meds = medicines;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  for (let i = 0; i < 20; i++) {
    const m = meds[i % meds.length];
    const qty = [60, 120, 40, 210, 95, 150, 75, 12][i % 8];
    const unit = m.unitPrice;
    rows.push({
      id: `sal-${String(i + 1).padStart(3, "0")}`,
      saleNo: `INV-2025-${String(5000 + i)}`,
      medicine: m.name,
      batch: `B-${String(2400 + i)}`,
      quantity: qty,
      unitPrice: unit,
      total: Math.round(qty * unit),
      customer: ["City Meds", "LifeCare Pharmacy", "Apollo Retail", "Wellness Plus", "CarePoint Distributors", "Walk-in"][i % 6],
      date: addDaysISO(base, -(i * 6)),
      month: months[i % months.length],
      status: i % 9 === 0 ? "Refunded" : "Completed",
    });
  }
  return rows.reverse();
}

export const purchases = () => genPurchases(today());
export const sales = () => genSales(today());
