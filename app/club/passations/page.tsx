import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

export default async function ClubPassations() {
  const supabase = createServerSupabase()

  const { data } = await supabase
    .from('passations')
    .select('passation_id, module, status, token')
    .order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Passations</h1>

      <Link href="/passations/create">➕ Créer une passation</Link>

      <div style={{ marginTop: 20 }}>
        {(data || []).map((p) => (
          <div key={p.passation_id} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
            <strong>{p.module}</strong>
            <div>Statut : {p.status}</div>
            <Link href={`/passations/${p.token}`}>Ouvrir</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
