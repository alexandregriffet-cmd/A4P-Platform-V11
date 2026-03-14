import { HUB_URL } from '@/lib/constants'

export default function Page() {
  return (
    <main style={ maxWidth: 980, margin: "40px auto", padding: 20 }>
      <h1>Historique complet</h1>
      <p>Page prête pour afficher l'historique intégral des tests.</p>
      <p style={ marginTop: 24 }>
        <a href="/admin">← Retour</a>
        <span style={ margin: "0 12px" }></span>
        <a href={HUB_URL}>Retour hub diagnostique</a>
      </p>
    </main>
  )
}
