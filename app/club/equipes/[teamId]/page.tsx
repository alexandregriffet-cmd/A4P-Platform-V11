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
  const fullName = [player.firstname || '', player.lastname || '']
    .filter(Boolean)
    .join(' ')
    .trim()

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
    <div style={statCardStyle}>
      <div style={statValueStyle}>{value}</div>
      <div style={statLabelStyle}>{label}</div>
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
      <main style={pageStyle}>
        <section style={sectionCardStyle}>
          <div style={eyebrowStyle}>Dashboard équipe</div>
          <h1 style={titleStyle}>Équipe introuvable</h1>
          <p style={leadStyle}>
            Je n’ai pas trouvé cette équipe dans la base V11.
          </p>
          <div style={actionsWrapStyle}>
            <Link href="/club" style={secondaryButtonStyle}>
              Retour club
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const playersResponse = await supabase
    .from('players')
    .select('id, firstname, lastname, email, position, team_id, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })
    .returns<PlayerRow[]>()

  const players: PlayerRow[] = playersResponse.data ?? []

  const passationsResponse = await supabase
    .from('passations')
    .select('id, player_id, team_id, club_id, module, token, status, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .returns<PassationRow[]>()

  const passations: PassationRow[] = passationsResponse.data ?? []

  const passationTokens = passations
    .map((item) => item.token)
    .filter((token): token is string => Boolean(token))

  let cmpResults: CmpResultRow[] = []

  if (passationTokens.length > 0) {
    const cmpResultsResponse = await supabase
      .from('cmp_results')
      .select(
        'token, module, firstname, lastname, email, club_structure, profile_code, profile_label, score_global, created_at'
      )
      .in('token', passationTokens)
      .returns<CmpResultRow[]>()

    cmpResults = cmpResultsResponse.data ?? []
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
  const responseCount = cmpResults.length

  const completedCount = passations.filter((item) => item.status === 'completed').length
  const pendingCount = passations.filter((item) => item.status === 'pending').length
  const inProgressCount = passations.filter((item) => item.status === 'in_progress').length
  const sentCount = passations.filter((item) => item.status === 'sent').length

  const completionPercent =
    totalPassations > 0 ? Math.round((completedCount / totalPassations) * 100) : 0

  const scores = cmpResults
    .map((item) => item.score_global)
    .filter((score): score is number => typeof score === 'number')

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0

  const latestResultDate =
    cmpResults.length > 0
      ? formatDate(
          cmpResults
            .slice()
            .sort((a, b) => {
              const da = a.created_at ? new Date(a.created_at).getTime() : 0
              const db = b.created_at ? new Date(b.created_at).getTime() : 0
              return db - da
            })[0]?.created_at || null
        )
      : '—'

  return (
    <main style={pageStyle}>
      <section style={heroCardStyle}>
        <div style={eyebrowStyle}>Dashboard équipe</div>
        <h1 style={heroTitleStyle}>{teamName}</h1>

        <div style={pillWrapStyle}>
          <span style={pillStyle}>ID équipe : {team.id}</span>
          <span style={pillStyle}>Saison : {team.season || '—'}</span>
          <span style={pillStyle}>Club : {team.club_id || '—'}</span>
        </div>

        <div style={actionsWrapStyle}>
          <Link href="/club" style={secondaryButtonStyle}>
            Retour club
          </Link>

          <Link href="/club/import-equipe" style={secondaryButtonStyle}>
            Import équipe
          </Link>

          <Link href="/passations" style={primaryButtonStyle}>
            Voir passations
          </Link>
        </div>

        <p style={leadStyle}>
          Cette page centralise automatiquement les joueurs, les passations,
          les réponses CMP, la progression de complétion et l’accès direct
          aux rapports individuels. C’est la version club à montrer en rendez-vous.
        </p>
      </section>

      <section style={statsGridStyle}>
        <StatCard value={totalPlayers} label="joueurs" />
        <StatCard value={totalPassations} label="passations" />
        <StatCard value={responseCount} label="réponses CMP" />
        <StatCard value={averageScore} label="score moyen CMP" />
        <StatCard value={pendingCount} label="à faire" />
        <StatCard value={completedCount} label="terminées" />
        <StatCard value={inProgressCount} label="en cours" />
        <StatCard value={sentCount} label="envoyées" />
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Progression équipe</h2>
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 22 }}>
          <div>
            <div style={progressHeadStyle}>
              <span>Complétion globale</span>
              <span>{completionPercent}%</span>
            </div>

            <div style={progressTrackStyle}>
              <div
                style={{
                  ...progressFillStyle,
                  width: `${completionPercent}%`
                }}
              />
            </div>
          </div>

          <div style={statsGridStyle}>
            <StatCard value={completedCount} label="terminées" />
            <StatCard value={inProgressCount} label="en cours" />
            <StatCard value={sentCount} label="envoyées" />
            <StatCard value={pendingCount} label="à faire" />
            <StatCard value={responseCount} label="réponses enregistrées" />
            <StatCard value={averageScore} label="score moyen" />
            <StatCard value={latestResultDate} label="dernière réponse" />
            <StatCard value={teamName} label="équipe" />
          </div>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Joueurs et passations</h2>
        </div>

        {players.length === 0 ? (
          <div style={{ padding: 24, fontSize: 19, color: '#667085' }}>
            Aucun joueur trouvé pour cette équipe.
          </div>
        ) : (
          <div style={playerCardsWrapStyle}>
            {players.map((player) => {
              const passation = passationsByPlayerId.get(player.id)
              const result = passation?.token ? resultsByToken.get(passation.token) : undefined
              const hasResult = Boolean(result)

              const passationLink = passation?.token
                ? `/passations/${passation.token}`
                : null

              const reportLink = passation?.token
                ? `https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/resultats.html?token=${encodeURIComponent(
                    passation.token
                  )}`
                : null

              return (
                <article key={player.id} style={playerCardStyle}>
                  <div style={playerTopRowStyle}>
                    <div>
                      <div style={playerNameStyle}>{getFullName(player)}</div>
                      <div style={playerMetaStyle}>
                        créé le {formatDate(player.created_at)}
                      </div>
                    </div>

                    <span
                      style={{
                        ...statusPillStyle,
                        ...getStatusStyle(passation?.status)
                      }}
                    >
                      {getStatusLabel(passation?.status)}
                    </span>
                  </div>

                  <div style={infoGridStyle}>
                    <InfoBox label="Email" value={player.email || '—'} />
                    <InfoBox label="Module" value={passation?.module || '—'} />
                    <InfoBox
                      label="Réponse"
                      value={hasResult ? 'Oui' : 'Non'}
                      tone={hasResult ? 'success' : 'neutral'}
                    />
                    <InfoBox
                      label="Score"
                      value={
                        typeof result?.score_global === 'number'
                          ? `${result.score_global}/100`
                          : '—'
                      }
                      strong
                    />
                  </div>

                  <div style={profileWrapStyle}>
                    <div style={profileLabelTitleStyle}>Profil</div>
                    <div style={profilePillStyle}>
                      {result?.profile_label || 'Rapport non disponible'}
                    </div>
                  </div>

                  <div style={tokenBoxStyle}>
                    <div style={tokenTitleStyle}>Token de passation</div>
                    <div style={tokenValueStyle}>{passation?.token || '—'}</div>
                  </div>

                  <div style={datesGridStyle}>
                    <InfoBox label="Date passation" value={formatDate(passation?.created_at || null)} />
                    <InfoBox label="Date réponse" value={formatDate(result?.created_at || null)} />
                  </div>

                  <div style={cardActionsStyle}>
                    {passationLink ? (
                      <Link href={passationLink} style={secondaryButtonStyle}>
                        Ouvrir passation
                      </Link>
                    ) : (
                      <span style={disabledButtonStyle}>Passation indisponible</span>
                    )}

                    {reportLink && hasResult ? (
                      <a
                        href={reportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={primaryButtonStyle}
                      >
                        Voir rapport individuel
                      </a>
                    ) : (
                      <span style={disabledButtonStyle}>Rapport non disponible</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

function InfoBox({
  label,
  value,
  strong = false,
  tone = 'neutral'
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'neutral' | 'success'
}) {
  const toneStyles =
    tone === 'success'
      ? {
          background: '#ecfdf3',
          border: '1px solid #abefc6',
          color: '#067647'
        }
      : {
          background: '#f8fafd',
          border: '1px solid #dce4f1',
          color: '#1e2b45'
        }

  return (
    <div
      style={{
        ...infoBoxStyle,
        ...toneStyles
      }}
    >
      <div style={infoBoxLabelStyle}>{label}</div>
      <div
        style={{
          ...infoBoxValueStyle,
          fontWeight: strong ? 900 : 700
        }}
      >
        {value}
      </div>
    </div>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 1440,
  margin: '0 auto',
  padding: 24,
  display: 'grid',
  gap: 24
}

const heroCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 28,
  padding: 28,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
  display: 'grid',
  gap: 18
}

const sectionCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 28,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
  overflow: 'hidden'
}

const sectionHeaderStyle: CSSProperties = {
  padding: 24,
  borderBottom: '1px solid #e2e8f4'
}

const eyebrowStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#6f7f9d'
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 42,
  lineHeight: 1,
  color: '#16233b'
}

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 56,
  lineHeight: 1,
  color: '#16233b',
  wordBreak: 'break-word'
}

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 44,
  lineHeight: 1,
  color: '#16233b'
}

const leadStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.8,
  color: '#5f6f8e',
  maxWidth: 980
}

const pillWrapStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap'
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

const actionsWrapStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap'
}

const primaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 18px',
  borderRadius: 16,
  border: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #2f4d85 0%, #395da0 100%)',
  fontWeight: 800,
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
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const disabledButtonStyle: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 16,
  border: '1px solid #d5ddea',
  color: '#98a2b3',
  background: '#f8fafd',
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 18
}

const statCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
}

const statValueStyle: CSSProperties = {
  fontSize: 58,
  lineHeight: 1,
  fontWeight: 900,
  color: '#223461',
  marginBottom: 14,
  wordBreak: 'break-word'
}

const statLabelStyle: CSSProperties = {
  fontSize: 19,
  lineHeight: 1.35,
  fontWeight: 700,
  color: '#667085'
}

const progressHeadStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontWeight: 800,
  color: '#223461',
  marginBottom: 8,
  fontSize: 18
}

const progressTrackStyle: CSSProperties = {
  height: 18,
  borderRadius: 999,
  background: '#e8edf7',
  overflow: 'hidden'
}

const progressFillStyle: CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #2f4d85 0%, #7896dd 100%)'
}

const playerCardsWrapStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gap: 18
}

