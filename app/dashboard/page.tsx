import KpiCard from '@/components/KpiCard'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const [{ count: clubs }, { count: teams }, { count: tests }] = await Promise.all([
    supabase.from('clubs').select('*', { head: true, count: 'exact' }),
    supabase.from('teams').select('*', { head: true, count: 'exact' }),
    supabase.from('tests').select('*', { head: true, count: 'exact' })
  ])

  return (
    <main className="page">
      <section className="hero">
        <h1>Dashboard global</h1>
        <p className="small">Point d’entrée opérationnel après connexion.</p>
        <div className="actions">
          <a className="btn" href="/club">Espace club</a>
          <a className="btn secondary" href="/individuel">Espace individuel</a>
          <a className="btn secondary" href="/admin">Admin</a>
        </div>
      </section>

      <div className="grid kpis">
        <KpiCard title="Clubs" value={clubs || 0} />
        <KpiCard title="Équipes" value={teams || 0} />
        <KpiCard title="Résultats enregistrés" value={tests || 0} />
      </div>
    </main>
  )
}
