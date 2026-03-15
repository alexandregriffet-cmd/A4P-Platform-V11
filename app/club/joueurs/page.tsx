import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function ClubPlayers() {
  const supabase = createServerSupabase()

  const { data: players } = await supabase
    .from('players')
    .select('player_id, first_name, last_name, email')
    .order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Joueurs</h1>

      <Link href="/players/create">➕ Créer un joueur</Link>

      <div style={{ marginTop: 20 }}>
        {(players || []).map((player) => (
          <div key={player.player_id} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
            <strong>{player.first_name} {player.last_name}</strong>
            <div>{player.email}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
