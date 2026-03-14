export default function KpiCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="big">{value}</p>
      {subtitle ? <p className="small">{subtitle}</p> : null}
    </div>
  )
}
