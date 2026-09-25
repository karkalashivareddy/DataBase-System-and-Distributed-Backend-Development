export function initials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";
}

function idOf(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id || value.id) return String(value._id || value.id);
  return String(value);
}

function refName(value, fallback = "Unknown") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.email || fallback;
}

function dateOnly(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export function batchStatus(batch, now = new Date()) {
  const expiry = new Date(batch.expiryDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.round((expiry - today) / 86400000);
  if (days < 0) return "Expired";
  if (Number(batch.quantity) <= 0) return "Depleted";
  if (days <= 30) return "Near Expiry";
  return "Active";
}

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: idOf(user),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    status: user.status,
    joined: user.joined || user.createdAt,
    avatar: initials(user.name),
  };
}

export function serializeMedicine(medicine, stock = 0) {
  if (!medicine) return null;
  return {
    id: idOf(medicine),
    name: medicine.name,
    generic: medicine.generic,
    category: medicine.category,
    manufacturer: medicine.manufacturer,
    dosage: medicine.dosage || "",
    unitPrice: Number(medicine.unitPrice || 0),
    reorderLevel: Number(medicine.reorderLevel || 0),
    stock: Number(stock || 0),
    createdAt: medicine.createdAt,
    updatedAt: medicine.updatedAt,
  };
}

export function serializeSupplier(supplier, metrics = {}) {
  if (!supplier) return null;
  return {
    id: idOf(supplier),
    name: supplier.name,
    contact: supplier.contact,
    email: supplier.email || "",
    phone: supplier.phone || "",
    status: supplier.status,
    medicinesSupplied: Number(metrics.medicinesSupplied || 0),
    outstanding: Number(metrics.outstanding || 0),
    reliability: Number(metrics.reliability || 0),
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

export function serializeBatch(batch, references = {}) {
  if (!batch) return null;
  const medicine = references.medicine || batch.medicine;
  const supplier = references.supplier || batch.supplier;
  return {
    id: idOf(batch),
    batchNo: batch.batchNo,
    medicineId: idOf(medicine),
    medicineName: refName(medicine),
    supplierId: idOf(supplier),
    supplierName: refName(supplier),
    manufactureDate: dateOnly(batch.manufactureDate),
    expiryDate: dateOnly(batch.expiryDate),
    quantity: Number(batch.quantity || 0),
    costPerUnit: Number(batch.costPerUnit || 0),
    status: batchStatus(batch),
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };
}

export function serializePurchase(purchase, references = {}) {
  if (!purchase) return null;
  const supplier = references.supplier || purchase.supplier;
  const medicine = references.medicine || purchase.medicine;
  const batch = references.batch || purchase.batch;
  return {
    id: idOf(purchase),
    purchaseNo: purchase.purchaseNo,
    supplierId: idOf(supplier),
    supplier: refName(supplier),
    medicineId: idOf(medicine),
    medicine: refName(medicine),
    batchId: idOf(batch),
    batch: refName(batch, batch?.batchNo || "Unknown"),
    quantity: Number(purchase.quantity || 0),
    unitCost: Number(purchase.unitCost || 0),
    total: Number(purchase.total || 0),
    date: purchase.date,
    status: purchase.status,
    paidAmount: Number(purchase.paidAmount || 0),
    notes: purchase.notes || "",
    createdAt: purchase.createdAt,
  };
}

export function serializeSale(sale, references = {}) {
  if (!sale) return null;
  const medicine = references.medicine || sale.medicine;
  const batch = references.batch || sale.batch;
  const allocations = (sale.allocations || []).map((allocation) => ({
    batchId: idOf(allocation.batch),
    batchNo: allocation.batchNo || refName(allocation.batch, "Unknown"),
    quantity: Number(allocation.quantity || 0),
    unitCost: Number(allocation.unitCost || 0),
  }));
  return {
    id: idOf(sale),
    saleNo: sale.saleNo,
    medicineId: idOf(medicine),
    medicine: refName(medicine),
    batchId: idOf(batch),
    batch: refName(batch, batch?.batchNo || allocations.map((a) => a.batchNo).join(", ") || "Unknown"),
    allocations,
    quantity: Number(sale.quantity || 0),
    unitPrice: Number(sale.unitPrice || 0),
    total: Number(sale.total || 0),
    customer: sale.customer || "Walk-in",
    date: sale.date,
    status: sale.status,
    createdAt: sale.createdAt,
  };
}

export function serializeNotification(notification) {
  return {
    id: idOf(notification),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId ? String(notification.entityId) : null,
    read: Boolean(notification.read),
    time: notification.createdAt,
    createdAt: notification.createdAt,
  };
}

export function serializeAudit(log) {
  return {
    id: idOf(log),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId ? String(log.entityId) : null,
    actorId: log.actorId ? String(log.actorId) : null,
    actorEmail: log.actorEmail || "",
    metadata: log.metadata || {},
    ipAddress: log.ipAddress || "",
    createdAt: log.createdAt,
  };
}
