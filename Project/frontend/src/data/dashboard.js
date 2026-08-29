// Simulated dashboard data.
// This is frontend demo data only. It is intentionally self-contained for the
// dashboard milestone and does not claim to reflect real production inventory.

export function getKpis() {
  return {
    totalMedicines: {
      value: 1284,
      delta: "+8.4%",
      trend: "up",
      label: "vs last month",
    },
    totalStockUnits: {
      value: 48920,
      delta: "+5.7%",
      trend: "up",
      label: "vs last month",
    },
    lowStock: {
      value: 37,
      delta: "Needs attention",
      trend: "neutral",
      label: "below reorder level",
    },
    nearExpiry: {
      value: 24,
      delta: "Within 30 days",
      trend: "neutral",
      label: "batches expiring",
    },
    inventoryValue: {
      value: 1842000,
      delta: "+6.2%",
      trend: "up",
      label: "vs last month",
    },
    monthlySales: {
      value: 784000,
      delta: "+12.8%",
      trend: "up",
      label: "vs last month",
    },
  };
}

export function getSalesTrend() {
  return [
    { month: "Jan", sales: 410000, purchases: 330000 },
    { month: "Feb", sales: 460000, purchases: 360000 },
    { month: "Mar", sales: 520000, purchases: 400000 },
    { month: "Apr", sales: 480000, purchases: 420000 },
    { month: "May", sales: 560000, purchases: 440000 },
    { month: "Jun", sales: 610000, purchases: 460000 },
    { month: "Jul", sales: 680000, purchases: 500000 },
    { month: "Aug", sales: 784000, purchases: 540000 },
  ];
}

export function getCategoryDistribution() {
  return [
    { name: "Antibiotics", value: 17840 },
    { name: "Analgesics", value: 12680 },
    { name: "Cardiovascular", value: 8120 },
    { name: "Diabetes", value: 6320 },
    { name: "Vitamins", value: 2960 },
    { name: "Other", value: 1000 },
  ];
}

export function getStockHealth() {
  return {
    healthy: 72,
    lowStock: 15,
    critical: 8,
    expired: 5,
  };
}

export function getExpiryTimeline() {
  return [
    { range: "0–7 days", count: 6 },
    { range: "8–15 days", count: 8 },
    { range: "16–30 days", count: 10 },
    { range: "31–60 days", count: 15 },
    { range: "60+ days", count: 42 },
  ];
}

// Small representative demo list used by the dashboard low-stock panel.
// These are illustrative rows, not the full medicine catalog (which ships with
// the inventory milestone).
export function getLowStockAlerts() {
  return [
    { id: "low-1", name: "Paracetamol 500mg", generic: "Paracetamol", stock: 120, reorderLevel: 400, severity: "critical" },
    { id: "low-2", name: "Azithromycin 500mg", generic: "Azithromycin", stock: 60, reorderLevel: 200, severity: "critical" },
    { id: "low-3", name: "Metformin 500mg", generic: "Metformin", stock: 180, reorderLevel: 350, severity: "warning" },
    { id: "low-4", name: "Pantoprazole 40mg", generic: "Pantoprazole", stock: 90, reorderLevel: 250, severity: "warning" },
    { id: "low-5", name: "Atorvastatin 20mg", generic: "Atorvastatin", stock: 210, reorderLevel: 300, severity: "warning" },
  ];
}

// Representative demo rows for the "expiring soon" dashboard panel.
// These are illustrative batches, not the full batch ledger.
export function getExpiringSoon() {
  return [
    { id: "exp-1", batchNo: "PARA-9001", medicineName: "Paracetamol 500mg", expiryDate: "04 Sep 2026", days: 6 },
    { id: "exp-2", batchNo: "AZX-3307", medicineName: "Azithromycin 500mg", expiryDate: "12 Sep 2026", days: 14 },
    { id: "exp-3", batchNo: "MET-5502", medicineName: "Metformin 500mg", expiryDate: "20 Sep 2026", days: 22 },
    { id: "exp-4", batchNo: "PAN-2210", medicineName: "Pantoprazole 40mg", expiryDate: "30 Sep 2026", days: 32 },
    { id: "exp-5", batchNo: "ATO-8840", medicineName: "Atorvastatin 20mg", expiryDate: "12 Oct 2026", days: 44 },
  ];
}

export function getNotifications() {
  return [
    {
      id: "ls-1",
      type: "low",
      title: "Low stock — Paracetamol 500mg",
      message: "Stock dropped to 120 units (reorder at 400).",
      time: "5 min ago",
    },
    {
      id: "ne-1",
      type: "expiry",
      title: "Near expiry — Batch AZX-3307",
      message: "Azithromycin 500mg expires in 14 days.",
      time: "24 min ago",
    },
    {
      id: "pu-1",
      type: "purchase",
      title: "Purchase received — Medico Distributors",
      message: "PO-2025-2204 marked as received.",
      time: "1 hour ago",
    },
    {
      id: "th-1",
      type: "system",
      title: "Stock threshold reached",
      message: "3 medicines crossed their reorder threshold today.",
      time: "3 hours ago",
    },
  ];
}

// Searchable index for the global search trigger (self-contained to dashboard
// demo data until the inventory modules land).
export function getSearchIndex() {
  return [
    { id: "s1", label: "Paracetamol 500mg", sub: "Analgesics", kind: "Medicine" },
    { id: "s2", label: "Azithromycin 500mg", sub: "Antibiotics", kind: "Medicine" },
    { id: "s3", label: "Metformin 500mg", sub: "Diabetes", kind: "Medicine" },
    { id: "s4", label: "Pantoprazole 40mg", sub: "Gastro", kind: "Medicine" },
    { id: "s5", label: "Atorvastatin 20mg", sub: "Cardiovascular", kind: "Medicine" },
    { id: "b1", label: "AZX-3307", sub: "Azithromycin 500mg", kind: "Batch" },
    { id: "b2", label: "PARA-9001", sub: "Paracetamol 500mg", kind: "Batch" },
  ];
}
