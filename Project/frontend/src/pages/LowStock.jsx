import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/common/Button";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";
import { medicines } from "../data/medicines";
import { formatNumber, formatINR } from "../utils/formatters";
import { useToast } from "../contexts/ToastContext";
import TransactionForm from "../components/transactions/TransactionForm";
import * as api from "../services/api";

export default function LowStock() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [purchaseFor, setPurchaseFor] = useState(null);

  const lowStock = useMemo(() => {
    let list = medicines
      .filter((m) => m.stock < m.reorderLevel)
      .map((m) => {
        const shortage = m.reorderLevel - m.stock;
        const suggested = Math.max(m.reorderLevel * 2 - m.stock, m.reorderLevel);
        const ratio = m.stock / m.reorderLevel;
        const severity = ratio < 0.3 ? "Critical" : "Warning";
        return { ...m, shortage, suggested, severity };
      })
      .sort((a, b) => a.ratioCheck - b.ratioCheck);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((m) => `${m.name} ${m.generic}`.toLowerCase().includes(q));
    }
    return list;
  }, [query]);

  // Can't sort by computed property via initial chain; re-sort by severity then shortage
  lowStock.sort((a, b) => {
    if (a.severity === b.severity) return b.shortage - a.shortage;
    return a.severity === "Critical" ? -1 : 1;
  });

  const critical = lowStock.filter((m) => m.severity === "Critical").length;

  const submitPurchase = async (payload) => {
    try {
      await api.createPurchase({ ...payload, medicine: purchaseFor.name, supplier: payload.supplier || "MediCore Distributors" });
      toast.success("Purchase created", `Reorder raised for ${purchaseFor.name}.`);
      setPurchaseFor(null);
    } catch {
      toast.error("Error", "Could not create purchase.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Low Stock"
        subtitle="Medicines running below their reorder level that need restocking."
      />

      <div className="summary-strip card" style={{ marginBottom: 18 }}>
        <div className="summary-item"><span className="si-label">Low Stock Items</span><span className="si-value">{lowStock.length}</span></div>
        <div className="summary-item"><span className="si-label">Critical</span><span className="si-value" style={{ color: "var(--danger)" }}>{critical}</span></div>
        <div className="summary-item"><span className="si-label">Warning</span><span className="si-value" style={{ color: "var(--warning)" }}>{lowStock.length - critical}</span></div>
        <div className="summary-item"><span className="si-label">Estimated Restock Value</span><span className="si-value">{formatINR(lowStock.reduce((s, m) => s + m.suggested * m.unitPrice, 0))}</span></div>
      </div>

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search low stock items..." />
      </div>

      {lowStock.length === 0 ? (
        <EmptyState title="No low stock items" subtitle="All medicines are above their reorder levels." />
      ) : (
        lowStock.map((m) => (
          <div className={`alert-row ${m.severity === "Critical" ? "critical" : "warning"}`} key={m.id}>
            <div style={{ minWidth: 180, flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div className="muted text-sm">{m.generic} · {m.category}</div>
            </div>
            <div className="summary-strip">
              <div className="summary-item"><span className="si-label">Current Stock</span><span className="si-value" style={{ color: "var(--danger)" }}>{formatNumber(m.stock)}</span></div>
              <div className="summary-item"><span className="si-label">Reorder Level</span><span className="si-value">{formatNumber(m.reorderLevel)}</span></div>
              <div className="summary-item"><span className="si-label">Shortage</span><span className="si-value">{formatNumber(m.shortage)}</span></div>
              <div className="summary-item"><span className="si-label">Suggested Reorder</span><span className="si-value">{formatNumber(m.suggested)}</span></div>
            </div>
            <div className="flex gap-8">
              <StatusBadge status={m.severity === "Critical" ? "Critical" : "Low Stock"} />
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setPurchaseFor(m)}>Create Purchase</Button>
            </div>
          </div>
        ))
      )}

      {purchaseFor && (
        <TransactionForm
          open
          onClose={() => setPurchaseFor(null)}
          onSubmit={submitPurchase}
          kind="purchase"
        />
      )}
    </div>
  );
}
