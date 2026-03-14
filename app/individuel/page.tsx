export default function IndividuelPage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Parcours individuel A4P</h1>
        <p className="small">Pour les clients hors club : accès au hub personnel, aux tests et à l’historique.</p>
        <div className="actions">
          <a className="btn" href="/individuel/hub">Ouvrir le hub individuel</a>
          <a className="btn secondary" href="/individuel/tests/cmp">Passer le CMP</a>
        </div>
      </section>
    </main>
  )
}
