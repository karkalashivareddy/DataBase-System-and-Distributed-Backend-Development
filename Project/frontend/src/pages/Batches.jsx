import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import BatchTable from "../components/batches/BatchTable";
import BatchDetails from "../components/batches/BatchDetails";
import BatchForm from "../components/batches/BatchForm";
import Pagination from "../components/common/Pagination";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import * as api from "../services/api";
import { useToast } from "../contexts/ToastContext";

const STATUS_OPTIONS = ["All", "Active", "Near Expiry", "Expired", "Depleted"];

export default function Batches() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    api.getBatches().then((data) => {
      setItems(data);
      const id = params.get("id");
      if (id) setSelected(data.find((b) => b.id === id) || null);
      if (id) setParams({}, { replace: true });
    });
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = [...items];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((b) => `${b.batchNo} ${b.medicineName}`.toLowerCase().includes(q));
    }
    if (statusFilter !== "All") list = list.filter((b) => b.status === statusFilter);
    return list;
  }, [items, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const submitBatch = async (payload) => {
    setBusy(true);
    try {
      await api.createBatch(payload);
      const newBatch = {
        ...payload,
        id: `bat-${Date.now()}`,
        status: new Date(payload.expiryDate) < new Date() ? "Expired" : "Active",
      };
      setItems((prev) => [newBatch, ...prev]);
      setFormOpen(false);
      toast.success("Added", "Batch added successfully.");
    } catch {
      toast.error("Error", "Could not save batch.");
    }
    setBusy(false);
  };

  if (!items) return <LoadingState rows={4} />;

  return (
    <div>
      <PageHeader
        title="Batches"
        subtitle="Batch-wise inventory with serial, expiry, and lot tracking."
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)}>Add Batch</Button>}
      />

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search batch or medicine..." />
        <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState title="No batches found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <BatchTable items={paginated} onView={setSelected} />
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPage={setPage}
            total={filtered.length}
            from={(safePage - 1) * itemsPerPage + 1}
            to={Math.min(safePage * itemsPerPage, filtered.length)}
            itemsPerPage={itemsPerPage}
            onItemsPerPage={(n) => { setItemsPerPage(n); setPage(1); }}
          />
        </div>
      )}

      <BatchDetails batch={selected} onClose={() => setSelected(null)} />
      <BatchForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submitBatch} existing={items} busy={busy} />
    </div>
  );
}
