import CMPForm from '@/components/CMPForm'

export default function IndividualCMPPage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>CMP individuel</h1>
        <p className="small">Chaque test individuel peut être enregistré et envoyé automatiquement par email à Alexandre.</p>
      </section>
      <CMPForm mode="individual" />
    </main>
  )
}
