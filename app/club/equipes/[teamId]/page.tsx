import type { CSSProperties } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type PageProps = {
  params: {
    teamId: string
  }
}

type TeamRow = {
  id: string
  name?: string | null
  team_name?: string | null
  season?: string | null
  club_id?: string | null
  created_at?: string | null
}

type PlayerRow = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  position?: string | null
  team_id?: string | null
  created_at?: string | null
}

type PassationRow = {
  id?: string | null
  player_id?: string | null
  team_id?: string | null
  club_id?: string | null
  module?: string | null
  token?: string | null
  status?: string | null
  created_at?: string | null
}

type CmpResultRow = {
  token?: string | null
  module?: string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  club_structure?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | null
  created_at?: string | null
}

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Variables Supabase manquantes dans V11.')
  }

  return createClient(url, key)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function getFullName(player: { firstname?: string | null; lastname?: string | null }) {
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sans nom'
}

function getStatusLabel(status?: string | null) {
  if (status === 'completed') return 'Terminée'
  if (status === 'in_progress') return 'En cours'
  if (status === 'sent') return 'Envoyée'
  if (status === 'pending') return 'À faire'
  return status || 'Inconnu'
}

function getStatusStyle(status?: string | null): CSSProperties {
  if (status === 'completed') {
    return {
      background: '#ecfdf3',
      color: '#067647',
      border: '1px solid #abefc6'
    }
  }
  if (status === 'in_progress') {
    return {
      background: '#eff8ff',
      color: '#175cd3',
      border: '1px solid #b2ddff'
    }
  }
  if (status === 'sent') {
    return {
      background: '#f5f8ff',
      color: '#3b5ccc',
      border: '1px solid #c7d7fe'
    }
  }
  return {
    background: '#f8fafd',
    color: '#667085',
    border: '1px solid #d5ddea'
  }
}

