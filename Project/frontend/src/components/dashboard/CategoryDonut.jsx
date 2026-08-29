import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#14b8a6", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399", "#f87171", "#2dd4bf", "#f0abfc"];

export default function CategoryDonut({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={3} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}
          labelStyle={{ color: "var(--text-primary)" }}
          formatter={(v, n) => [`${v.toLocaleString("en-IN")} units`, n]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
