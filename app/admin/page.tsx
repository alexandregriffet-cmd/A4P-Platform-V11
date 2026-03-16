import type { CSSProperties } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type ClubRow = {
  id: string
  name?: string | null
  club_name?: string | null
  created_at?: string | null
}

type TeamRow = {
  id: string
  name?: string | null
  team_name?: string | null
  club_id?: string | null
  season?: string | null
  created_at?: string | null
}

type PlayerRow = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
  created_at?: string | null
}

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

type CmpResultRow = {
  token?: string | null
  module?: string | null
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
    throw new Error('Variables Supabase manquantes pour /admin.')
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

function getClubLabel(club?: ClubRow | null) {
  if (!club) return '—'
  return club.name || club.club_name || 'Club sans nom'
}

function getTeamLabel(team?: TeamRow | null) {
  if (!team) return '—'
  return team.team_name || team.name || 'Équipe sans nom'
}

function getPlayerFullName(player?: {
  firstname?: string | null
  lastname?: string | null
}) {
  if (!player) return 'Joueur inconnu'
  const fullName = [player.firstname || '', player.lastname || '']
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || 'Joueur sans nom'
}

function getResultFullName(result?: {
  firstname?: string | null
  lastname?: string | null
}) {
  if (!result) return 'Sportif inconnu'
  const fullName = [result.firstname || '', result.lastname || '']
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || 'Sportif sans nom'
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
      background: '#eef4ff',
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

function scoreAverage(values: Array<number | null | undefined>) {
  const numeric = values.filter((value): value is number => typeof value === 'number')
  if (!numeric.length) return '—'
  return Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length)
}

function StatCard({
  value,
  label,
  helper
}: {
  value: string | number
  label: string
  helper?: string
}) {
  return (
    <div style={statCardStyle}>
      <div style={statValueStyle}>{value}</div>
      <div style={statLabelStyle}>{label}</div>
      {helper ? <div style={statHelperStyle}>{helper}</div> : null}
    </div>
  )
}

export default async function AdminHomePage() {
  const supabase = getServerClient()

  const [
    clubsResponse,
    teamsResponse,
    playersResponse,
    passationsResponse,
    cmpResultsResponse
  ] = await Promise.all([
    supabase
      .from('clubs')
      .select('id, name, club_name, created_at')
      .order('created_at', { ascending: false })
      .returns<ClubRow[]>(),
    supabase
      .from('teams')
      .select('id, name, team_name, club_id, season, created_at')
      .order('created_at', { ascending: false })
      .returns<TeamRow[]>(),
    supabase
      .from('players')
      .select('id, firstname, lastname, email, team_id, created_at')
      .order('created_at', { ascending: false })
      .returns<PlayerRow[]>(),
    supabase
      .from('passations')
      .select('id, token, module, status, player_id, team_id, club_id, created_at')
      .order('created_at', { ascending: false })
      .returns<PassationRow[]>(),
    supabase
      .from('cmp_results')
      .select(
        'token, module, firstname, lastname, email, profile_code, profile_label, score_global, created_at'
      )
      .order('created_at', { ascending: false })
      .returns<CmpResultRow[]>()
  ])

  const clubs = clubsResponse.data ?? []
  const teams = teamsResponse.data ?? []
  const players = playersResponse.data ?? []
  const passations = passationsResponse.data ?? []
  const cmpResults = cmpResultsResponse.data ?? []

  const clubsById = new Map<string, ClubRow>()
  clubs.forEach((club) => {
    clubsById.set(club.id, club)
  })

  const teamsById = new Map<string, TeamRow>()
  teams.forEach((team) => {
    teamsById.set(team.id, team)
  })

  const playersById = new Map<string, PlayerRow>()
  players.forEach((player) => {
    playersById.set(player.id, player)
  })

  const totalClubs = clubs.length
  const totalTeams = teams.length
  const totalPlayers = players.length
  const totalPassations = passations.length
  const totalCmpResults = cmpResults.length

  const completedCount = passations.filter((item) => item.status === 'completed').length
  const pendingCount = passations.filter((item) => item.status === 'pending').length
  const inProgressCount = passations.filter((item) => item.status === 'in_progress').length
  const sentCount = passations.filter((item) => item.status === 'sent').length

  const averageCmpScore = scoreAverage(cmpResults.map((item) => item.score_global))

  const lastClub = clubs[0]
  const lastTeam = teams[0]
  const lastPassation = passations[0]
  const lastResult = cmpResults[0]

  const recentPassations = passations.slice(0, 6)
  const recentResults = cmpResults.slice(0, 6)
  const recentClubs = clubs.slice(0, 5)
  const recentTeams = teams.slice(0, 5)

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={heroTopStyle}>
          <div>
            <div style={eyebrowStyle}>Cockpit admin A4P</div>
            <h1 style={heroTitleStyle}>Piloter toute la plateforme depuis un seul écran.</h1>
            <p style={heroTextStyle}>
              Ce cockpit centralise la vision globale de ton SaaS : clubs, équipes, joueurs,
              passations, résultats CMP et activité récente. C’est la base de supervision
              complète pour l’administrateur A4P.
            </p>
          </div>

          <div style={heroActionsStyle}>
            <Link href="/admin/clubs" style={primaryButtonStyle}>
              Gérer les clubs
            </Link>
            <Link href="/admin/passations" style={secondaryButtonStyle}>
              Voir les passations
            </Link>
            <Link href="/admin/resultats" style={secondaryButtonStyle}>
              Voir les résultats
            </Link>
          </div>
        </div>
      </section>

      <section style={gridStatsStyle}>
        <StatCard value={totalClubs} label="clubs" helper="structures enregistrées" />
        <StatCard value={totalTeams} label="équipes" helper="groupes créés" />
        <StatCard value={totalPlayers} label="joueurs" helper="sportifs enregistrés" />
        <StatCard value={totalPassations} label="passations" helper="liens générés" />
        <StatCard value={totalCmpResults} label="résultats CMP" helper="réponses enregistrées" />
        <StatCard value={averageCmpScore} label="score moyen CMP" helper="moyenne actuelle" />
      </section>

      <section style={gridStatsStyle}>
        <StatCard value={completedCount} label="terminées" helper="tests finalisés" />
        <StatCard value={pendingCount} label="à faire" helper="liens non complétés" />
        <StatCard value={inProgressCount} label="en cours" helper="questionnaires commencés" />
        <StatCard value={sentCount} label="envoyées" helper="passations transmises" />
        <StatCard
          value={lastPassation ? formatDate(lastPassation.created_at) : '—'}
          label="dernière passation"
          helper="activité récente"
        />
        <StatCard
          value={lastResult ? formatDate(lastResult.created_at) : '—'}
          label="dernier résultat CMP"
          helper="réponse la plus récente"
        />
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Raccourcis stratégiques</h2>
            <p style={panelTextStyle}>
              Accès direct vers les zones qui servent au quotidien pour administrer le SaaS.
            </p>
          </div>

          <div style={shortcutGridStyle}>
            <Link href="/admin/clubs" style={shortcutCardStyle}>
              <div style={shortcutTitleStyle}>Créer clubs et équipes</div>
              <div style={shortcutTextStyle}>
                Créer une structure, une équipe, importer des joueurs et générer les passations.
              </div>
            </Link>

            <Link href="/club/import-equipe" style={shortcutCardStyle}>
              <div style={shortcutTitleStyle}>Import équipe</div>
              <div style={shortcutTextStyle}>
                Import rapide d’une équipe avec joueurs et liens individuels.
              </div>
            </Link>

            <Link href="/admin/passations" style={shortcutCardStyle}>
              <div style={shortcutTitleStyle}>Cockpit passations</div>
              <div style={shortcutTextStyle}>
                Vérifier les statuts, les tokens, les modules et la progression.
              </div>
            </Link>

            <Link href="/admin/resultats" style={shortcutCardStyle}>
              <div style={shortcutTitleStyle}>Cockpit résultats</div>
              <div style={shortcutTextStyle}>
                Accéder aux rapports CMP, filtrer et préparer les débriefings.
              </div>
            </Link>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Résumé opérationnel</h2>
            <p style={panelTextStyle}>
              Vue courte sur les dernières entités créées dans la base.
            </p>
          </div>

          <div style={summaryGridStyle}>
            <SummaryLine label="Dernier club" value={getClubLabel(lastClub)} />
            <SummaryLine label="Dernière équipe" value={getTeamLabel(lastTeam)} />
            <SummaryLine
              label="Dernière passation"
              value={lastPassation?.token || '—'}
              mono
            />
            <SummaryLine
              label="Dernier résultat"
              value={lastResult?.profile_label || '—'}
            />
            <SummaryLine
              label="Date dernier résultat"
              value={lastResult ? formatDate(lastResult.created_at) : '—'}
            />
            <SummaryLine
              label="Score dernier CMP"
              value={
                typeof lastResult?.score_global === 'number'
                  ? `${lastResult.score_global}/100`
                  : '—'
              }
            />
          </div>
        </div>
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Activité récente — passations</h2>
            <p style={panelTextStyle}>
              Les derniers liens générés ou utilisés sur la plateforme.
            </p>
          </div>

          {recentPassations.length === 0 ? (
            <div style={emptyStyle}>Aucune passation enregistrée pour le moment.</div>
          ) : (
            <div style={listStyle}>
              {recentPassations.map((item, index) => {
                const player = item.player_id ? playersById.get(item.player_id) : undefined
                const team = item.team_id ? teamsById.get(item.team_id) : undefined
                const club = item.club_id ? clubsById.get(item.club_id) : undefined

                return (
                  <div key={`${item.token || item.id || 'passation'}-${index}`} style={rowCardStyle}>
                    <div style={rowTopStyle}>
                      <div style={rowMainTitleStyle}>
                        {player ? getPlayerFullName(player) : 'Joueur non rattaché'}
                      </div>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          ...getStatusStyle(item.status)
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div style={metaGridStyle}>
                      <MetaBox label="Module" value={item.module || '—'} />
                      <MetaBox label="Token" value={item.token || '—'} mono />
                      <MetaBox label="Équipe" value={getTeamLabel(team)} />
                      <MetaBox label="Club" value={getClubLabel(club)} />
                      <MetaBox label="Créée le" value={formatDate(item.created_at)} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Activité récente — résultats CMP</h2>
            <p style={panelTextStyle}>
              Les derniers diagnostics effectivement remontés dans Supabase.
            </p>
          </div>

          {recentResults.length === 0 ? (
            <div style={emptyStyle}>Aucun résultat CMP enregistré pour le moment.</div>
          ) : (
            <div style={listStyle}>
              {recentResults.map((item, index) => (
                <div key={`${item.token || 'result'}-${index}`} style={rowCardStyle}>
                  <div style={rowTopStyle}>
                    <div style={rowMainTitleStyle}>{getResultFullName(item)}</div>
                    <span style={scorePillStyle}>
                      {typeof item.score_global === 'number' ? `${item.score_global}/100` : '—'}
                    </span>
                  </div>

                  <div style={metaGridStyle}>
                    <MetaBox label="Profil" value={item.profile_label || '—'} />
                    <MetaBox label="Code" value={item.profile_code || '—'} />
                    <MetaBox label="Token" value={item.token || '—'} mono />
                    <MetaBox label="Date résultat" value={formatDate(item.created_at)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Derniers clubs</h2>
            <p style={panelTextStyle}>Les structures récemment créées.</p>
          </div>

          {recentClubs.length === 0 ? (
            <div style={emptyStyle}>Aucun club enregistré.</div>
          ) : (
            <div style={simpleListStyle}>
              {recentClubs.map((club) => (
                <div key={club.id} style={simpleRowStyle}>
                  <div>
                    <div style={simpleTitleStyle}>{getClubLabel(club)}</div>
                    <div style={simpleSubStyle}>{club.id}</div>
                  </div>
                  <div style={simpleDateStyle}>{formatDate(club.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Dernières équipes</h2>
            <p style={panelTextStyle}>Les groupes les plus récemment créés.</p>
          </div>

          {recentTeams.length === 0 ? (
            <div style={emptyStyle}>Aucune équipe enregistrée.</div>
          ) : (
            <div style={simpleListStyle}>
              {recentTeams.map((team) => {
                const club = team.club_id ? clubsById.get(team.club_id) : undefined

                return (
                  <div key={team.id} style={simpleRowStyle}>
                    <div>
                      <div style={simpleTitleStyle}>{getTeamLabel(team)}</div>
                      <div style={simpleSubStyle}>
                        Club : {getClubLabel(club)} • Saison : {team.season || '—'}
                      </div>
                    </div>
                    <div style={simpleDateStyle}>{formatDate(team.created_at)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function SummaryLine({
  label,
  value,
  mono = false
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div style={summaryLineStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div
        style={{
          ...summaryValueStyle,
          ...(mono
            ? {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13
              }
            : null)
        }}
      >
        {value}
      </div>
    </div>
  )
}

function MetaBox({
  label,
  value,
  mono = false
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div style={metaBoxStyle}>
      <div style={metaLabelStyle}>{label}</div>
      <div
        style={{
          ...metaValueStyle,
          ...(mono
            ? {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13,
                wordBreak: 'break-all'
              }
            : null)
        }}
      >
        {value}
      </div>
    </div>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 1480,
  margin: '0 auto',
  padding: 24,
  background: '#eef2f7'
}

const heroStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
  borderRadius: 30,
  padding: 30,
  boxShadow: '0 18px 48px rgba(18, 35, 66, 0.08)',
  marginBottom: 24
}

const heroTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  flexWrap: 'wrap',
  alignItems: 'flex-start'
}

const eyebrowStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#7180a0',
  marginBottom: 12
}

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 56,
  lineHeight: 1.02,
  color: '#182847',
  maxWidth: 860
}

const heroTextStyle: CSSProperties = {
  margin: '18px 0 0 0',
  fontSize: 22,
  lineHeight: 1.75,
  color: '#5f6f8e',
  maxWidth: 980
}

const heroActionsStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center'
}

const primaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 20px',
  borderRadius: 16,
  border: 'none',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #2f4d85 0%, #4168b0 100%)',
  fontWeight: 800,
  fontSize: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 12px 26px rgba(47, 77, 133, 0.22)'
}

const secondaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 20px',
  borderRadius: 16,
  border: '1px solid #d8e1ef',
  color: '#284378',
  background: '#ffffff',
  fontWeight: 800,
  fontSize: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const gridStatsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 18,
  marginBottom: 24
}

const statCardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 26,
  padding: 24,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
}

const statValueStyle: CSSProperties = {
  fontSize: 58,
  lineHeight: 1,
  fontWeight: 900,
  color: '#223461',
  marginBottom: 12
}

const statLabelStyle: CSSProperties = {
  fontSize: 20,
  lineHeight: 1.35,
  fontWeight: 800,
  color: '#667085'
}

const statHelperStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 1.5,
  color: '#8a96ad'
}

const twoColumnsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
  gap: 24,
  marginBottom: 24
}

const panelStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 28,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
  overflow: 'hidden'
}

const panelHeaderStyle: CSSProperties = {
  padding: 24,
  borderBottom: '1px solid #e5ebf5'
}

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 38,
  lineHeight: 1.05,
  color: '#182847'
}

const panelTextStyle: CSSProperties = {
  margin: '12px 0 0 0',
  fontSize: 18,
  lineHeight: 1.7,
  color: '#667085'
}

const shortcutGridStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14
}

const shortcutCardStyle: CSSProperties = {
  textDecoration: 'none',
  display: 'block',
  padding: 18,
  borderRadius: 20,
  border: '1px solid #dfe6f2',
  background: '#f8fafd',
  color: '#182847'
}

const shortcutTitleStyle: CSSProperties = {
  fontSize: 19,
  fontWeight: 900,
  lineHeight: 1.3,
  marginBottom: 10
}

const shortcutTextStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: '#667085'
}

const summaryGridStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gap: 12
}

const summaryLineStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  border: '1px solid #e1e8f3',
  background: '#f8fafd'
}

const summaryLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#7a869d',
  marginBottom: 8
}

const summaryValueStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  lineHeight: 1.45,
  color: '#1d2d4e'
}

const emptyStyle: CSSProperties = {
  padding: 24,
  fontSize: 18,
  lineHeight: 1.7,
  color: '#667085'
}

const listStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gap: 14
}

const rowCardStyle: CSSProperties = {
  border: '1px solid #e1e8f3',
  borderRadius: 22,
  background: '#f8fafd',
  padding: 18
}

const rowTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center',
  marginBottom: 14
}

const rowMainTitleStyle: CSSProperties = {
  fontSize: 21,
  fontWeight: 900,
  color: '#182847'
}

const statusBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: 999,
  fontWeight: 900,
  fontSize: 14
}

const scorePillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 900,
  fontSize: 15
}

const metaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12
}

const metaBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: '1px solid #e2e8f4',
  background: '#ffffff'
}

const metaLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#7a869d',
  marginBottom: 8
}

const metaValueStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.5,
  fontWeight: 800,
  color: '#1e2b45'
}

const simpleListStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gap: 12
}

const simpleRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
  border: '1px solid #e1e8f3',
  borderRadius: 18,
  background: '#f8fafd',
  padding: 16
}

const simpleTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: '#182847',
  marginBottom: 6
}

const simpleSubStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: '#667085'
}

const simpleDateStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#4c5d7b'
}
