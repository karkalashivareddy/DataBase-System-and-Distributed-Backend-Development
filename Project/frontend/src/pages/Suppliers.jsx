import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import SupplierTable from "../components/suppliers/SupplierTable";
import SupplierForm from "../components/suppliers/SupplierForm";
import Pagination from "../components/common/Pagination";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import * as api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { formatINR } from "../utils/formatters";

export default function Suppliers() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getSuppliers().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = [...items];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) => `${s.name} ${s.contact} ${s.email}`.toLowerCase().includes(q));
    }
    if (statusFilter !== "All") list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [items, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const submitForm = async (payload) => {
    try {
      if (editing) {
        await api.updateSupplier(editing.id, payload);
        setItems((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...payload } : s)));
        toast.success("Updated", "Supplier updated.");
      } else {
        await api.createSupplier(payload);
        setItems((prev) => [payload, ...prev]);
        toast.success("Added", "Supplier added.");
      }
      setFormOpen(false);
    } catch {
      toast.error("Error", "Could not save supplier.");
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.deleteSupplier(deleting.id);
      setItems((prev) => prev.filter((s) => s.id !== deleting.id));
      toast.success("Deleted", "Supplier removed.");
      setDeleting(null);
    } catch {
      toast.error("Error", "Could not delete supplier.");
    }
    setBusy(false);
  };

  if (!items) return <LoadingState rows={4} />;

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage the distributors and vendors supplying your inventory."
        actions={<Button icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Supplier</Button>}
      />

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search suppliers..." />
        <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState title="No suppliers found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <SupplierTable
            items={paginated}
            onView={setViewing}
            onEdit={(s) => { setEditing(s); setFormOpen(true); }}
            onDelete={setDeleting}
          />
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

      <SupplierForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submitForm} initial={editing} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete supplier?"
        message={deleting ? `Remove "${deleting.name}"? Associated records may be affected.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={busy}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name}>
        {viewing && (
          <div>
            <div className="spec-grid">
              <div className="spec-item"><div className="si-label">Contact</div><div className="si-value">{viewing.contact}</div></div>
              <div className="spec-item"><div className="si-label">Email</div><div className="si-value">{viewing.email}</div></div>
              <div className="spec-item"><div className="si-label">Phone</div><div className="si-value">{viewing.phone}</div></div>
              <div className="spec-item"><div className="si-label">Medicines Supplied</div><div className="si-value">{viewing.medicinesSupplied}</div></div>
              <div className="spec-item"><div className="si-label">Outstanding Amount</div><div className="si-value">{formatINR(viewing.outstanding)}</div></div>
              <div className="spec-item"><div className="si-label">Status</div><div className="si-value"><StatusBadge status={viewing.status} /></div></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
