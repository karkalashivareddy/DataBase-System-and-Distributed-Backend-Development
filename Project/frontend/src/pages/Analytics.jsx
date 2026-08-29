import { useState } from "react";
import { TrendingUp, Wallet, RefreshCw, Star } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import AnalyticsCard from "../components/analytics/AnalyticsCard";
import InventoryChart from "../components/analytics/InventoryChart";
import SalesAnalytics from "../components/analytics/SalesAnalytics";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { getSalesTrend, getCategoryDistribution } from "../data/dashboard";
import { sales } from "../data/transactions";
import { medicines } from "../data/medicines";
import { suppliers } from "../data/medicines";
import { formatINR, formatINRCompact } from "../utils/formatters";
import { DATE_RANGES } from "../utils/constants";

const DONUT_COLORS = ["#14b8a6", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#2dd4bf", "#f0abfc"];

export default function Analytics() {
  const [range, setRange] = useState("90D");
  const trend = getSalesTrend();
  const category = getCategoryDistribution();

  // Aug figures for analytics summary
  const aug = trend.find((t) => t.month === "Aug") || trend[trend.length - 1];
  const revenue = aug.sales;
  const purchasesMonth = aug.purchases;
  const profit = revenue - purchasesMonth;
  const profitPct = ((profit / revenue) * 100).toFixed(1);

  const inventoryValue = medicines.reduce((s, m) => s + m.stock * m.unitPrice, 0);
  const turnover = (revenue / (inventoryValue || 1)).toFixed(2);

  // Top selling
  const salesMap = sales().reduce((acc, s) => {
    acc[s.medicine] = (acc[s.medicine] || 0) + s.total;
    return acc;
  }, {});
  const topSelling = Object.entries(salesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Slow moving (lowest sales)
  const slowMoving = Object.entries(salesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 5);

  const maxTop = topSelling[0]?.value || 1;

  const supplierPerformance = suppliers.map((s) => ({
    name: s.name,
    active: s.status === "Active" ? 92 + Math.floor(Math.random() * 8) : 40,
  }));

  const expiryRisk = [
    { label: "0–7 days", value: 3, color: "#f87171" },
    { label: "8–30 days", value: 6, color: "#fbbf24" },
    { label: "31–60 days", value: 4, color: "#38bdf8" },
    { label: "60+ days", value: 5, color: "#34d399" },
  ];

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Business intelligence for your pharmaceutical inventory."
        actions={
          <div className="date-range-group" role="group" aria-label="Date range">
            {DATE_RANGES.map((r) => (
              <button key={r.value} className={`date-range-btn ${range === r.value ? "active" : ""}`} onClick={() => setRange(r.value)}>
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <AnalyticsCard label="Revenue" value={formatINRCompact(revenue)} delta="+12.8%" trend="up" sub="vs prior period" />
        <AnalyticsCard label="Inventory Value" value={formatINRCompact(inventoryValue)} delta="+6.2%" trend="up" sub="current" />
        <AnalyticsCard label="Stock Turnover" value={`${turnover}x`} delta="+0.4x" trend="up" sub="per period" />
        <AnalyticsCard label="Gross Margin" value={`${profitPct}%`} delta="+2.1%" trend="up" sub="net of purchases" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Revenue Analytics</div><div className="card-sub">Monthly purchase, sales and net comparison</div></div>
            <TrendingUp size={18} className="muted" />
          </div>
          <SalesAnalytics data={trend.map((t) => ({ ...t, profit: t.sales - t.purchases }))} />
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Inventory Value</div><div className="card-sub">Value of stock on hand by month</div></div>
            <Wallet size={18} className="muted" />
          </div>
          <InventoryChart data={trend.map((t) => ({ month: t.month, value: t.sales * 0.62 }))} />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Top-Selling Medicines</div><div className="card-sub">By revenue</div></div>
            <Star size={18} className="muted" />
          </div>
          {topSelling.map((t) => (
            <div className="flex-between" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }} key={t.name}>
              <span className="text-sm">{t.name}</span>
              <div className="flex gap-12">
                <span className="muted text-sm">{formatINRCompact(t.value)}</span>
                <div className="progress-track" style={{ width: 120 }}>
                  <div className="progress-fill" style={{ width: `${(t.value / maxTop) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Slow-Moving Medicines</div><div className="card-sub">Lowest turnover — review stock allocation</div></div>
            <RefreshCw size={18} className="muted" />
          </div>
          {slowMoving.map((t) => (
            <div className="flex-between" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }} key={t.name}>
              <span className="text-sm">{t.name}</span>
              <span className="muted text-sm">{formatINRCompact(t.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Category Performance</div><div className="card-sub">Stock by category</div></div></div>
          <div className="chart-box chart-height-md">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
                  {category.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Supplier Performance</div><div className="card-sub">Reliability index</div></div></div>
          <div className="chart-box chart-height-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierPerformance} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={130} stroke="var(--text-muted)" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="active" name="Reliability" fill="#14b8a6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Expiry Risk</div><div className="card-sub">Batches by expiry window</div></div></div>
          <div className="chart-box chart-height-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryRisk} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={80} stroke="var(--text-muted)" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} cursor={{ fill: "var(--bg-tertiary)" }} />
                <Bar dataKey="value" name="Batches" radius={[0, 6, 6, 0]}>
                  {expiryRisk.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
