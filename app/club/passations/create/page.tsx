import CreatePassationForm from '@/components/CreatePassationForm'

export default function CreatePassationPage({ searchParams }: { searchParams: { teamId?: string; preview?: string } }) {
  return (
    <main className="page">
      <section className="hero">
        <h1>Créer une passation club</h1>
        <p className="small">Génère un lien joueur pour une équipe. Chaque réponse peut être stockée et t’être envoyée par email.</p>
      </section>
      <CreatePassationForm teamIdDefault={searchParams.teamId || ''} previewToken={searchParams.preview || ''} />
    </main>
  )
}
