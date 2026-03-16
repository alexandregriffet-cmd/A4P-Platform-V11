'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ProfileRow = {
  id?: string | null
  user_id?: string | null
  role?: string | null
  club_id?: string | null
  player_id?: string | null
  firstname?: string | null
  lastname?: string | null
  full_name?: string | null
  email?: string | null
  status?: string | null
}

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
  season?: string | null
  club_id?: string | null
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
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | null
  created_at?: string | null
}

type PortalState = {
  loading: boolean
  error: string
  userEmail: string
  profile: ProfileRow | null
  club: ClubRow | null
  clubs: ClubRow[]
  teams: TeamRow[]
  players: PlayerRow[]
  passations: PassationRow[]
  cmpResults: CmpResultRow[]
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
  if (!club) return 'Club'
  return club.name || club.club_name || 'Club sans nom'
}

function getTeamLabel(team?: TeamRow | null) {
  if (!team) return 'Équipe'
  return team.team_name || team.name || 'Équipe sans nom'
}

function getPlayerFullName(player?: {
  firstname?: string | null
  lastname?: string | null
  full_name?: string | null
}) {
  if (!player) return 'Sportif'
  if (player.full_name?.trim()) return player.full_name.trim()

  const fullName = [player.firstname || '', player.lastname || '']
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

function chooseBestProfile(profiles: ProfileRow[], userEmail: string) {
  if (!profiles.length) return null

  const normalizedEmail = userEmail.trim().toLowerCase()

  const activeProfiles = profiles.filter((profile) => profile.status !== 'inactive')
  const source = activeProfiles.length ? activeProfiles : profiles

  const exactEmail = source.filter(
    (profile) => (profile.email || '').trim().toLowerCase() === normalizedEmail
  )
  const exactSource = exactEmail.length ? exactEmail : source

  const adminWithClub = exactSource.find(
    (profile) => profile.role === 'admin' && Boolean(profile.club_id)
  )
  if (adminWithClub) return adminWithClub

  const clubProfile = exactSource.find((profile) => profile.role === 'club' && Boolean(profile.club_id))
  if (clubProfile) return clubProfile

  const adminProfile = exactSource.find((profile) => profile.role === 'admin')
  if (adminProfile) return adminProfile

  const withClub = exactSource.find((profile) => Boolean(profile.club_id))
  if (withClub) return withClub

  return exactSource[0]
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

export default function ClubPortalPage() {
  const [state, setState] = useState<PortalState>({
    loading: true,
    error: '',
    userEmail: '',
    profile: null,
    club: null,
    clubs: [],
    teams: [],
    players: [],
    passations: [],
    cmpResults: []
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(userError.message)
        }

        if (!user) {
          throw new Error('Aucun utilisateur connecté. Connecte-toi pour accéder au portail club.')
        }

        const userEmail = user.email || ''

        const { data: profilesByUserId, error: profilesByUserIdError } = await supabase
          .from('profiles')
          .select(
            'id, user_id, role, club_id, player_id, firstname, lastname, full_name, email, status'
          )
          .eq('user_id', user.id)
          .returns<ProfileRow[]>()

        if (profilesByUserIdError) {
          throw new Error(profilesByUserIdError.message)
        }

        let profileCandidates = profilesByUserId ?? []

        if (!profileCandidates.length && userEmail) {
          const { data: profilesByEmail, error: profilesByEmailError } = await supabase
            .from('profiles')
            .select(
              'id, user_id, role, club_id, player_id, firstname, lastname, full_name, email, status'
            )
            .ilike('email', userEmail)
            .returns<ProfileRow[]>()

          if (profilesByEmailError) {
            throw new Error(profilesByEmailError.message)
          }

          profileCandidates = profilesByEmail ?? []
        }

        const profile = chooseBestProfile(profileCandidates, userEmail)

        if (!profile) {
          throw new Error(
            "Profil introuvable. Vérifie que ton utilisateur est bien relié à la table profiles."
          )
        }

        const isAdmin = profile.role === 'admin'
        const clubId = profile.club_id || ''

        if (!isAdmin && !clubId) {
          throw new Error(
            "Ce compte n'est rattaché à aucun club. Renseigne club_id dans profiles pour ouvrir le portail club."
          )
        }

        let clubs: ClubRow[] = []
        let club: ClubRow | null = null
        let teams: TeamRow[] = []
        let players: PlayerRow[] = []
        let passations: PassationRow[] = []
        let cmpResults: CmpResultRow[] = []

        if (isAdmin) {
          const [
            clubsResponse,
            teamsResponse,
            passationsResponse
          ] = await Promise.all([
            supabase
              .from('clubs')
              .select('id, name, club_name, created_at')
              .order('created_at', { ascending: false })
              .returns<ClubRow[]>(),
            supabase
              .from('teams')
              .select('id, name, team_name, season, club_id, created_at')
              .order('created_at', { ascending: false })
              .returns<TeamRow[]>(),
            supabase
              .from('passations')
              .select('id, token, module, status, player_id, team_id, club_id, created_at')
              .order('created_at', { ascending: false })
              .returns<PassationRow[]>()
          ])

          if (clubsResponse.error) throw new Error(clubsResponse.error.message)
          if (teamsResponse.error) throw new Error(teamsResponse.error.message)
          if (passationsResponse.error) throw new Error(passationsResponse.error.message)

          clubs = clubsResponse.data ?? []
          teams = teamsResponse.data ?? []
          passations = passationsResponse.data ?? []

          if (clubId) {
            club = clubs.find((item) => item.id === clubId) || null
          } else {
            club = clubs[0] ?? null
          }

          const teamIds = teams.map((team) => team.id)
          if (teamIds.length > 0) {
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('id, firstname, lastname, email, team_id, created_at')
              .in('team_id', teamIds)
              .order('created_at', { ascending: false })
              .returns<PlayerRow[]>()

            if (playersError) {
              throw new Error(playersError.message)
            }

            players = playersData ?? []
          }

          const passationTokens = passations
            .map((item) => item.token)
            .filter((token): token is string => Boolean(token))

          if (passationTokens.length > 0) {
            const { data: cmpData, error: cmpError } = await supabase
              .from('cmp_results')
              .select(
                'token, firstname, lastname, email, profile_code, profile_label, score_global, created_at'
              )
              .in('token', passationTokens)
              .order('created_at', { ascending: false })
              .returns<CmpResultRow[]>()

            if (cmpError) {
              throw new Error(cmpError.message)
            }

            cmpResults = cmpData ?? []
          }
        } else {
          const [
            clubResponse,
            teamsResponse,
            passationsResponse
          ] = await Promise.all([
            supabase
              .from('clubs')
              .select('id, name, club_name, created_at')
              .eq('id', clubId)
              .maybeSingle<ClubRow>(),
            supabase
              .from('teams')
              .select('id, name, team_name, season, club_id, created_at')
              .eq('club_id', clubId)
              .order('created_at', { ascending: false })
              .returns<TeamRow[]>(),
            supabase
              .from('passations')
              .select('id, token, module, status, player_id, team_id, club_id, created_at')
              .eq('club_id', clubId)
              .order('created_at', { ascending: false })
              .returns<PassationRow[]>()
          ])

          if (clubResponse.error) throw new Error(clubResponse.error.message)
          if (teamsResponse.error) throw new Error(teamsResponse.error.message)
          if (passationsResponse.error) throw new Error(passationsResponse.error.message)

          club = clubResponse.data ?? null
          clubs = club ? [club] : []
          teams = teamsResponse.data ?? []
          passations = passationsResponse.data ?? []

          const teamIds = teams.map((team) => team.id)
          if (teamIds.length > 0) {
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('id, firstname, lastname, email, team_id, created_at')
              .in('team_id', teamIds)
              .order('created_at', { ascending: false })
              .returns<PlayerRow[]>()

            if (playersError) {
              throw new Error(playersError.message)
            }

            players = playersData ?? []
          }

          const passationTokens = passations
            .map((item) => item.token)
            .filter((token): token is string => Boolean(token))

          if (passationTokens.length > 0) {
            const { data: cmpData, error: cmpError } = await supabase
              .from('cmp_results')
              .select(
                'token, firstname, lastname, email, profile_code, profile_label, score_global, created_at'
              )
              .in('token', passationTokens)
              .order('created_at', { ascending: false })
              .returns<CmpResultRow[]>()

            if (cmpError) {
              throw new Error(cmpError.message)
            }

            cmpResults = cmpData ?? []
          }
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            userEmail,
            profile,
            club,
            clubs,
            teams,
            players,
            passations,
            cmpResults
          })
        }
      } catch (error: any) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error?.message || 'Erreur inconnue dans le portail club.'
          }))
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const teamsById = useMemo(() => {
    const map = new Map<string, TeamRow>()
    state.teams.forEach((team) => map.set(team.id, team))
    return map
  }, [state.teams])

  const playersById = useMemo(() => {
    const map = new Map<string, PlayerRow>()
    state.players.forEach((player) => map.set(player.id, player))
    return map
  }, [state.players])

  const cmpByToken = useMemo(() => {
    const map = new Map<string, CmpResultRow>()
    state.cmpResults.forEach((item) => {
      if (item.token && !map.has(item.token)) {
        map.set(item.token, item)
      }
    })
    return map
  }, [state.cmpResults])

  const totalClubs = state.clubs.length
  const totalTeams = state.teams.length
  const totalPlayers = state.players.length
  const totalPassations = state.passations.length
  const totalCmpResults = state.cmpResults.length

  const completedCount = state.passations.filter((item) => item.status === 'completed').length
  const pendingCount = state.passations.filter((item) => item.status === 'pending').length
  const inProgressCount = state.passations.filter((item) => item.status === 'in_progress').length
  const sentCount = state.passations.filter((item) => item.status === 'sent').length

  const averageCmpScore = scoreAverage(state.cmpResults.map((item) => item.score_global))
  const lastResultDate =
    state.cmpResults.length > 0 ? formatDate(state.cmpResults[0]?.created_at) : '—'

  if (state.loading) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>Portail club sécurisé</div>
          <h1 style={heroTitleStyle}>Chargement du portail club…</h1>
          <p style={heroTextStyle}>Lecture des données sécurisées du club en cours.</p>
        </section>
      </main>
    )
  }

  if (state.error) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>Portail club sécurisé</div>
          <h1 style={heroTitleStyle}>Accès club indisponible</h1>
          <p style={heroTextStyle}>{state.error}</p>

          <div style={heroActionsStyle}>
            <Link href="/admin" style={secondaryButtonStyle}>
              Retour admin
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={heroTopStyle}>
          <div>
            <div style={eyebrowStyle}>Portail club sécurisé</div>
            <h1 style={heroTitleStyle}>
              {state.profile?.role === 'admin'
                ? state.club
                  ? `Vue club — ${getClubLabel(state.club)}`
                  : 'Vue administrateur'
                : getClubLabel(state.club)}
            </h1>

            <p style={heroTextStyle}>
              {state.profile?.role === 'admin'
                ? "Compte administrateur détecté. Cette vue agrège les données disponibles pour contrôler le portail club et vérifier les accès."
                : "Ce portail affiche uniquement les données du club rattaché au compte connecté : équipes, joueurs, passations, progression et réponses CMP."}
            </p>

            <div style={pillRowStyle}>
              <span style={pillStyle}>Compte : {state.userEmail || '—'}</span>
              <span style={pillStyle}>Rôle : {state.profile?.role || '—'}</span>
              <span style={pillStyle}>Club ID : {state.profile?.club_id || '—'}</span>
            </div>
          </div>

          <div style={heroActionsStyle}>
            <Link href="/club/import-equipe" style={primaryButtonStyle}>
              Import équipe
            </Link>
            <Link href="/admin/passations" style={secondaryButtonStyle}>
              Cockpit passations
            </Link>
            <Link href="/admin/resultats" style={secondaryButtonStyle}>
              Cockpit résultats
            </Link>
          </div>
        </div>
      </section>

      <section style={gridStatsStyle}>
        <StatCard value={totalClubs} label="clubs visibles" helper="clubs chargés" />
        <StatCard value={totalTeams} label="équipes" helper="équipes chargées" />
        <StatCard value={totalPlayers} label="joueurs" helper="sportifs rattachés" />
        <StatCard value={totalPassations} label="passations" helper="liens du portail" />
      </section>

      <section style={gridStatsStyle}>
        <StatCard value={totalCmpResults} label="réponses CMP" helper="résultats disponibles" />
        <StatCard value={completedCount} label="terminées" helper="tests complétés" />
        <StatCard value={pendingCount} label="à faire" helper="liens non utilisés" />
        <StatCard value={inProgressCount} label="en cours" helper="questionnaires entamés" />
        <StatCard value={sentCount} label="envoyées" helper="passations transmises" />
        <StatCard value={averageCmpScore} label="score moyen CMP" helper="moyenne visible" />
        <StatCard value={lastResultDate} label="dernier résultat" helper="réponse récente" />
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>Équipes visibles</h2>
          <p style={panelTextStyle}>
            Chaque carte donne accès au dashboard équipe déjà construit dans V11.
          </p>
        </div>

        {state.teams.length === 0 ? (
          <div style={emptyStyle}>Aucune équipe disponible pour cette vue.</div>
        ) : (
          <div style={cardGridStyle}>
            {state.teams.map((team) => {
              const teamPlayers = state.players.filter((player) => player.team_id === team.id)
              const teamPassations = state.passations.filter((item) => item.team_id === team.id)
              const teamTokens = teamPassations
                .map((item) => item.token)
                .filter((token): token is string => Boolean(token))
              const teamResults = teamTokens
                .map((token) => cmpByToken.get(token))
                .filter((item): item is CmpResultRow => Boolean(item))

              return (
                <div key={team.id} style={teamCardStyle}>
                  <div style={teamCardTopStyle}>
                    <div>
                      <div style={teamTitleStyle}>{getTeamLabel(team)}</div>
                      <div style={teamSubStyle}>
                        Saison : {team.season || '—'} • Club ID : {team.club_id || '—'}
                      </div>
                    </div>

                    <Link href={`/club/equipe/${team.id}`} style={smallPrimaryButtonStyle}>
                      Ouvrir
                    </Link>
                  </div>

                  <div style={miniStatsGridStyle}>
                    <MiniStat label="Joueurs" value={String(teamPlayers.length)} />
                    <MiniStat label="Passations" value={String(teamPassations.length)} />
                    <MiniStat label="Réponses" value={String(teamResults.length)} />
                    <MiniStat
                      label="Score moyen"
                      value={String(scoreAverage(teamResults.map((item) => item.score_global)))}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Dernières passations visibles</h2>
            <p style={panelTextStyle}>Vision rapide des passations chargées dans cette vue.</p>
          </div>

          {state.passations.length === 0 ? (
            <div style={emptyStyle}>Aucune passation disponible.</div>
          ) : (
            <div style={listStyle}>
              {state.passations.slice(0, 8).map((item, index) => {
                const player = item.player_id ? playersById.get(item.player_id) : undefined
                const team = item.team_id ? teamsById.get(item.team_id) : undefined

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
                      <MetaBox label="Équipe" value={getTeamLabel(team)} />
                      <MetaBox label="Token" value={item.token || '—'} mono />
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
            <h2 style={panelTitleStyle}>Derniers résultats CMP visibles</h2>
            <p style={panelTextStyle}>Les derniers diagnostics effectivement disponibles.</p>
          </div>

          {state.cmpResults.length === 0 ? (
            <div style={emptyStyle}>Aucun résultat CMP disponible.</div>
          ) : (
            <div style={listStyle}>
              {state.cmpResults.slice(0, 8).map((item, index) => (
                <div key={`${item.token || 'result'}-${index}`} style={rowCardStyle}>
                  <div style={rowTopStyle}>
                    <div style={rowMainTitleStyle}>{getPlayerFullName(item)}</div>
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
    </main>
  )
}

function MiniStat({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div style={miniStatStyle}>
      <div style={miniStatLabelStyle}>{label}</div>
      <div style={miniStatValueStyle}>{value}</div>
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

const pillRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 18
}

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 800
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

const smallPrimaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #2f4d85 0%, #4168b0 100%)',
  fontWeight: 800,
  fontSize: 14,
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

const panelStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: 28,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
  overflow: 'hidden',
  marginBottom: 24
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

const emptyStyle: CSSProperties = {
  padding: 24,
  fontSize: 18,
  lineHeight: 1.7,
  color: '#667085'
}

const cardGridStyle: CSSProperties = {
  padding: 24,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16
}

const teamCardStyle: CSSProperties = {
  border: '1px solid #e1e8f3',
  borderRadius: 22,
  background: '#f8fafd',
  padding: 18
}

const teamCardTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 16
}

const teamTitleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: '#182847',
  marginBottom: 8
}

const teamSubStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: '#667085'
}

const miniStatsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12
}

const miniStatStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #e1e8f3'
}

const miniStatLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#7a869d',
  marginBottom: 8
}

const miniStatValueStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  color: '#1d2d4e'
}

const twoColumnsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
  gap: 24,
  marginBottom: 24
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
