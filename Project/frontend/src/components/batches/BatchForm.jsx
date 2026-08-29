import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, positive, validate } from "../../utils/validators";
import * as api from "../../services/api";

const BLANK = {
  medicineId: "",
  batchNo: "",
  manufactureDate: "",
  expiryDate: "",
  quantity: "",
  purchasePrice: "",
  supplierId: "",
};

export default function BatchForm({ open, onClose, onSubmit, existing }) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    if (open) {
      setForm(BLANK);
      setErrors({});
      api.getMedicines().then((m) => {
        setMedicines(m);
        setForm((f) => (f.medicineId ? f : { ...f, medicineId: m[0]?.id || "" }));
      });
    }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(
      {
        medicineId: [required],
        batchNo: [required],
        manufactureDate: [required],
        expiryDate: [required],
        quantity: [positive],
        purchasePrice: [positive],
        supplierId: [required],
      },
      form
    );

    if (form.manufactureDate && form.expiryDate) {
      if (new Date(form.expiryDate) <= new Date(form.manufactureDate)) {
        errs.expiryDate = "Expiry date must be after the manufacturing date";
      }
    }

    if (existing && existing.some((b) => b.batchNo.toLowerCase() === form.batchNo.trim().toLowerCase())) {
      errs.batchNo = "This batch number already exists";
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    const selected = medicines.find((m) => m.id === form.medicineId);
    onSubmit({
      ...form,
      medicineName: selected?.name || "",
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Batch"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Add Batch</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group">
          <label className="field-label">Medicine <span className="req">*</span></label>
          <select className={`form-select ${errors.medicineId ? "error" : ""}`} value={form.medicineId} onChange={set("medicineId")}>
            <option value="">Select medicine</option>
            {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {errors.medicineId && <span className="field-error">{errors.medicineId}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Batch Number <span className="req">*</span></label>
          <input className={`form-input ${errors.batchNo ? "error" : ""}`} value={form.batchNo} onChange={set("batchNo")} placeholder="PCM-24-A001" />
          {errors.batchNo && <span className="field-error">{errors.batchNo}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Manufacturing Date <span className="req">*</span></label>
          <input className={`form-input ${errors.manufactureDate ? "error" : ""}`} type="date" value={form.manufactureDate} onChange={set("manufactureDate")} />
          {errors.manufactureDate && <span className="field-error">{errors.manufactureDate}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Expiry Date <span className="req">*</span></label>
          <input className={`form-input ${errors.expiryDate ? "error" : ""}`} type="date" value={form.expiryDate} onChange={set("expiryDate")} />
          {errors.expiryDate && <span className="field-error">{errors.expiryDate}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Quantity <span className="req">*</span></label>
          <input className={`form-input ${errors.quantity ? "error" : ""}`} type="number" value={form.quantity} onChange={set("quantity")} placeholder="0" />
          {errors.quantity && <span className="field-error">{errors.quantity}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Purchase Price (₹) <span className="req">*</span></label>
          <input className={`form-input ${errors.purchasePrice ? "error" : ""}`} type="number" value={form.purchasePrice} onChange={set("purchasePrice")} placeholder="0.00" />
          {errors.purchasePrice && <span className="field-error">{errors.purchasePrice}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Supplier <span className="req">*</span></label>
          <input className={`form-input ${errors.supplierId ? "error" : ""}`} value={form.supplierId} onChange={set("supplierId")} placeholder="SUP-001" />
          {errors.supplierId && <span className="field-error">{errors.supplierId}</span>}
        </div>
      </form>
    </Modal>
  );
}
