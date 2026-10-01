// KPI card com tom colorido por status (tone: 'ok'|'warn'|'bad').
export default function KpiCard({ title, value, sub, tone }) {
  const color = tone ? `var(--${tone})` : undefined;
  return (
    <div className="kpi">
      <div className="t">{title}</div>
      <div className="v" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="s">{sub}</div>}
    </div>
  );
}
