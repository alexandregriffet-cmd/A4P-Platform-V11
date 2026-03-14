import { HUB_URL } from '@/lib/constants'

export default function HomePage() {
  const btn: React.CSSProperties = {
    display: "inline-block",
    background: "#19386b",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 14,
    padding: "16px 24px",
    marginRight: 16,
    marginBottom: 16,
    fontWeight: 700
  }

  const secondary: React.CSSProperties = {
    display: "inline-block",
    background: "#fff",
    color: "#19386b",
    textDecoration: "none",
    borderRadius: 14,
    padding: "16px 24px",
    marginRight: 16,
    marginBottom: 16,
    fontWeight: 700,
    border: "1px solid #19386b"
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      <h1 style={{ fontSize: 52, marginBottom: 12 }}>A4P Ultimate Platform</h1>
      <p style={{ fontSize: 20, lineHeight: 1.5, maxWidth: 900 }}>
        Portail principal relié au hub diagnostique A4P et aux 3 moteurs de tests existants.
      </p>

      <section style={{ marginTop: 28 }}>
        <a href="/individuel/tests/cmp" style={btn}>CMP</a>
        <a href="/individuel/tests/pmp" style={btn}>PMP</a>
        <a href="/individuel/tests/psycho" style={btn}>PSYCHO</a>
        <a href="/club/dashboard" style={btn}>Dashboard Club</a>
        <a href="/admin" style={btn}>Admin</a>
        <a href={HUB_URL} style={secondary}>Retour hub diagnostique</a>
      </section>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 36 }}>
        <div style={card}>
          <h2 style={h2}>Hub diagnostique</h2>
          <p>Retour rapide vers le hub A4P historique.</p>
        </div>
        <div style={card}>
          <h2 style={h2}>Tests existants</h2>
          <p>Ouverture des moteurs CMP, PMP et PSYCHO déjà publiés.</p>
        </div>
        <div style={card}>
          <h2 style={h2}>Admin</h2>
          <p>Vue consolidée des résultats et de l'historique.</p>
        </div>
      </section>
    </main>
  )
}

const card: React.CSSProperties = {
  border: "1px solid #d9dee8",
  borderRadius: 16,
  padding: 20,
  background: "#fff"
}

const h2: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 10
}
