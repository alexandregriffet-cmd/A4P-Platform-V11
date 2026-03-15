import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type Props = {
  params: { token: string }
}

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(url, key)
}

export default async function PassationTokenPage({ params }: Props) {
  const supabase = getServerClient()
  const token = params.token

  const { data: passation } = await supabase
    .from('passations')
    .select('*')
    .eq('token', token)
    .single()

  if (!passation) {
    return (
      <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
        <h1>Passation introuvable</h1>
        <p>Le token n’existe pas ou n’est plus valide.</p>
      </main>
    )
  }

  let player: any = null

  if (passation.player_id) {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', passation.player_id)
      .single()

    player = data
  }

  const moduleName = passation.module || 'CMP'

  const moduleUrlMap: Record<string, string> = {
    CMP: 'https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/',
    PMP: 'https://alexandregriffet-cmd.github.io/PMP-A4P-Acad-mie-de-Performances-/',
    PSYCHO: 'https://alexandregriffet-cmd.github.io/Module-psycho-motionnelle-/'
  }

  const testBaseUrl = moduleUrlMap[moduleName] || moduleUrlMap.CMP

  const query = new URLSearchParams({
    token,
    module: moduleName,
    playerId: passation.player_id || '',
    teamId: passation.team_id || '',
    clubId: passation.club_id || '',
    firstname: player?.firstname || player?.first_name || '',
    lastname: player?.lastname || player?.last_name || '',
    email: player?.email || ''
  })

  const launchUrl = `${testBaseUrl}?${query.toString()}`

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1>Passation {moduleName}</h1>
      <p><strong>Token :</strong> {token}</p>
      <p><strong>Statut :</strong> {passation.status || 'pending'}</p>

      <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        <a
          href={launchUrl}
          style={{
            padding: 14,
            background: '#173A73',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 8,
            textAlign: 'center'
          }}
        >
          Ouvrir le test {moduleName}
        </a>

        <div
          style={{
            padding: 14,
            border: '1px solid #ddd',
            borderRadius: 8,
            wordBreak: 'break-all'
          }}
        >
          {launchUrl}
        </div>

        <Link href="/passations/create">Créer une autre passation</Link>
      </div>
    </main>
  )
}
