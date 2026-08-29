import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";
import { batches } from "../data/batches";
import { medicines } from "../data/medicines";
import { formatDate, formatNumber, daysUntil } from "../utils/formatters";
import { useNavigate } from "react-router-dom";

const BUCKETS = [
  { key: "expired", label: "Expired", min: -Infinity, max: -1, tone: "status-danger" },
  { key: "within7", label: "Within 7 days", min: 0, max: 7, tone: "status-danger" },
  { key: "within15", label: "Within 15 days", min: 8, max: 15, tone: "status-warning" },
  { key: "within30", label: "Within 30 days", min: 16, max: 30, tone: "status-warning" },
  { key: "within60", label: "Within 60 days", min: 31, max: 60, tone: "status-info" },
];

export default function Expiry() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("all");

  const enriched = useMemo(() => {
    const medName = (id) => medicines.find((m) => m.id === id)?.name || "Unknown";
    return batches().map((b) => ({
      ...b,
      medicineName: b.medicineName || medName(b.medicineId),
      daysLeft: daysUntil(b.expiryDate),
    }));
  }, []);

  const filtered = useMemo(() => {
    let list = enriched;
    if (bucket !== "all") {
      const b = BUCKETS.find((x) => x.key === bucket);
      list = list.filter((x) => x.daysLeft >= b.min && x.daysLeft <= b.max);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((x) => `${x.batchNo} ${x.medicineName} ${x.supplierId}`.toLowerCase().includes(q));
    }
    return list;
  }, [enriched, bucket, query]);

  const counts = {};
  BUCKETS.forEach((b) => {
    counts[b.key] = enriched.filter((x) => x.daysLeft >= b.min && x.daysLeft <= b.max).length;
  });

  const activeFiltered = filtered.filter((x) => x.daysLeft <= 60 || x.daysLeft < 0);

  return (
    <div>
      <PageHeader title="Expiry Monitoring" subtitle="Track and act on batches nearing their expiry date." />

      <div className="summary-strip card" style={{ marginBottom: 18 }}>
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            className={`date-range-btn ${bucket === b.key ? "active" : ""}`}
            onClick={() => setBucket(bucket === b.key ? "all" : b.key)}
            style={{ boxShadow: "none" }}
          >
            <span className={`status-badge ${b.tone}`}>{counts[b.key]}</span> {b.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search batch or medicine..." />
        <select className="form-select filter-select" value={bucket} onChange={(e) => setBucket(e.target.value)} aria-label="Filter by expiry window">
          <option value="all">All Windows</option>
          {BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
        </select>
      </div>

      {activeFiltered.length === 0 ? (
        <EmptyState title="No matching batches" subtitle="No batches fall within the selected expiry window." />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Medicine</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>Days Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeFiltered.map((b) => {
                  const expired = b.daysLeft < 0;
                  return (
                    <tr key={b.id}>
                      <td className="cell-primary">{b.batchNo}</td>
                      <td>
                        <div className="cell-primary" style={{ cursor: "pointer" }} onClick={() => navigate(`/medicines/${b.medicineId}`)}>{b.medicineName}</div>
                      </td>
                      <td className={expired ? "muted" : ""}>{formatDate(b.expiryDate)}</td>
                      <td>{formatNumber(b.quantity)}</td>
                      <td className="text-muted">{b.supplierId}</td>
                      <td>
                        <span className={`status-badge ${expired ? "status-danger" : b.daysLeft <= 7 ? "status-danger" : b.daysLeft <= 30 ? "status-warning" : "status-success"}`}>
                          {expired ? "Expired" : `${b.daysLeft} days`}
                        </span>
                      </td>
                      <td>
                        {expired ? (
                          <StatusBadge status="Expired" />
                        ) : (
                          <StatusBadge status={b.daysLeft <= 30 ? "Near Expiry" : "Active"} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
