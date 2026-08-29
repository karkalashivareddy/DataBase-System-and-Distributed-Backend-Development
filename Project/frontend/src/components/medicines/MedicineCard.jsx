import { useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { formatINR } from "../../utils/formatters";

export default function MedicineCard({ medicine }) {
  const navigate = useNavigate();

  const ratio = medicine.stock / (medicine.reorderLevel || 1);
  const status = medicine.stock === 0 ? "Out of Stock" : ratio < 0.5 ? "Critical" : ratio < 1 ? "Low Stock" : "Healthy";

  return (
    <div
      className="card card-hover medicine-card"
      onClick={() => navigate(`/medicines/${medicine.id}`)}
      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div className="flex-between">
        <div className="detail-thumb"><Pill size={24} /></div>
        <StatusBadge status={status} />
      </div>
      <div>
        <div className="cell-primary" style={{ fontSize: 15, cursor: "pointer" }}>{medicine.name}</div>
        <div className="cell-sub">{medicine.generic} · {medicine.dosage}</div>
      </div>
      <div className="summary-strip">
        <div className="summary-item">
          <span className="si-label">Stock</span>
          <span className="si-value">{medicine.stock}</span>
        </div>
        <div className="summary-item">
          <span className="si-label">Reorder</span>
          <span className="si-value">{medicine.reorderLevel}</span>
        </div>
        <div className="summary-item" style={{ marginLeft: "auto" }}>
          <span className="si-label">Price</span>
          <span className="si-value">{formatINR(medicine.unitPrice)}</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(ratio * 100, 100)}%`, background: ratio < 0.5 ? "var(--danger)" : ratio < 1 ? "var(--warning)" : "linear-gradient(90deg, var(--accent), var(--cyan))" }} />
      </div>
    </div>
  );
}
