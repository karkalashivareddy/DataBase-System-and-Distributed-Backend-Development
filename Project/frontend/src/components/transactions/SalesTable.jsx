import StatusBadge from "../common/StatusBadge";
import { formatINR, formatDate, formatNumber } from "../../utils/formatters";

export default function SalesTable({ items }) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Medicine</th>
            <th>Batch</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td className="cell-primary">{s.saleNo}</td>
              <td>{s.medicine}</td>
              <td className="muted">{s.batch}</td>
              <td>{formatNumber(s.quantity)}</td>
              <td className="money">{formatINR(s.unitPrice)}</td>
              <td className="money" style={{ fontWeight: 600 }}>{formatINR(s.total)}</td>
              <td className="text-muted">{s.customer}</td>
              <td className="muted">{formatDate(s.date)}</td>
              <td><StatusBadge status={s.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
