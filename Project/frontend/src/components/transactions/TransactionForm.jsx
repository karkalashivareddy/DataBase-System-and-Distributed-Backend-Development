import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { required, positive, nonNegative, validate } from "../../utils/validators";
import { PAYMENT_STATUS } from "../../utils/constants";
import { medicines } from "../../data/medicines";

export default function TransactionForm({ open, onClose, onSubmit, kind, initial }) {
  const [form, setForm] = useState(() => blankForm(kind, initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(blankForm(kind, initial));
      setErrors({});
    }
  }, [open, kind, initial]);

  const isPurchase = kind === "purchase";
  const selectedMed = medicines.find((m) => m.name === form.medicine);
  const suggestedPrice = selectedMed ? selectedMed.unitPrice : "";
  const effectivePrice = form.unitPrice || suggestedPrice;
  const total = (Number(form.quantity) || 0) * (Number(effectivePrice) || 0);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(
      {
        medicine: [required],
        quantity: [positive],
        unitPrice: [positive],
        ...(isPurchase ? {} : { customer: [required] }),
      },
      form
    );
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(effectivePrice),
      total,
      batch: `B-${String(2400 + Math.floor(Math.random() * 100))}`,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isPurchase ? "Record Purchase" : "Record Sale"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{isPurchase ? "Record Purchase" : "Record Sale"}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form-grid">
        <div className="field-group">
          <label className="field-label">Medicine <span className="req">*</span></label>
          <select className="form-select" value={form.medicine} onChange={set("medicine")}>
            <option value="">Select medicine</option>
            {medicines.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
          {errors.medicine && <span className="field-error">{errors.medicine}</span>}
        </div>

        {isPurchase && (
          <div className="field-group">
            <label className="field-label">Supplier</label>
            <select className="form-select" value={form.supplier} onChange={set("supplier")}>
              {["MediCore Distributors", "PharmaLink Trading", "HealthBridge Supplies", "GlobalMed Traders"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {!isPurchase && (
          <div className="field-group">
            <label className="field-label">Customer / Reference <span className="req">*</span></label>
            <input className={`form-input ${errors.customer ? "error" : ""}`} value={form.customer} onChange={set("customer")} placeholder="City Meds" />
            {errors.customer && <span className="field-error">{errors.customer}</span>}
          </div>
        )}

        <div className="field-group">
          <label className="field-label">Quantity <span className="req">*</span></label>
          <input className={`form-input ${errors.quantity ? "error" : ""}`} type="number" value={form.quantity} onChange={set("quantity")} placeholder="0" />
          {errors.quantity && <span className="field-error">{errors.quantity}</span>}
        </div>

        <div className="field-group">
          <label className="field-label">Unit {isPurchase ? "Cost" : "Price"} (₹)</label>
          <input className={`form-input ${errors.unitPrice ? "error" : ""}`} type="number" value={form.unitPrice} onChange={set("unitPrice")} placeholder={suggestedPrice || "0.00"} />
          {errors.unitPrice && <span className="field-error">{errors.unitPrice}</span>}
          {selectedMed && !form.unitPrice && (
            <span className="form-hint">Suggested: ₹{selectedMed.unitPrice}</span>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={set("date")} />
        </div>

        <div className="field-group">
          <label className="field-label">Status</label>
          <select className="form-select" value={form.status} onChange={set("status")}>
            {isPurchase
              ? PAYMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)
              : ["Completed", "Refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="field-group" style={{ gridColumn: "1 / -1" }}>
          <div className="card" style={{ background: "var(--surface-alt)" }}>
            <div className="flex-between">
              <span className="muted">Total Amount</span>
              <span className="bold" style={{ fontSize: 20, fontFamily: "var(--font-display)" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function blankForm(kind, initial) {
  return {
    medicine: initial?.medicine || "",
    supplier: initial?.supplier || "MediCore Distributors",
    quantity: initial?.suggested || "",
    unitPrice: initial?.unitPrice || "",
    customer: "",
    status: kind === "purchase" ? "Paid" : "Completed",
    date: new Date().toISOString().slice(0, 10),
  };
}
