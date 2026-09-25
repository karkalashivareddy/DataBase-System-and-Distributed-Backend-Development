import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize, authenticate } from "../middleware/auth.js";
import { INVENTORY_ROLES, MEDICINE_CATEGORIES, READ_ROLES, SUPPLIER_STATUSES } from "../constants.js";
import { dateValue, enumValue, numberValue, objectId, optionalString, requiredString, validEmail, validateBody } from "../utils/validation.js";
import { createBatch, createMedicine, createSupplier, deleteBatch, deleteMedicine, deleteSupplier, getBatch, getMedicine, getSupplier, listBatches, listMedicines, listSuppliers, search, updateBatch, updateMedicine, updateSupplier } from "../controllers/catalogController.js";

const router = Router();
router.use(authenticate);

const medicineRules = {
  name: [(value) => requiredString(value, "name", { max: 160 })],
  generic: [(value) => requiredString(value, "generic", { max: 160 })],
  category: [(value) => enumValue(value, "category", MEDICINE_CATEGORIES)],
  manufacturer: [(value) => requiredString(value, "manufacturer", { max: 160 })],
  dosage: [(value) => optionalString(value, "dosage", { max: 80 }) || ""],
  unitPrice: [(value) => numberValue(value, "unitPrice", { min: 0 })],
  reorderLevel: [(value) => numberValue(value, "reorderLevel", { min: 0, integer: true })],
};

const batchRules = {
  medicineId: [(value) => objectId(value, "medicineId")],
  supplierId: [(value) => objectId(value, "supplierId")],
  manufactureDate: [(value) => dateValue(value, "manufactureDate")],
  expiryDate: [(value) => dateValue(value, "expiryDate")],
  quantity: [(value) => numberValue(value, "quantity", { min: 0, integer: true })],
  costPerUnit: [(value) => numberValue(value, "costPerUnit", { min: 0 })],
};

const updateMedicineRules = {
  name: [(value) => optionalString(value, "name", { max: 160 })],
  generic: [(value) => optionalString(value, "generic", { max: 160 })],
  category: [(value) => enumValue(value, "category", MEDICINE_CATEGORIES, { required: false })],
  manufacturer: [(value) => optionalString(value, "manufacturer", { max: 160 })],
  dosage: [(value) => optionalString(value, "dosage", { max: 80 }) || ""],
  unitPrice: [(value) => numberValue(value, "unitPrice", { min: 0, required: false })],
  reorderLevel: [(value) => numberValue(value, "reorderLevel", { min: 0, integer: true, required: false })],
};

const updateBatchRules = {
  medicineId: [(value) => objectId(value, "medicineId", { required: false })],
  supplierId: [(value) => objectId(value, "supplierId", { required: false })],
  manufactureDate: [(value) => dateValue(value, "manufactureDate", { required: false })],
  expiryDate: [(value) => dateValue(value, "expiryDate", { required: false })],
  quantity: [(value) => numberValue(value, "quantity", { min: 0, integer: true, required: false })],
  costPerUnit: [(value) => numberValue(value, "costPerUnit", { min: 0, required: false })],
};

const supplierRules = {
  name: [(value) => requiredString(value, "name", { max: 160 })],
  contact: [(value) => requiredString(value, "contact", { max: 120 })],
  email: [(value) => validEmail(value, "email", { required: false }) || ""],
  phone: [(value) => optionalString(value, "phone", { max: 30 }) || ""],
  status: [(value) => enumValue(value, "status", SUPPLIER_STATUSES)],
};

const updateSupplierRules = {
  name: [(value) => optionalString(value, "name", { max: 160 })],
  contact: [(value) => optionalString(value, "contact", { max: 120 })],
  email: [(value) => validEmail(value, "email", { required: false }) || ""],
  phone: [(value) => optionalString(value, "phone", { max: 30 }) || ""],
  status: [(value) => enumValue(value, "status", SUPPLIER_STATUSES, { required: false })],
};

router.get("/search", authorize(...READ_ROLES), asyncHandler(search));
router.get("/medicines", authorize(...READ_ROLES), asyncHandler(listMedicines));
router.post("/medicines", authorize(...INVENTORY_ROLES), validateBody(medicineRules), asyncHandler(createMedicine));
router.get("/medicines/:id", authorize(...READ_ROLES), asyncHandler(getMedicine));
router.patch("/medicines/:id", authorize(...INVENTORY_ROLES), validateBody(updateMedicineRules), asyncHandler(updateMedicine));
router.delete("/medicines/:id", authorize(...INVENTORY_ROLES), asyncHandler(deleteMedicine));

router.get("/batches", authorize(...READ_ROLES), asyncHandler(listBatches));
router.post("/batches", authorize(...INVENTORY_ROLES), validateBody(batchRules), asyncHandler(createBatch));
router.get("/batches/:id", authorize(...READ_ROLES), asyncHandler(getBatch));
router.patch("/batches/:id", authorize(...INVENTORY_ROLES), validateBody(updateBatchRules), asyncHandler(updateBatch));
router.delete("/batches/:id", authorize(...INVENTORY_ROLES), asyncHandler(deleteBatch));

router.get("/suppliers", authorize(...READ_ROLES), asyncHandler(listSuppliers));
router.post("/suppliers", authorize(...INVENTORY_ROLES), validateBody(supplierRules), asyncHandler(createSupplier));
router.get("/suppliers/:id", authorize(...READ_ROLES), asyncHandler(getSupplier));
router.patch("/suppliers/:id", authorize(...INVENTORY_ROLES), validateBody(updateSupplierRules), asyncHandler(updateSupplier));
router.delete("/suppliers/:id", authorize(...INVENTORY_ROLES), asyncHandler(deleteSupplier));

export default router;
