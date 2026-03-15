import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const [{ count: teamsCount }, { count: playersCount }, { count: testsCount }] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('tests').select('*', { count: 'exact', head: true })
  ])

  return (
    <main className="page">
      <h1>Dashboard club</h1>
      <div className="grid">
        <div className="card"><h3>Équipes</h3><p>{teamsCount || 0}</p></div>
        <div className="card"><h3>Joueurs</h3><p>{playersCount || 0}</p></div>
        <div className="card"><h3>Réponses CMP</h3><p>{testsCount || 0}</p></div>
      </div>
      <div className="actions">
        <Link href="/teams">Voir les équipes</Link>
        <Link href="/passations">Voir les passations</Link>
      </div>
    </main>
  )
}
