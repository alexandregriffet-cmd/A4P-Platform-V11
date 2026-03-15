import Link from 'next/link'

export default function ClubHome() {
  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Portail Club A4P</h1>

      <div style={{ display: 'grid', gap: 20, marginTop: 30 }}>

        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>Équipes</h2>
          <p>Créer et gérer les équipes du club</p>
          <Link href="/club/equipes">Voir les équipes</Link>
        </div>

        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>Joueurs</h2>
          <p>Créer et gérer les joueurs</p>
          <Link href="/club/joueurs">Voir les joueurs</Link>
        </div>

        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>Passations</h2>
          <p>Lancer des tests CMP / PMP / PSYCHO</p>
          <Link href="/club/passations">Voir les passations</Link>
        </div>

      </div>
    </main>
  )
}
