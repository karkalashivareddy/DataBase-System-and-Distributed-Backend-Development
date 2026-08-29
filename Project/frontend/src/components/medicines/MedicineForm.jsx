import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, positive, nonNegative, validate } from "../../utils/validators";
import { MEDICINE_CATEGORIES } from "../../utils/constants";

const BLANK = {
  name: "",
  generic: "",
  category: MEDICINE_CATEGORIES[0],
  manufacturer: "",
  dosage: "",
  unitPrice: "",
  reorderLevel: "",
  stock: "",
};

export default function MedicineForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial ? { ...BLANK, ...initial } : BLANK);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(
      {
        name: [required],
        generic: [required],
        manufacturer: [required],
        unitPrice: [positive],
        reorderLevel: [nonNegative],
        stock: [nonNegative],
      },
      form
    );
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      ...form,
      unitPrice: Number(form.unitPrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      stock: Number(form.stock) || 0,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Medicine" : "Add Medicine"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{initial ? "Save Changes" : "Add Medicine"}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group">
          <label className="field-label">Medicine Name <span className="req">*</span></label>
          <input className={`form-input ${errors.name ? "error" : ""}`} value={form.name} onChange={set("name")} placeholder="Paracetamol 500mg" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Generic Name <span className="req">*</span></label>
          <input className={`form-input ${errors.generic ? "error" : ""}`} value={form.generic} onChange={set("generic")} placeholder="Acetaminophen" />
          {errors.generic && <span className="field-error">{errors.generic}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Category</label>
          <select className="form-select" value={form.category} onChange={set("category")}>
            {MEDICINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label">Manufacturer <span className="req">*</span></label>
          <input className={`form-input ${errors.manufacturer ? "error" : ""}`} value={form.manufacturer} onChange={set("manufacturer")} placeholder="Sun Pharma" />
          {errors.manufacturer && <span className="field-error">{errors.manufacturer}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Dosage</label>
          <input className="form-input" value={form.dosage} onChange={set("dosage")} placeholder="500 mg tab" />
        </div>
        <div className="field-group">
          <label className="field-label">Unit Price (₹)</label>
          <input className={`form-input ${errors.unitPrice ? "error" : ""}`} type="number" value={form.unitPrice} onChange={set("unitPrice")} placeholder="0.00" />
          {errors.unitPrice && <span className="field-error">{errors.unitPrice}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Reorder Level</label>
          <input className={`form-input ${errors.reorderLevel ? "error" : ""}`} type="number" value={form.reorderLevel} onChange={set("reorderLevel")} placeholder="200" />
          {errors.reorderLevel && <span className="field-error">{errors.reorderLevel}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Current Stock</label>
          <input className={`form-input ${errors.stock ? "error" : ""}`} type="number" value={form.stock} onChange={set("stock")} placeholder="0" />
          {errors.stock && <span className="field-error">{errors.stock}</span>}
        </div>
      </form>
    </Modal>
  );
}
