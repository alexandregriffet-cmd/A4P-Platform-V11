import { createServerSupabase } from '@/lib/supabaseServer'

export default async function IndividualResultsPage() {
  const supabase = createServerSupabase()
  const { data: tests } = await supabase
    .from('tests')
    .select('*')
    .eq('source', 'individual')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="page">
      <div className="card">
        <h1>Résultats individuels</h1>
        <table>
          <thead><tr><th>Nom</th><th>Module</th><th>Score</th><th>Profil</th><th>Date</th></tr></thead>
          <tbody>
            {(tests || []).map((t) => (
              <tr key={t.test_id}>
                <td>{t.player_firstname} {t.player_lastname}</td>
                <td>{t.module}</td>
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
