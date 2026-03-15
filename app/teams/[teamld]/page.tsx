import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function TeamDetailPage({ params }: { params: { teamId: string } }) {
  const supabase = createServerSupabase()
  const { teamId } = params
  const { data: team } = await supabase.from('teams').select('*').eq('team_id', teamId).single()
  const { data: players } = await supabase.from('players').select('*').eq('team_id', teamId).order('lastname', { ascending: true })
  const { data: tests } = await supabase.from('tests').select('*').eq('team_id', teamId).eq('module', 'CMP').order('created_at', { ascending: false })

  return (
    <main className="page">
      <h1>{team?.team_name}</h1>
      <p>{team?.sport} • {team?.category}</p>
      <div className="actions">
        <Link href={`/players/create?teamId=${teamId}`}>Ajouter un joueur</Link>
        <Link href={`/passations/create?teamId=${teamId}`}>Créer une passation CMP</Link>
      </div>
      <section className="card">
        <h2>Joueurs</h2>
        <ul>
          {(players || []).map((p) => (
            <li key={p.player_id}>{p.firstname} {p.lastname} {p.position ? `• ${p.position}` : ''}</li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>Réponses CMP collectées</h2>
        <table>
          <thead><tr><th>Joueur</th><th>Score</th><th>Profil</th><th>Date</th></tr></thead>
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
      </section>
    </main>
  )
}
