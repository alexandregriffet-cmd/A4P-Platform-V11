export default function IndividuelHubPage() {
  return (
    <main className="page">
      <div className="card">
        <h1>Hub individuel</h1>
        <p>Choisis ton module et retrouve tes résultats personnels.</p>
        <div className="actions">
          <a className="btn" href="/individuel/tests/cmp">CMP individuel</a>
          <a className="btn secondary" href="/individuel/resultats">Mes résultats</a>
        </div>
      </div>
    </main>
  )
}
