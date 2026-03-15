import { HUB_URL } from '@/lib/constants'

export default function Page() {
  return (
    <main style={ maxWidth: 980, margin: "40px auto", padding: 20 }>
      <h1>Passations club</h1>
      <p>Route active pour la création de passations.</p>
      <p style={ marginTop: 24 }>
        <a href="/club/dashboard">← Retour</a>
        <span style={ margin: "0 12px" }></span>
        <a href={HUB_URL}>Retour hub diagnostique</a>
      </p>
    </main>
  )
}
