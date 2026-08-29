import { addDaysISO, daysUntil } from "../utils/formatters";
import { medicines } from "./medicines";

const today = () => new Date().toISOString().slice(0, 10);

function deriveBatchStatus(expiry, quantity, costPerUnit) {
  const days = daysUntil(expiry);
  if (days < 0) return "Expired";
  if (quantity <= 0) return "Depleted";
  if (days <= 30) return "Near Expiry";
  return "Active";
}

export const batches = () =>
  medicines
    .map((m, i) => {
      const base = today();
      const mfg = addDaysISO(base, -30 - i * 40);
      // Spread expiry across near and far ranges for variety
      const expiry = addDaysISO(base, [90, 320, 18, 400, 6, 300, 12, 45, 14, 25, 3, 75, 200, 150][i % 14]);
      const quantity = [3200, 1620, 120, 860, 380, 2650, 210, 940, 320, 1560, 45, 780, 210, 640][i % 14];
      const cost = m.unitPrice * 0.85;
      return {
        id: `bat-${String(i + 1).padStart(3, "0")}`,
        batchNo: `${m.name.split(" ")[0].slice(0, 3).toUpperCase()}-${String(2400 + i)}`,
        medicineId: m.id,
        medicineName: m.name,
        supplierId: `sup-${String((i % 5) + 1).padStart(3, "0")}`,
        manufactureDate: mfg,
        expiryDate: expiry,
        quantity,
        costPerUnit: Math.round(cost * 100) / 100,
        status: deriveBatchStatus(expiry, quantity, cost),
      };
    })
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
