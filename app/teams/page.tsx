import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function TeamsPage() {
  const supabase = createServerSupabase()
  const { data: teams } = await supabase.from('teams').select('team_id, team_name, sport, category, club_id').order('created_at', { ascending: false })

  return (
    <main className="page">
      <div className="header-row">
        <h1>Équipes</h1>
        <Link href="/teams/create">Créer une équipe</Link>
      </div>
      <div className="grid">
        {(teams || []).map((team) => (
          <div key={team.team_id} className="card">
            <h3>{team.team_name}</h3>
            <p>{team.sport} • {team.category}</p>
            <p>Club : {team.club_id}</p>
            <Link href={`/teams/${team.team_id}`}>Ouvrir</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
