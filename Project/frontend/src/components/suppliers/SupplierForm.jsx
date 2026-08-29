import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, email, phone, validate } from "../../utils/validators";

const BLANK = { name: "", contact: "", email: "", phone: "", status: "Active" };

export default function SupplierForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial ? { ...BLANK, ...initial } : BLANK);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(
      { name: [required], contact: [required], email: [email], phone: [phone] },
      form
    );
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Supplier" : "Add Supplier"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{initial ? "Save Changes" : "Add Supplier"}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group">
          <label className="field-label">Supplier Name <span className="req">*</span></label>
          <input className={`form-input ${errors.name ? "error" : ""}`} value={form.name} onChange={set("name")} placeholder="MediCore Distributors" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Contact Person <span className="req">*</span></label>
          <input className={`form-input ${errors.contact ? "error" : ""}`} value={form.contact} onChange={set("contact")} placeholder="Rahul Sharma" />
          {errors.contact && <span className="field-error">{errors.contact}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Email</label>
          <input className={`form-input ${errors.email ? "error" : ""}`} type="email" value={form.email} onChange={set("email")} placeholder="sales@example.in" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Phone</label>
          <input className={`form-input ${errors.phone ? "error" : ""}`} value={form.phone} onChange={set("phone")} placeholder="+91 98xxx xxxxx" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
        <div className="field-group">
          <label className="field-label">Status</label>
          <select className="form-select" value={form.status} onChange={set("status")}>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
