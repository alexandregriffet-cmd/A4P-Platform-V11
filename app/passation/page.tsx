import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function PassationsPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('passations').select('passation_id, token, module, team_id, status, created_at').order('created_at', { ascending: false })

  return (
    <main className="page">
      <div className="header-row">
        <h1>Passations</h1>
        <Link href="/passations/create">Créer une passation</Link>
      </div>
      <table>
        <thead><tr><th>Module</th><th>Équipe</th><th>Statut</th><th>Lien</th></tr></thead>
        <tbody>
          {(data || []).map((p) => (
            <tr key={p.passation_id}>
              <td>{p.module}</td>
              <td>{p.team_id}</td>
              <td>{p.status}</td>
              <td><Link href={`/passations/${p.token}`}>Ouvrir</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
