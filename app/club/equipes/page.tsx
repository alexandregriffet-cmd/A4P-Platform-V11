import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function ClubTeams() {
  const supabase = createServerSupabase()

  const { data: teams } = await supabase
    .from('teams')
    .select('team_id, team_name, season')
    .order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Équipes du club</h1>

      <Link href="/teams/create">➕ Créer une équipe</Link>

      <div style={{ marginTop: 20 }}>
        {(teams || []).map((team) => (
          <div key={team.team_id} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
            <strong>{team.team_name}</strong>
            <div>Saison : {team.season}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
