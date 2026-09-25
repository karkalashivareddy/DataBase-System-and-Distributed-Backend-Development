import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, positive, validate } from "../../utils/validators";
import * as api from "../../services/api";

const BLANK = { medicineId: "", batchNo: "", manufactureDate: "", expiryDate: "", quantity: "", costPerUnit: "", supplierId: "" };

export default function BatchForm({ open, onClose, onSubmit, existing = [], busy = false }) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!open) return;
    setForm(BLANK);
    setErrors({});
    Promise.all([api.getMedicines(), api.getSuppliers()]).then(([medicineRows, supplierRows]) => {
      setMedicines(medicineRows);
      setSuppliers(supplierRows.filter((supplier) => supplier.status === "Active"));
    }).catch(() => {
      setMedicines([]);
      setSuppliers([]);
    });
  }, [open]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate({ medicineId: [required], batchNo: [required], manufactureDate: [required], expiryDate: [required], quantity: [positive], costPerUnit: [positive], supplierId: [required] }, form);
    if (form.manufactureDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.manufactureDate)) nextErrors.expiryDate = "Expiry date must be after the manufacturing date";
    if (existing.some((batch) => batch.batchNo.toLowerCase() === form.batchNo.trim().toLowerCase())) nextErrors.batchNo = "This batch number already exists";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({ medicineId: form.medicineId, batchNo: form.batchNo.trim(), manufactureDate: form.manufactureDate, expiryDate: form.expiryDate, quantity: Number(form.quantity), costPerUnit: Number(form.costPerUnit), supplierId: form.supplierId });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Batch" size="lg" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={busy}>{busy ? "Saving..." : "Add Batch"}</Button></>}>
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group"><label className="field-label">Medicine <span className="req">*</span></label><select className={`form-select ${errors.medicineId ? "error" : ""}`} value={form.medicineId} onChange={set("medicineId")}><option value="">Select medicine</option>{medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}</select>{errors.medicineId && <span className="field-error">{errors.medicineId}</span>}</div>
        <div className="field-group"><label className="field-label">Batch Number <span className="req">*</span></label><input className={`form-input ${errors.batchNo ? "error" : ""}`} value={form.batchNo} onChange={set("batchNo")} placeholder="PCM-24-A001" />{errors.batchNo && <span className="field-error">{errors.batchNo}</span>}</div>
        <div className="field-group"><label className="field-label">Manufacturing Date <span className="req">*</span></label><input className={`form-input ${errors.manufactureDate ? "error" : ""}`} type="date" value={form.manufactureDate} onChange={set("manufactureDate")} />{errors.manufactureDate && <span className="field-error">{errors.manufactureDate}</span>}</div>
        <div className="field-group"><label className="field-label">Expiry Date <span className="req">*</span></label><input className={`form-input ${errors.expiryDate ? "error" : ""}`} type="date" value={form.expiryDate} onChange={set("expiryDate")} />{errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}</div>
        <div className="field-group"><label className="field-label">Quantity <span className="req">*</span></label><input className={`form-input ${errors.quantity ? "error" : ""}`} type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} placeholder="0" />{errors.quantity && <span className="field-error">{errors.quantity}</span>}</div>
        <div className="field-group"><label className="field-label">Purchase Price (₹) <span className="req">*</span></label><input className={`form-input ${errors.costPerUnit ? "error" : ""}`} type="number" min="0.01" step="0.01" value={form.costPerUnit} onChange={set("costPerUnit")} placeholder="0.00" />{errors.costPerUnit && <span className="field-error">{errors.costPerUnit}</span>}</div>
        <div className="field-group"><label className="field-label">Supplier <span className="req">*</span></label><select className={`form-select ${errors.supplierId ? "error" : ""}`} value={form.supplierId} onChange={set("supplierId")}><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>{errors.supplierId && <span className="field-error">{errors.supplierId}</span>}</div>
      </form>
    </Modal>
  );
}
