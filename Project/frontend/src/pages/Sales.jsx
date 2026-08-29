import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import SearchBar from "../components/common/SearchBar";
import SalesTable from "../components/transactions/SalesTable";
import TransactionForm from "../components/transactions/TransactionForm";
import Pagination from "../components/common/Pagination";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import * as api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import { formatINR } from "../utils/formatters";

export default function Sales() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    api.getSales().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = [...items];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) =>
        `${s.saleNo} ${s.medicine} ${s.customer} ${s.batch}`.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [items, query, statusFilter]);

  const total = filtered.reduce((s, x) => s + x.total, 0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const submit = async (payload) => {
    try {
      await api.createSale(payload);
      setItems((prev) => [payload, ...prev]);
      toast.success("Sale recorded", `Invoice created for ${payload.medicine}.`);
      setFormOpen(false);
    } catch {
      toast.error("Error", "Could not record sale.");
    }
  };

  if (!items) return <LoadingState rows={4} />;

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="Record sales transactions and customer invoices."
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)}>Record Sale</Button>}
      />

      <div className="filter-bar">
        <SearchBar value={query} onChange={setQuery} placeholder="Search sales..." />
        <select className="form-select filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Refunded">Refunded</option>
        </select>
        <div className="summary-item" style={{ marginLeft: "auto" }}>
          <span className="si-label">Total Sales (filtered)</span>
          <span className="si-value">{formatINR(total)}</span>
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState title="No sales found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="table-wrap">
          <SalesTable items={paginated} />
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

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={submit} kind="sale" />
    </div>
  );
}