function StatCard({
  value,
  label
}: {
  value: string | number
  label: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
      }}
    >
      <div
        style={{
          fontSize: 58,
          lineHeight: 1,
          fontWeight: 900,
          color: '#223461',
          marginBottom: 14
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 19,
          lineHeight: 1.35,
          fontWeight: 700,
          color: '#667085'
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default async function TeamDashboardPage({ params }: PageProps) {
  const supabase = getServerClient()
  const teamId = params.teamId

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name, team_name, season, club_id, created_at')
    .eq('id', teamId)
    .single<TeamRow>()

  if (teamError || !team) {
    return (
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 28,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 42, color: '#16233b' }}>Équipe introuvable</h1>
          <p style={{ fontSize: 20, lineHeight: 1.7, color: '#5f6f8e' }}>
            Je n’ai pas trouvé cette équipe dans la base V11.
          </p>
          <Link href="/club" style={linkButtonStyle}>
            Retour club
          </Link>
        </div>
      </main>
    )
  }

  const { data: players = [] } = await supabase
    .from('players')
    .select('id, firstname, lastname, email, position, team_id, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })
    .returns<PlayerRow[]>()

  const { data: passations = [] } = await supabase
    .from('passations')
    .select('id, player_id, team_id, club_id, module, token, status, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .returns<PassationRow[]>()

  const passationTokens = passations
    .map((item) => item.token)
    .filter((token): token is string => Boolean(token))

  let cmpResults: CmpResultRow[] = []

  if (passationTokens.length > 0) {
    const { data } = await supabase
      .from('cmp_results')
      .select(
        'token, module, firstname, lastname, email, club_structure, profile_code, profile_label, score_global, created_at'
      )
      .in('token', passationTokens)
      .returns<CmpResultRow[]>()

    cmpResults = data || []
  }

  const passationsByPlayerId = new Map<string, PassationRow>()
  passations.forEach((passation) => {
    if (passation.player_id && !passationsByPlayerId.has(passation.player_id)) {
      passationsByPlayerId.set(passation.player_id, passation)
    }
  })

  const resultsByToken = new Map<string, CmpResultRow>()
  cmpResults.forEach((result) => {
    if (result.token && !resultsByToken.has(result.token)) {
      resultsByToken.set(result.token, result)
    }
  })

  const teamName = team.team_name || team.name || 'Équipe'
  const totalPlayers = players.length
  const totalPassations = passations.length
  const completedCount = passations.filter((item) => item.status === 'completed').length
  const pendingCount = passations.filter((item) => item.status === 'pending').length
  const inProgressCount = passations.filter((item) => item.status === 'in_progress').length
  const sentCount = passations.filter((item) => item.status === 'sent').length

  const scores = cmpResults
    .map((item) => item.score_global)
    .filter((score): score is number => typeof score === 'number')

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : '—'

  const latestPassationDate =
    passations.length > 0 ? formatDate(passations[0]?.created_at || null) : '—'

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          marginBottom: 22
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6f7f9d',
              marginBottom: 10
            }}
          >
            Dashboard équipe
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 54,
              lineHeight: 1,
              color: '#16233b'
            }}
          >
            {teamName}
          </h1>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            <span style={pillStyle}>ID équipe : {team.id}</span>
            <span style={pillStyle}>Saison : {team.season || '—'}</span>
            <span style={pillStyle}>Club : {team.club_id || '—'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/club" style={linkButtonStyle}>
            Retour club
          </Link>

          <Link href="/club/import-equipe" style={linkButtonStyle}>
            Import équipe
          </Link>

          <Link href="/passations" style={primaryButtonStyle}>
            Voir passations
          </Link>
        </div>
      </div>

      <section
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: '#5f6f8e',
            maxWidth: 980
          }}
        >
          Cette page centralise automatiquement les joueurs, les passations, la progression
          et l’accès direct aux rapports. C’est le tableau de pilotage de l’équipe.
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={totalPlayers} label="joueurs" />
        <StatCard value={totalPassations} label="passations" />
        <StatCard value={completedCount} label="tests terminés" />
        <StatCard value={averageScore} label="score moyen CMP" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={pendingCount} label="à faire" />
        <StatCard value={sentCount} label="envoyées" />
        <StatCard value={inProgressCount} label="en cours" />
        <StatCard value={latestPassationDate} label="dernière passation" />
      </section>

      <section
        style={{
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          overflow: 'hidden',
          marginBottom: 24
        }}
      >
        <div
          style={{
            padding: 24,
            borderBottom: '1px solid #e2e8f4'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1,
              color: '#16233b'
            }}
          >
            Progression équipe
          </h2>
        </div>

        <div
          style={{
            padding: 24,
            display: 'grid',
            gap: 18
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                color: '#223461',
                marginBottom: 8
              }}
            >
              <span>Complétion globale</span>
              <span>
                {totalPassations > 0 ? Math.round((completedCount / totalPassations) * 100) : 0}%
              </span>
            </div>

            <div
              style={{
                height: 18,
                borderRadius: 999,
                background: '#e8edf7',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${
                    totalPassations > 0 ? Math.round((completedCount / totalPassations) * 100) : 0
                  }%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #2f4d85 0%, #7896dd 100%)'
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14
            }}
          >
            <div style={miniCardStyle}>
              <div style={miniCardValueStyle}>{completedCount}</div>
              <div style={miniCardLabelStyle}>Terminées</div>
            </div>

            <div style={miniCardStyle}>
              <div style={miniCardValueStyle}>{inProgressCount}</div>
              <div style={miniCardLabelStyle}>En cours</div>
            </div>

            <div style={miniCardStyle}>
              <div style={miniCardValueStyle}>{sentCount}</div>
              <div style={miniCardLabelStyle}>Envoyées</div>
            </div>

            <div style={miniCardStyle}>
              <div style={miniCardValueStyle}>{pendingCount}</div>
              <div style={miniCardLabelStyle}>À faire</div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: 24,
            borderBottom: '1px solid #e2e8f4'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1,
              color: '#16233b'
            }}
          >
            Joueurs et passations
          </h2>
        </div>

        {players.length === 0 ? (
          <div style={{ padding: 24, fontSize: 19, color: '#667085' }}>
            Aucun joueur trouvé pour cette équipe.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 1200
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafd' }}>
                  <th style={thStyle}>Joueur</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Poste</th>
                  <th style={thStyle}>Module</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Token</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Profil</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const passation = passationsByPlayerId.get(player.id)
                  const result = passation?.token ? resultsByToken.get(passation.token) : undefined

                  const statusStyles = getStatusStyle(passation?.status)

                  const passationLink = passation?.token
                    ? `/passations/${passation.token}`
                    : null

                  const cmpReportLink = passation?.token
                    ? `https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/resultats.html?token=${encodeURIComponent(
                        passation.token
                      )}`
                    : null

                  return (
                    <tr key={player.id} style={{ borderTop: '1px solid #e2e8f4' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, color: '#16233b' }}>
                          {getFullName(player)}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13, color: '#667085' }}>
                          créé le {formatDate(player.created_at)}
                        </div>
                      </td>

                      <td style={tdStyle}>{player.email || '—'}</td>
                      <td style={tdStyle}>{player.position || '—'}</td>
                      <td style={tdStyle}>{passation?.module || '—'}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 999,
                            fontWeight: 800,
                            ...statusStyles
                          }}
                        >
                          {getStatusLabel(passation?.status)}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 13,
                            color: '#52607d',
                            wordBreak: 'break-all',
                            maxWidth: 180
                          }}
                        >
                          {passation?.token || '—'}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 900, color: '#223461', fontSize: 24 }}>
                          {typeof result?.score_global === 'number' ? result.score_global : '—'}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: '10px 14px',
                            borderRadius: 999,
                            background: '#eef2ff',
                            color: '#34518b',
                            fontWeight: 800,
                            maxWidth: 320
                          }}
                        >
                          {result?.profile_label || '—'}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {passationLink ? (
                            <Link href={passationLink} style={smallLinkButtonStyle}>
                              Ouvrir passation
                            </Link>
                          ) : null}

                          {cmpReportLink ? (
                            <a
                              href={cmpReportLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={smallPrimaryButtonStyle}
                            >
                              Voir rapport
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 700
}

const linkButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 18px',
  borderRadius: 16,
  border: '1px solid #d5ddea',
  color: '#173A73',
  background: '#fff',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const primaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 18px',
  borderRadius: 16,
  border: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #2f4d85 0%, #395da0 100%)',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 22px rgba(47, 77, 133, 0.22)'
}

const smallLinkButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid #d5ddea',
  color: '#173A73',
  background: '#fff',
  fontWeight: 700,
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const smallPrimaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '10px 12px',
  borderRadius: 12,
  border: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #2f4d85 0%, #395da0 100%)',
  fontWeight: 700,
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const miniCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: '1px solid #dce4f1',
  background: '#f8fafd'
}

const miniCardValueStyle: CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  color: '#223461',
  lineHeight: 1,
  marginBottom: 8
}

const miniCardLabelStyle: CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: '#667085'
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '20px 18px',
  fontSize: 14,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#667085',
  fontWeight: 900
}

const tdStyle: CSSProperties = {
  padding: '20px 18px',
  verticalAlign: 'top',
  fontSize: 16,
  color: '#1e2b45'
}
