export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge success">Portail A4P V11</p>
        <h1>Double entrée : individuel et club</h1>
        <p className="small">
          Cette version branche la base Supabase, les comptes utilisateurs, la passation CMP réelle,
          le stockage des résultats, le dashboard dynamique, l’admin A4P et l’email automatique des résultats.
        </p>
        <div className="actions">
          <a className="btn" href="/individuel">Accès individuel</a>
          <a className="btn secondary" href="/club">Accès club</a>
          <a className="btn secondary" href="/admin">Admin A4P</a>
        </div>
      </section>

      <div className="grid kpis">
        <div className="card"><h3>Parcours individuel</h3><p>Hub personnel, CMP, résultats, historique.</p></div>
        <div className="card"><h3>Parcours club</h3><p>Équipes, passations, réponses, dashboard staff.</p></div>
        <div className="card"><h3>Email résultats</h3><p>Chaque test terminé peut être envoyé à alexandre.griffet@yahoo.fr.</p></div>
      </div>
    </main>
  )
}
