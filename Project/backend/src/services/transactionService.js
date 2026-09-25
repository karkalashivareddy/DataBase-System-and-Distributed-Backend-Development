import crypto from "node:crypto";
import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import Medicine from "../models/Medicine.js";
import Notification from "../models/Notification.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";
import Supplier from "../models/Supplier.js";
import InventoryAdjustment from "../models/InventoryAdjustment.js";
import { PURCHASE_STATUSES } from "../constants.js";
import { AppError, badRequest, conflict, notFound } from "../utils/errors.js";

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function documentNumber(prefix) {
  return `${prefix}-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function atomic(work) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error?.code === 20 || /transaction numbers are only allowed|replica set/i.test(error?.message || "")) {
      throw new AppError("This operation requires MongoDB replica-set transactions", { status: 503, code: "TRANSACTIONS_REQUIRED" });
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export function sortFefoBatches(batches) {
  return [...batches].sort((left, right) => new Date(left.expiryDate) - new Date(right.expiryDate) || new Date(left.createdAt || 0) - new Date(right.createdAt || 0) || String(left._id).localeCompare(String(right._id)));
}

export async function recordPurchase(input, userId) {
  const quantity = Number(input.quantity);
  const unitCost = input.unitCost === undefined ? undefined : roundMoney(input.unitCost);
  const paidAmount = input.paidAmount === undefined ? undefined : roundMoney(input.paidAmount);
  const result = await atomic(async (session) => {
    const [medicine, supplier, batch] = await Promise.all([
      Medicine.findById(input.medicineId).session(session),
      Supplier.findById(input.supplierId).session(session),
      Batch.findById(input.batchId).session(session),
    ]);
    if (!medicine) throw notFound("Medicine not found");
    if (!supplier) throw notFound("Supplier not found");
    if (!batch) throw notFound("Batch not found");
    if (String(batch.medicine) !== String(medicine._id)) throw badRequest("Batch does not belong to the selected medicine");
    if (String(batch.supplier) !== String(supplier._id)) throw badRequest("Batch does not belong to the selected supplier");
    if (batch.expiryDate < startOfDay()) throw badRequest("Expired batches cannot receive stock");
    if (!Number.isInteger(quantity) || quantity < 1) throw badRequest("Quantity must be a positive integer");
    const cost = unitCost === undefined ? roundMoney(batch.costPerUnit) : unitCost;
    if (!Number.isFinite(cost) || cost < 0) throw badRequest("Unit cost must be a valid non-negative number");
    const oldQuantity = batch.quantity;
    const newQuantity = oldQuantity + quantity;
    const newCost = roundMoney(((oldQuantity * batch.costPerUnit) + (quantity * cost)) / newQuantity);
    batch.quantity = newQuantity;
    batch.costPerUnit = newCost;
    await batch.save({ session });
    const total = roundMoney(quantity * cost);
    if (input.status !== undefined && !PURCHASE_STATUSES.includes(input.status)) throw badRequest("Invalid purchase status");
    if (paidAmount !== undefined && paidAmount < 0) throw badRequest("Paid amount cannot be negative");
    if (paidAmount !== undefined && paidAmount > total) throw badRequest("Paid amount cannot exceed the purchase total");
    if (input.status === "Paid" && paidAmount !== undefined && paidAmount < total) throw badRequest("A paid purchase must have a paid amount equal to its total");
    if (input.status === "Pending" && paidAmount > 0) throw badRequest("A pending purchase cannot have a paid amount");
    if (input.status === "Partially Paid" && !(paidAmount > 0 && paidAmount < total)) throw badRequest("A partially paid purchase requires a partial paid amount");
    const status = input.status || (paidAmount === undefined ? "Paid" : paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Pending");
    const purchase = await Purchase.create([{
      purchaseNo: documentNumber("PO"),
      supplier: supplier._id,
      medicine: medicine._id,
      batch: batch._id,
      quantity,
      unitCost: cost,
      total,
      paidAmount: paidAmount === undefined ? (status === "Paid" ? total : 0) : paidAmount,
      date: input.date || new Date(),
      status,
      notes: input.notes || "",
      createdBy: userId,
    }], { session });
    await Notification.create([{
      type: "purchase",
      title: `Purchase received — ${supplier.name}`,
      message: `${quantity} units of ${medicine.name} were added to ${batch.batchNo}.`,
      entityType: "Purchase",
      entityId: purchase[0]._id,
    }], { session });
    return purchase[0];
  });
  return result;
}

export async function recordSale(input, userId) {
  const quantity = Number(input.quantity);
  const unitPrice = input.unitPrice === undefined ? undefined : roundMoney(input.unitPrice);
  if (!Number.isInteger(quantity) || quantity < 1) throw badRequest("Quantity must be a positive integer");
  const result = await atomic(async (session) => {
    const medicine = await Medicine.findById(input.medicineId).session(session);
    if (!medicine) throw notFound("Medicine not found");
    const price = unitPrice === undefined ? roundMoney(medicine.unitPrice) : unitPrice;
    if (!Number.isFinite(price) || price < 0) throw badRequest("Unit price must be a valid non-negative number");
    const batches = sortFefoBatches(await Batch.find({
      medicine: medicine._id,
      quantity: { $gt: 0 },
      expiryDate: { $gte: startOfDay() },
    }).session(session));
    const available = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    if (available < quantity) throw conflict("Insufficient available stock", { requested: quantity, available });
    let remaining = quantity;
    const allocations = [];
    for (const batch of batches) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, batch.quantity);
      const updated = await Batch.updateOne(
        { _id: batch._id, quantity: { $gte: take } },
        { $inc: { quantity: -take } },
        { session }
      );
      if (updated.modifiedCount !== 1) throw conflict("Stock changed while completing the sale; retry the request");
      allocations.push({ batch: batch._id, batchNo: batch.batchNo, quantity: take, unitCost: roundMoney(batch.costPerUnit) });
      remaining -= take;
    }
    if (remaining !== 0) throw conflict("Insufficient available stock", { requested: quantity, available });
    const sale = await Sale.create([{
      saleNo: documentNumber("INV"),
      medicine: medicine._id,
      batch: allocations[0].batch,
      allocations,
      quantity,
      unitPrice: price,
      total: roundMoney(quantity * price),
      customer: input.customer || "Walk-in",
      date: input.date || new Date(),
      status: "Completed",
      notes: input.notes || "",
      createdBy: userId,
    }], { session });
    await Notification.create([{
      type: "sale",
      title: `Sale completed — ${medicine.name}`,
      message: `${quantity} units were sold using FEFO allocation.`,
      entityType: "Sale",
      entityId: sale[0]._id,
    }], { session });
    return sale[0];
  });
  return result;
}

export async function refundSale(saleId, userId) {
  return atomic(async (session) => {
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) throw notFound("Sale not found");
    if (sale.status === "Refunded") throw conflict("Sale is already refunded");
    for (const allocation of sale.allocations) {
      const updated = await Batch.updateOne({ _id: allocation.batch }, { $inc: { quantity: allocation.quantity } }, { session });
      if (updated.modifiedCount !== 1) throw conflict("Could not restore sale stock");
    }
    sale.status = "Refunded";
    sale.refundedAt = new Date();
    await sale.save({ session });
    await Notification.create([{
      type: "sale",
      title: `Sale refunded — ${sale.saleNo}`,
      message: `${sale.quantity} units were returned to their original batches.`,
      entityType: "Sale",
      entityId: sale._id,
    }], { session });
    return sale;
  });
}

export async function adjustInventory(input, userId) {
  const delta = Number(input.quantityDelta);
  if (!Number.isInteger(delta) || delta === 0) throw badRequest("Quantity adjustment must be a non-zero integer");
  return atomic(async (session) => {
    const [medicine, batch] = await Promise.all([
      Medicine.findById(input.medicineId).session(session),
      Batch.findById(input.batchId).session(session),
    ]);
    if (!medicine) throw notFound("Medicine not found");
    if (!batch) throw notFound("Batch not found");
    if (String(batch.medicine) !== String(medicine._id)) throw badRequest("Batch does not belong to the selected medicine");
    if (batch.quantity + delta < 0) throw conflict("Adjustment would make batch quantity negative", { current: batch.quantity, delta });
    batch.quantity += delta;
    await batch.save({ session });
    return InventoryAdjustment.create([{
      medicine: medicine._id,
      batch: batch._id,
      quantityDelta: delta,
      reason: input.reason,
      note: input.note || "",
      createdBy: userId,
    }], { session }).then(([adjustment]) => adjustment);
  });
}
