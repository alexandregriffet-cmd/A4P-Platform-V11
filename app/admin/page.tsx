import { HUB_URL } from '@/lib/constants'

export default function AdminPage() {
  const card: React.CSSProperties = {
    display: "block",
    padding: 20,
    border: "1px solid #d9dee8",
    borderRadius: 12,
    textDecoration: "none",
    color: "#0f172a",
    background: "#fff"
  }

  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <h1>Admin A4P</h1>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 24 }}>
        <a href="/admin/results" style={card}>
          <h2 style={{ marginTop: 0 }}>Résultats</h2>
          <p>Tous les résultats CMP / PMP / PSYCHO.</p>
        </a>
        <a href="/admin/history" style={card}>
          <h2 style={{ marginTop: 0 }}>Historique</h2>
          <p>Historique complet des passations.</p>
        </a>
        <a href="/admin/clubs" style={card}>
          <h2 style={{ marginTop: 0 }}>Clubs</h2>
          <p>Vue consolidée par club / équipe.</p>
        </a>
      </div>

      <p style={{ marginTop: 24 }}>
        <a href={HUB_URL}>← Retour hub diagnostique</a>
      </p>
    </main>
  )
}