const playerCardStyle: CSSProperties = {
  border: '1px solid #e2e8f4',
  borderRadius: 24,
  background: '#fbfcff',
  padding: 20,
  display: 'grid',
  gap: 18
}

const playerTopRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
}

const playerNameStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  color: '#16233b',
  lineHeight: 1.1
}

const playerMetaStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 14,
  color: '#667085'
}

const statusPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 800
}

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12
}

const infoBoxStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14
}

const infoBoxLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6f7f9d',
  marginBottom: 8
}

const infoBoxValueStyle: CSSProperties = {
  fontSize: 18,
  color: '#1e2b45',
  lineHeight: 1.4,
  wordBreak: 'break-word'
}

const profileWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 8
}

const profileLabelTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#6f7f9d'
}

const profilePillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  maxWidth: '100%',
  padding: '12px 16px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 800,
  fontSize: 16,
  lineHeight: 1.4,
  wordBreak: 'break-word'
}

const tokenBoxStyle: CSSProperties = {
  background: '#0c244b',
  color: '#eef4ff',
  borderRadius: 18,
  padding: 16
}

const tokenTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#cbd8ff',
  marginBottom: 8
}

const tokenValueStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 14,
  lineHeight: 1.7,
  wordBreak: 'break-all'
}

const datesGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 12
}

const cardActionsStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap'
}
