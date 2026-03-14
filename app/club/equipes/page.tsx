import { createServerSupabase } from '@/lib/supabaseServer'

export default async function TeamsPage() {
  const supabase = createServerSupabase()
  const { data: teams } = await supabase.from('teams').select('*').order('created_at', { ascending: false })

  return (
    <main className="page">
      <div className="hero">
        <h1>Équipes</h1>
        <div className="actions">
          <a className="btn" href="/club/passations/create">Créer une passation CMP</a>
        </div>
      </div>
      <div className="grid">
        {(teams || []).map((team) => (
          <div key={team.team_id} className="card">
            <h3>{team.team_name}</h3>
            <p>{team.sport} • {team.category}</p>
            <a className="btn secondary" href={`/club/equipes/${team.team_id}`}>Ouvrir</a>
          </div>
        ))}
      </div>
    </main>
  )
}
