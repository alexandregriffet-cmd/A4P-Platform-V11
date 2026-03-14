import { createServerSupabase } from '@/lib/supabaseServer'

export default async function PassationsPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('passations').select('*').order('created_at', { ascending: false })

  return (
    <main className="page">
      <section className="hero">
        <h1>Passations club</h1>
        <div className="actions">
          <a className="btn" href="/club/passations/create">Créer une passation</a>
        </div>
      </section>
      <div className="card">
        <table>
          <thead><tr><th>Module</th><th>Équipe</th><th>Statut</th><th>Lien</th></tr></thead>
          <tbody>
            {(data || []).map((p) => (
              <tr key={p.passation_id}>
                <td>{p.module}</td>
                <td>{p.team_id}</td>
                <td>{p.status}</td>
                <td><a href={`/club/passations/create?preview=${p.token}`}>Voir</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
