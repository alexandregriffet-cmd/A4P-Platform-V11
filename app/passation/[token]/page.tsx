import CMPForm from '@/components/CMPForm'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function PublicPassationPage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabase()
  const { data: passation } = await supabase
    .from('passations')
    .select('*')
    .eq('token', params.token)
    .eq('status', 'active')
    .single()

  if (!passation) {
    return <main className="page"><div className="card"><h1>Passation introuvable</h1></div></main>
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Passation CMP joueur</h1>
        <p className="small">Complète le test. Le résultat sera enregistré et envoyé automatiquement à Alexandre.</p>
      </section>
      <CMPForm mode="club" token={params.token} clubId={passation.club_id} teamId={passation.team_id} />
    </main>
  )
}
