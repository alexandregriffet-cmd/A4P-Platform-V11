import { createServerSupabase } from '@/lib/supabaseServer'
import CMPQuestionnaire from '@/components/CMPQuestionnaire'

export default async function PassationTokenPage({
  params,
  searchParams
}: {
  params: { token: string }
  searchParams: { play?: string }
}) {
  const supabase = createServerSupabase()
  const { data: passation } = await supabase.from('passations').select('*').eq('token', params.token).single()

  if (!passation) {
    return <main className="page"><h1>Passation introuvable</h1></main>
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/passations/${params.token}?play=1`

  if (searchParams.play === '1') {
    return (
      <main className="page">
        <h1>Passation CMP</h1>
        <CMPQuestionnaire token={params.token} teamId={passation.team_id} clubId={passation.club_id} />
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Passation CMP créée</h1>
      <p>Partage ce lien avec les joueurs :</p>
      <code>{url}</code>
    </main>
  )
}
