import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import { useToast } from "../contexts/ToastContext";
import { FileText, Download, Eye, Printer, FileSpreadsheet } from "lucide-react";
import { REPORT_TYPES } from "../utils/constants";
import { formatINR, formatDate, daysUntil } from "../utils/formatters";
import * as api from "../services/api";

const API_TYPES = {
  [REPORT_TYPES.INVENTORY]: "inventory",
  [REPORT_TYPES.SALES]: "sales",
  [REPORT_TYPES.PURCHASE]: "purchase",
  [REPORT_TYPES.EXPIRY]: "expiry",
  [REPORT_TYPES.LOW_STOCK]: "low-stock",
  [REPORT_TYPES.SUPPLIER]: "supplier",
};

const HEADERS = {
  [REPORT_TYPES.INVENTORY]: ["Medicine", "Generic", "Category", "Stock", "Reorder", "Unit Price", "Stock Value"],
  [REPORT_TYPES.SALES]: ["Invoice", "Medicine", "Qty", "Unit Price", "Total", "Customer", "Date"],
  [REPORT_TYPES.PURCHASE]: ["PO No", "Medicine", "Qty", "Unit Cost", "Total", "Supplier", "Date"],
  [REPORT_TYPES.EXPIRY]: ["Batch", "Medicine", "Expiry", "Qty", "Supplier", "Status"],
  [REPORT_TYPES.LOW_STOCK]: ["Medicine", "Stock", "Reorder", "Shortage", "Unit Price"],
  [REPORT_TYPES.SUPPLIER]: ["Supplier", "Contact", "Email", "Phone", "Items", "Outstanding", "Status"],
};

function reportDays(iso) {
  const value = daysUntil(iso);
  return Number.isFinite(value) ? value : null;
}

function buildLines(reportType, rows) {
  if (reportType === REPORT_TYPES.INVENTORY) return rows.map((row) => [row.name, row.generic, row.category, row.stock, row.reorderLevel, formatINR(row.unitPrice), formatINR(Number(row.stock || 0) * Number(row.unitPrice || 0))]);
  if (reportType === REPORT_TYPES.SALES) return rows.map((row) => [row.saleNo, row.medicine, row.quantity, formatINR(row.unitPrice), formatINR(row.total), row.customer, formatDate(row.date)]);
  if (reportType === REPORT_TYPES.PURCHASE) return rows.map((row) => [row.purchaseNo, row.medicine, row.quantity, formatINR(row.unitCost), formatINR(row.total), row.supplier, formatDate(row.date)]);
  if (reportType === REPORT_TYPES.EXPIRY) return rows.map((row) => { const days = reportDays(row.expiryDate); return [row.batchNo, row.medicineName, formatDate(row.expiryDate), row.quantity, row.supplierName, days === null ? "—" : days < 0 ? "Expired" : `${days}d`]; });
  if (reportType === REPORT_TYPES.LOW_STOCK) return rows.map((row) => [row.name, row.stock, row.reorderLevel, Number(row.reorderLevel || 0) - Number(row.stock || 0), formatINR(row.unitPrice)]);
  if (reportType === REPORT_TYPES.SUPPLIER) return rows.map((row) => [row.name, row.contact, row.email, row.phone, row.medicinesSupplied, formatINR(row.outstanding), row.status]);
  return [];
}

export default function Reports() {
  const toast = useToast();
  const [reportType, setReportType] = useState(REPORT_TYPES.INVENTORY);
  const [rows, setRows] = useState(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setRows(null);
    setError("");
    api.getReport(API_TYPES[reportType]).then((data) => {
      if (mounted) setRows(data);
    }).catch((requestError) => {
      if (mounted) setError(requestError.message || "Could not generate report.");
    });
    return () => { mounted = false; };
  }, [reportType]);

  const lines = buildLines(reportType, rows || []);
  const headers = HEADERS[reportType];
  const generate = () => {
    if (rows === null) return;
    setPreview(true);
    toast.success("Report generated", `${reportType} is ready for preview.`);
  };
  const exportCSV = () => {
    if (!rows) return;
    const csv = [headers, ...lines].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reportType.replace(/\s+/g, "_").toLowerCase()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Exported", `${reportType} exported as CSV.`);
  };
  const print = () => window.print();

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export inventory, sales, purchase, expiry and stock reports." />
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div><div className="card-title">Create a Report</div><div className="card-sub">Choose a report type and generate a preview or export.</div></div></div>
        <div className="filter-bar" style={{ border: "none", padding: 0, background: "transparent" }}>
          <select data-testid="report-type" className="form-select filter-select" value={reportType} onChange={(event) => setReportType(event.target.value)} aria-label="Report type" style={{ minWidth: 240 }}>{Object.values(REPORT_TYPES).map((type) => <option key={type} value={type}>{type}</option>)}</select>
          <Button data-testid="report-generate" icon={FileText} onClick={generate} disabled={rows === null}>Generate</Button>
          <Button data-testid="report-preview-button" variant="ghost" icon={Eye} onClick={() => setPreview(true)} disabled={rows === null}>Preview</Button>
          <Button data-testid="report-export" variant="ghost" icon={Download} onClick={exportCSV} disabled={rows === null}>Export CSV</Button>
          <Button variant="ghost" icon={Printer} onClick={print} disabled={rows === null}>Print</Button>
        </div>
        {rows !== null && <div className="summary-strip" style={{ marginTop: 14 }}><div className="summary-item"><span className="si-label">Rows</span><span className="si-value">{lines.length}</span></div><div className="summary-item"><span className="si-label">Generated</span><span className="si-value" style={{ fontSize: 14 }}>{formatDate(new Date().toISOString())}</span></div></div>}
        {error && <div className="field-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>
      {preview && rows !== null ? <div data-testid="report-preview" className="card"><div className="card-header"><div><div className="card-title">{reportType} — Preview</div><div className="card-sub">PharmaStock · Medicine Stock Management &amp; Analytics Portal</div></div><div className="flex gap-8"><Button size="sm" variant="ghost" icon={FileSpreadsheet} onClick={exportCSV}>CSV</Button><Button size="sm" variant="ghost" icon={Printer} onClick={print}>Print</Button></div></div><div className="table-scroll"><table className="table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{lines.length === 0 ? <tr><td colSpan={headers.length} className="muted">No records found.</td></tr> : lines.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="text-muted">{cell}</td>)}</tr>)}</tbody></table></div></div> : <div className="card muted text-sm" style={{ textAlign: "center", padding: 32 }}>Select a report type and click <strong>Generate</strong> or <strong>Preview</strong> to see the output here.</div>}
    </div>
  );
}
