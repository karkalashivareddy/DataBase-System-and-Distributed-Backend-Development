import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import { useToast } from "../contexts/ToastContext";
import { FileText, Download, Eye, Printer, FileSpreadsheet } from "lucide-react";
import { REPORT_TYPES } from "../utils/constants";
import { medicines, suppliers } from "../data/medicines";
import { batches } from "../data/batches";
import { sales, purchases } from "../data/transactions";
import { formatINR, formatNumber, formatDate, daysUntil } from "../utils/formatters";

function buildLines(reportType) {
  if (reportType === REPORT_TYPES.INVENTORY) {
    return medicines.map((m) => [m.name, m.generic, m.category, m.stock, m.reorderLevel, formatINR(m.unitPrice), formatINR(m.stock * m.unitPrice)]);
  }
  if (reportType === REPORT_TYPES.SALES) {
    return sales().slice(0, 15).map((s) => [s.saleNo, s.medicine, s.quantity, formatINR(s.unitPrice), formatINR(s.total), s.customer, formatDate(s.date)]);
  }
  if (reportType === REPORT_TYPES.PURCHASE) {
    return purchases().slice(0, 15).map((p) => [p.purchaseNo, p.medicine, p.quantity, formatINR(p.unitCost), formatINR(p.total), p.supplier, formatDate(p.date)]);
  }
  if (reportType === REPORT_TYPES.EXPIRY) {
    return batches()
      .filter((b) => daysUntil(b.expiryDate) <= 60)
      .map((b) => [b.batchNo, b.medicineName, formatDate(b.expiryDate), b.quantity, b.supplierId, daysUntil(b.expiryDate) < 0 ? "Expired" : `${daysUntil(b.expiryDate)}d`]);
  }
  if (reportType === REPORT_TYPES.LOW_STOCK) {
    return medicines.filter((m) => m.stock < m.reorderLevel).map((m) => [m.name, m.stock, m.reorderLevel, m.reorderLevel - m.stock, formatINR(m.unitPrice)]);
  }
  if (reportType === REPORT_TYPES.SUPPLIER) {
    return suppliers.map((s) => [s.name, s.contact, s.email, s.phone, s.medicinesSupplied, formatINR(s.outstanding), s.status]);
  }
  return [];
}

const HEADERS = {
  [REPORT_TYPES.INVENTORY]: ["Medicine", "Generic", "Category", "Stock", "Reorder", "Unit Price", "Stock Value"],
  [REPORT_TYPES.SALES]: ["Invoice", "Medicine", "Qty", "Unit Price", "Total", "Customer", "Date"],
  [REPORT_TYPES.PURCHASE]: ["PO No", "Medicine", "Qty", "Unit Cost", "Total", "Supplier", "Date"],
  [REPORT_TYPES.EXPIRY]: ["Batch", "Medicine", "Expiry", "Qty", "Supplier", "Status"],
  [REPORT_TYPES.LOW_STOCK]: ["Medicine", "Stock", "Reorder", "Shortage", "Unit Price"],
  [REPORT_TYPES.SUPPLIER]: ["Supplier", "Contact", "Email", "Phone", "Items", "Outstanding", "Status"],
};

export default function Reports() {
  const toast = useToast();
  const [reportType, setReportType] = useState(REPORT_TYPES.INVENTORY);
  const [preview, setPreview] = useState(false);

  const lines = buildLines(reportType);
  const headers = HEADERS[reportType];

  const generate = () => {
    toast.success("Report generated", `${reportType} is ready for preview.`);
    setPreview(true);
  };

  const exportCSV = () => {
    const rows = [headers, ...lines];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType.replace(/\s+/g, "_").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported", `${reportType} exported as CSV.`);
  };

  const print = () => {
    toast.info("Printing", "Please use your browser print dialog.");
    window.print();
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export inventory, sales, purchase, expiry and stock reports." />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div><div className="card-title">Create a Report</div><div className="card-sub">Choose a report type and generate a preview or export.</div></div>
        </div>
        <div className="filter-bar" style={{ border: "none", padding: 0, background: "transparent" }}>
          <select className="form-select filter-select" value={reportType} onChange={(e) => setReportType(e.target.value)} aria-label="Report type" style={{ minWidth: 240 }}>
            {Object.values(REPORT_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Button icon={FileText} onClick={generate}>Generate</Button>
          <Button variant="ghost" icon={Eye} onClick={() => setPreview(true)}>Preview</Button>
          <Button variant="ghost" icon={Download} onClick={exportCSV}>Export CSV</Button>
          <Button variant="ghost" icon={Printer} onClick={print}>Print</Button>
        </div>
        <div className="summary-strip" style={{ marginTop: 14 }}>
          <div className="summary-item"><span className="si-label">Rows</span><span className="si-value">{lines.length}</span></div>
          <div className="summary-item"><span className="si-label">Generated</span><span className="si-value" style={{ fontSize: 14 }}>{formatDate(new Date().toISOString())}</span></div>
        </div>
      </div>

      {preview ? (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">{reportType} — Preview</div><div className="card-sub">PharmaStock · Medicine Stock Management &amp; Analytics Portal</div></div>
            <div className="flex gap-8">
              <Button size="sm" variant="ghost" icon={FileSpreadsheet} onClick={exportCSV}>CSV</Button>
              <Button size="sm" variant="ghost" icon={Printer} onClick={print}>Print</Button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {lines.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="text-muted">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card muted text-sm" style={{ textAlign: "center", padding: 32 }}>
          Select a report type and click <strong>Generate</strong> or <strong>Preview</strong> to see the output here.
        </div>
      )}
    </div>
  );
}
