export default function ClubPage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Plateforme clubs A4P</h1>
        <p className="small">Créer des équipes, lancer des passations, suivre les réponses et piloter le dashboard staff.</p>
        <div className="actions">
          <a className="btn" href="/club/equipes">Équipes</a>
          <a className="btn secondary" href="/club/passations">Passations</a>
        </div>
      </section>
    </main>
  )
}
