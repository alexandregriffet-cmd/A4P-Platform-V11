import { createServerSupabase } from '@/lib/supabaseServer'

export default async function AdminPage() {
  const supabase = createServerSupabase()
  const [{ count: tests }, { data: latest }, { data: emails }] = await Promise.all([
    supabase.from('tests').select('*', { head: true, count: 'exact' }),
    supabase.from('tests').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(10)
  ])

  return (
    <main className="page">
      <section className="hero">
        <h1>Admin A4P</h1>
        <p className="small">Supervision globale des résultats et des emails transactionnels.</p>
      </section>

      <div className="grid kpis">
        <div className="card"><h3>Tests enregistrés</h3><p className="big">{tests || 0}</p></div>
        <div className="card"><h3>Email de réception</h3><p>alexandre.griffet@yahoo.fr</p></div>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Derniers résultats</h2>
          <table>
            <thead><tr><th>Nom</th><th>Module</th><th>Score</th></tr></thead>
            <tbody>
              {(latest || []).map((r) => (
                <tr key={r.test_id}><td>{r.player_firstname} {r.player_lastname}</td><td>{r.module}</td><td>{r.score_global}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Journal email</h2>
          <table>
            <thead><tr><th>Sujet</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {(emails || []).map((e: any) => (
                <tr key={e.id}><td>{e.subject}</td><td>{e.status}</td><td>{e.sent_at ? new Date(e.sent_at).toLocaleString('fr-FR') : '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
