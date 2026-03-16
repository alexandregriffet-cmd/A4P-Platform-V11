import { createServerSupabase } from '@/lib/supabaseServer'

export default async function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const supabase = createServerSupabase()
  const { data: team } = await supabase.from('teams').select('*').eq('team_id', params.teamId).single()
  const { data: tests } = await supabase.from('tests').select('*').eq('team_id', params.teamId).order('created_at', { ascending: false })

  const avg = tests?.length ? Math.round(tests.reduce((acc, t) => acc + (t.score_global || 0), 0) / tests.length) : 0

  return (
    <main className="page">
      <section className="hero">
        <h1>{team?.team_name || 'Équipe'}</h1>
        <p className="small">Score moyen CMP : {avg}/100 • Réponses : {tests?.length || 0}</p>
        <div className="actions">
          <a className="btn" href={`/club/passations/create?teamId=${params.teamId}`}>Créer une passation CMP</a>
        </div>
      </section>

      <div className="card">
        <h2>Collecte des réponses</h2>
        <table>
          <thead>
            <tr><th>Joueur</th><th>Score</th><th>Profil</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(tests || []).map((t) => (
              <tr key={t.test_id}>
                <td>{t.player_firstname} {t.player_lastname}</td>
                <td>{t.score_global}</td>
                <td>{t.profile_name}</td>
                <td>{new Date(t.created_at).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
