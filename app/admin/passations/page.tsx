import type { CSSProperties } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type PassationRow = {
  id?: string | null
  token?: string | null
  module?: string | null
  status?: string | null
  player_id?: string | null
  team_id?: string | null
  club_id?: string | null
  created_at?: string | null
}

type PlayerRow = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
}

type TeamRow = {
  id: string
  name?: string | null
  team_name?: string | null
  club_id?: string | null
  season?: string | null
}

type CmpResultRow = {
  token?: string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
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
      color: '#34518b',
      border: '1px solid #c7d7fe'
    }
  }

  return {
    background: '#f8fafd',
    color: '#667085',
    border: '1px solid #d5ddea'
  }
}

function getFullName(firstname?: string | null, lastname?: string | null) {
  const value = [firstname || '', lastname || ''].filter(Boolean).join(' ').trim()
  return value || 'Sans nom'
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
          fontSize: 56,
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
          fontSize: 18,
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

export default async function AdminPassationsPage() {
  const supabase = getServerClient()

  const { data: passationsData } = await supabase
    .from('passations')
    .select('id, token, module, status, player_id, team_id, club_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const passations: PassationRow[] = passationsData ?? []

  const playerIds = Array.from(
    new Set(
      passations
        .map((item) => item.player_id)
        .filter((value): value is string => Boolean(value))
    )
  )

  const teamIds = Array.from(
    new Set(
      passations
        .map((item) => item.team_id)
        .filter((value): value is string => Boolean(value))
    )
  )

  const tokens = Array.from(
    new Set(
      passations
        .map((item) => item.token)
        .filter((value): value is string => Boolean(value))
    )
  )

  let players: PlayerRow[] = []
  if (playerIds.length > 0) {
    const { data } = await supabase
      .from('players')
      .select('id, firstname, lastname, email, team_id')
      .in('id', playerIds)

    players = (data ?? []) as PlayerRow[]
  }

  let teams: TeamRow[] = []
  if (teamIds.length > 0) {
    const { data } = await supabase
      .from('teams')
      .select('id, name, team_name, club_id, season')
      .in('id', teamIds)

    teams = (data ?? []) as TeamRow[]
  }

  let cmpResults: CmpResultRow[] = []
  if (tokens.length > 0) {
    const { data } = await supabase
      .from('cmp_results')
      .select(
        'token, firstname, lastname, email, profile_code, profile_label, score_global, created_at'
      )
      .in('token', tokens)

    cmpResults = (data ?? []) as CmpResultRow[]
  }

  const playersById = new Map<string, PlayerRow>()
  players.forEach((player) => {
    playersById.set(player.id, player)
  })

  const teamsById = new Map<string, TeamRow>()
  teams.forEach((team) => {
    teamsById.set(team.id, team)
  })

  const cmpResultsByToken = new Map<string, CmpResultRow>()
  cmpResults.forEach((result) => {
    if (result.token && !cmpResultsByToken.has(result.token)) {
      cmpResultsByToken.set(result.token, result)
    }
  })

  const total = passations.length
  const pendingCount = passations.filter((item) => item.status === 'pending').length
  const sentCount = passations.filter((item) => item.status === 'sent').length
  const inProgressCount = passations.filter((item) => item.status === 'in_progress').length
  const completedCount = passations.filter((item) => item.status === 'completed').length

  const scores = cmpResults
    .map((item) => item.score_global)
    .filter((value): value is number => typeof value === 'number')

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : '—'

  const latestDate = total > 0 ? formatDate(passations[0]?.created_at || null) : '—'

  return (
    <main style={{ maxWidth: 1600, margin: '0 auto', padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
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
            Cockpit admin A4P
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 54,
              lineHeight: 1,
              color: '#16233b'
            }}
          >
            Passations
          </h1>

          <p
            style={{
              marginTop: 16,
              maxWidth: 980,
              fontSize: 19,
              lineHeight: 1.8,
              color: '#5f6f8e'
            }}
          >
            Cette page centralise toutes les passations générées dans la plateforme A4P :
            token, statut, joueur, équipe, score et accès direct au rapport individuel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin" style={secondaryButtonStyle}>
            Cockpit admin
          </Link>

          <Link href="/admin/resultats" style={secondaryButtonStyle}>
            Résultats
          </Link>

          <Link href="/club/import-equipe" style={primaryButtonStyle}>
            Import équipe
          </Link>
        </div>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={total} label="passations" />
        <StatCard value={completedCount} label="terminées" />
        <StatCard value={pendingCount} label="à faire" />
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
        <StatCard value={sentCount} label="envoyées" />
        <StatCard value={inProgressCount} label="en cours" />
        <StatCard value={cmpResults.length} label="réponses CMP" />
        <StatCard value={latestDate} label="dernière passation" />
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
              fontSize: 40,
              lineHeight: 1,
              color: '#16233b'
            }}
          >
            Liste des passations
          </h2>
        </div>

        {passations.length === 0 ? (
          <div style={{ padding: 24, fontSize: 19, color: '#667085' }}>
            Aucune passation trouvée.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 1520
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafd' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Joueur</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Équipe</th>
                  <th style={thStyle}>Module</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Token</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Profil</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {passations.map((passation, index) => {
                  const player = passation.player_id ? playersById.get(passation.player_id) : undefined
                  const team = passation.team_id ? teamsById.get(passation.team_id) : undefined
                  const result = passation.token
                    ? cmpResultsByToken.get(passation.token)
                    : undefined

                  const teamName = team?.team_name || team?.name || '—'
                  const playerName = player
                    ? getFullName(player.firstname, player.lastname)
                    : result
                      ? getFullName(result.firstname, result.lastname)
                      : 'Sans nom'

                  const score =
                    typeof result?.score_global === 'number' ? `${result.score_global}/100` : '—'

                  const resultAvailable =
                    typeof result?.score_global === 'number' || Boolean(result?.profile_label)

                  const passationUrl = passation.token
                    ? `/passations/${encodeURIComponent(passation.token)}`
                    : null

                  const reportUrl =
                    passation.token && passation.module === 'CMP'
                      ? `https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/resultats.html?token=${encodeURIComponent(
                          passation.token
                        )}`
                      : null

                  const teamUrl = passation.team_id
                    ? `/club/equipes/${encodeURIComponent(passation.team_id)}`
                    : null

                  return (
                    <tr key={`${passation.id || passation.token || index}`} style={{ borderTop: '1px solid #e2e8f4' }}>
                      <td style={tdStyle}>{formatDate(passation.created_at)}</td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, color: '#16233b' }}>{playerName}</div>
                        {player?.id ? (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: '#667085',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all'
                            }}
                          >
                            {player.id}
                          </div>
                        ) : null}
                      </td>

                      <td style={tdStyle}>{player?.email || result?.email || '—'}</td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: '#1e2b45' }}>{teamName}</div>
                        {teamUrl ? (
                          <div style={{ marginTop: 8 }}>
                            <Link href={teamUrl} style={inlineLinkStyle}>
                              Ouvrir équipe
                            </Link>
                          </div>
                        ) : null}
                      </td>

                      <td style={tdStyle}>{passation.module || '—'}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 999,
                            fontWeight: 800,
                            ...getStatusStyle(passation.status)
                          }}
                        >
                          {getStatusLabel(passation.status)}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 13,
                            color: '#52607d',
                            wordBreak: 'break-all',
                            maxWidth: 220
                          }}
                        >
                          {passation.token || '—'}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 900,
                            color: '#223461'
                          }}
                        >
                          {score}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {result?.profile_label ? (
                          <span
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
                            {result.profile_label}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {passationUrl ? (
                            <Link href={passationUrl} style={smallSecondaryButtonStyle}>
                              Ouvrir passation
                            </Link>
                          ) : null}

                          {reportUrl && resultAvailable ? (
                            <a
                              href={reportUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={smallPrimaryButtonStyle}
                            >
                              Voir rapport
                            </a>
                          ) : (
                            <span
                              style={{
                                ...smallDisabledButtonStyle
                              }}
                            >
                              Rapport indisponible
                            </span>
                          )}
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

const secondaryButtonStyle: CSSProperties = {
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

const smallSecondaryButtonStyle: CSSProperties = {
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

const smallDisabledButtonStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid #e2e8f4',
  color: '#98a2b3',
  background: '#f8fafd',
  fontWeight: 700,
  fontSize: 14,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const inlineLinkStyle: CSSProperties = {
  color: '#34518b',
  fontWeight: 700,
  textDecoration: 'none'
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
