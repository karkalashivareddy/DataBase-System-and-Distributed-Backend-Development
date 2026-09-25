import { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, positive, validate } from "../../utils/validators";
import { PAYMENT_STATUS } from "../../utils/constants";
import * as api from "../../services/api";

function today() { return new Date().toISOString().slice(0, 10); }
function blankForm(kind, initial = {}) {
  return { medicineId: initial.medicineId || initial.medicine || "", supplierId: initial.supplierId || initial.supplier || "", batchId: initial.batchId || "", quantity: initial.suggested || initial.quantity || "", unitCost: initial.unitCost || initial.unitPrice || "", customer: initial.customer || "", status: kind === "purchase" ? "Paid" : "Completed", date: today() };
}

export default function TransactionForm({ open, onClose, onSubmit, kind, initial }) {
  const [form, setForm] = useState(() => blankForm(kind, initial));
  const [errors, setErrors] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const isPurchase = kind === "purchase";

  useEffect(() => {
    if (!open) return;
    setForm(blankForm(kind, initial));
    setErrors({});
    Promise.all([api.getMedicines(), api.getSuppliers(), api.getBatches()]).then(([medicineRows, supplierRows, batchRows]) => {
      setMedicines(medicineRows);
      setSuppliers(supplierRows.filter((supplier) => supplier.status === "Active"));
      setBatches(batchRows.filter((batch) => batch.quantity > 0 && batch.expiryDate >= today() && batch.status !== "Expired"));
    }).catch(() => {
      setMedicines([]);
      setSuppliers([]);
      setBatches([]);
    });
  }, [open, kind, initial]);

  const selectedMed = useMemo(() => medicines.find((medicine) => medicine.id === form.medicineId), [medicines, form.medicineId]);
  const availableBatches = useMemo(() => batches.filter((batch) => batch.medicineId === form.medicineId), [batches, form.medicineId]);
  const selectedBatch = availableBatches.find((batch) => batch.id === form.batchId);
  const effectivePrice = form.unitCost || selectedBatch?.costPerUnit || selectedMed?.unitPrice || 0;
  const total = (Number(form.quantity) || 0) * (Number(effectivePrice) || 0);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const changeMedicine = (event) => {
    const medicineId = event.target.value;
    const nextBatch = batches.find((batch) => batch.medicineId === medicineId && batch.quantity > 0 && batch.expiryDate >= today());
    const nextMedicine = medicines.find((medicine) => medicine.id === medicineId);
    setForm((current) => ({ ...current, medicineId, batchId: isPurchase ? nextBatch?.id || "" : "", unitCost: isPurchase ? nextBatch?.costPerUnit ?? nextMedicine?.unitPrice ?? "" : current.unitCost }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ medicineId: [required], quantity: [positive], ...(isPurchase ? { unitCost: [positive], supplierId: [required], batchId: [required] } : { customer: [required] }) }, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      await onSubmit({ medicineId: form.medicineId, quantity: Number(form.quantity), ...(isPurchase ? { supplierId: form.supplierId, batchId: form.batchId, unitCost: Number(form.unitCost), status: form.status, date: form.date } : { unitPrice: Number(effectivePrice), customer: form.customer, date: form.date }) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isPurchase ? "Record Purchase" : "Record Sale"} size="lg" footer={<><Button data-testid="transaction-cancel" variant="ghost" onClick={onClose}>Cancel</Button><Button data-testid="transaction-submit" onClick={submit} disabled={submitting}>{submitting ? "Saving..." : isPurchase ? "Record Purchase" : "Record Sale"}</Button></>}>
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group"><label className="field-label">Medicine <span className="req">*</span></label><select data-testid="transaction-medicine" className={`form-select ${errors.medicineId ? "error" : ""}`} value={form.medicineId} onChange={changeMedicine}><option value="">Select medicine</option>{medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}</select>{errors.medicineId && <span className="field-error">{errors.medicineId}</span>}</div>
        {isPurchase ? <>
          <div className="field-group"><label className="field-label">Batch <span className="req">*</span></label><select data-testid="transaction-batch" className={`form-select ${errors.batchId ? "error" : ""}`} value={form.batchId} onChange={set("batchId")}><option value="">Select active batch</option>{availableBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchNo} · {batch.quantity} units</option>)}</select>{errors.batchId && <span className="field-error">{errors.batchId}</span>}</div>
          <div className="field-group"><label className="field-label">Supplier <span className="req">*</span></label><select data-testid="transaction-supplier" className={`form-select ${errors.supplierId ? "error" : ""}`} value={form.supplierId} onChange={set("supplierId")}><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>{errors.supplierId && <span className="field-error">{errors.supplierId}</span>}</div>
        </> : <div className="field-group"><label className="field-label">Customer / Reference <span className="req">*</span></label><input data-testid="transaction-customer" className={`form-input ${errors.customer ? "error" : ""}`} value={form.customer} onChange={set("customer")} placeholder="City Meds" />{errors.customer && <span className="field-error">{errors.customer}</span>}</div>}
        <div className="field-group"><label className="field-label">Quantity <span className="req">*</span></label><input data-testid="transaction-quantity" className={`form-input ${errors.quantity ? "error" : ""}`} type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} placeholder="0" />{errors.quantity && <span className="field-error">{errors.quantity}</span>}</div>
        <div className="field-group"><label className="field-label">Unit {isPurchase ? "Cost" : "Price"} (₹)</label><input data-testid="transaction-unit-price" className={`form-input ${errors.unitCost || errors.unitPrice ? "error" : ""}`} type="number" min="0.01" step="0.01" value={form.unitCost} onChange={set("unitCost")} placeholder={selectedMed?.unitPrice || "0.00"} />{(errors.unitCost || errors.unitPrice) && <span className="field-error">{errors.unitCost || errors.unitPrice}</span>}{!isPurchase && selectedMed && <span className="form-hint">Default price: ₹{selectedMed.unitPrice}</span>}</div>
        {isPurchase && <div className="field-group"><label className="field-label">Date</label><input className="form-input" type="date" value={form.date} onChange={set("date")} /></div>}
        {isPurchase ? <div className="field-group"><label className="field-label">Payment Status</label><select className="form-select" value={form.status} onChange={set("status")}>{PAYMENT_STATUS.map((status) => <option key={status}>{status}</option>)}</select></div> : <div className="field-group"><label className="field-label">Date</label><input className="form-input" type="date" value={form.date} onChange={set("date")} /></div>}
        <div className="field-group" style={{ gridColumn: "1 / -1" }}><div className="card" style={{ background: "var(--surface-alt)" }}><div className="flex-between"><span className="muted">Total Amount</span><span className="bold" style={{ fontSize: 20, fontFamily: "var(--font-display)" }}>₹{total.toFixed(2)}</span></div>{!isPurchase && <span className="form-hint">Stock is allocated using FEFO; earliest-expiry batches are consumed first.</span>}</div></div>
      </form>
    </Modal>
  );
}
