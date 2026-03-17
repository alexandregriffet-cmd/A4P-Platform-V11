'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
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
  [key: string]: any
}

type PageState = {
  loading: boolean
  error: string
  userEmail: string
  profile: ProfileRow | null
  club: ClubRow | null
  team: TeamRow | null
  player: PlayerRow | null
  passations: PassationRow[]
  latestPassation: PassationRow | null
  cmpResults: CmpResultRow[]
  latestResult: CmpResultRow | null
}

type DimensionMap = {
  confiance: number
  regulation: number
  engagement: number
  stabilite: number
}

const DEFAULT_DIMENSIONS: DimensionMap = {
  confiance: 0,
  regulation: 0,
  engagement: 0,
  stabilite: 0
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
}) {
  if (!player) return 'Sportif'
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

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'))
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)))
    }
  }

  return null
}

function scoreAverage(values: Array<number | null | undefined>) {
  const numeric = values.filter((value): value is number => typeof value === 'number')
  if (!numeric.length) return '—'
  return Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length)
}

function getDimensionValueFromObject(object: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = normalizeNumber(object[key])
    if (value !== null) return value
  }

  return null
}

function extractCmpDimensions(result?: CmpResultRow | null): DimensionMap | null {
  if (!result) return null

  const direct = {
    confiance: getDimensionValueFromObject(result, ['confiance', 'confidence']),
    regulation: getDimensionValueFromObject(result, ['regulation', 'régulation']),
    engagement: getDimensionValueFromObject(result, ['engagement']),
    stabilite: getDimensionValueFromObject(result, ['stabilite', 'stabilité', 'stability'])
  }

  if (Object.values(direct).some((value) => value !== null)) {
    return {
      confiance: direct.confiance ?? 0,
      regulation: direct.regulation ?? 0,
      engagement: direct.engagement ?? 0,
      stabilite: direct.stabilite ?? 0
    }
  }

  const nestedCandidates = [
    result.dimensions,
    result.dimension_scores,
    result.scores,
    result.raw_payload?.dimensions,
    result.raw_payload?.dimension_scores,
    result.payload?.dimensions,
    result.payload?.dimension_scores,
    result.result?.dimensions
  ]

  for (const candidate of nestedCandidates) {
    if (candidate && typeof candidate === "object") {
      const c = getDimensionValueFromObject(candidate, ['confiance', 'confidence'])
      const r = getDimensionValueFromObject(candidate, ['regulation', 'régulation'])
      const e = getDimensionValueFromObject(candidate, ['engagement'])
      const s = getDimensionValueFromObject(candidate, ['stabilite', 'stabilité', 'stability'])

      if ([c, r, e, s].some((value) => value !== null)) {
        return {
          confiance: c ?? 0,
          regulation: r ?? 0,
          engagement: e ?? 0,
          stabilite: s ?? 0
        }
      }
    }
  }

  return null
}

function buildProgressAxes(dimensions: DimensionMap | null, scoreGlobal?: number | null) {
  if (!dimensions) {
    const basedOnScore = typeof scoreGlobal === 'number' ? scoreGlobal : null

    if (basedOnScore !== null && basedOnScore < 45) {
      return [
        'Recréer des repères simples avant l’effort et avant la compétition.',
        'Travailler des routines courtes de respiration et de recentrage.',
        'Renforcer progressivement la confiance à partir de situations maîtrisées.'
      ]
    }

    if (basedOnScore !== null && basedOnScore < 65) {
      return [
        'Stabiliser les routines mentales avant et pendant la performance.',
        'Identifier les situations qui dégradent l’engagement ou la lucidité.',
        'Sécuriser les moments clés par des consignes simples et répétables.'
      ]
    }

    return [
      'Consolider les automatismes mentaux qui soutiennent déjà la performance.',
      'Affiner la gestion des moments clés sous pression.',
      'Transformer les points forts actuels en habitudes durables.'
    ]
  }

  const entries = [
    {
      key: 'confiance',
      value: dimensions.confiance,
      text:
        'Renforcer la confiance par des repères de réussite, des preuves concrètes de progression et une validation interne plus stable.'
    },
    {
      key: 'regulation',
      value: dimensions.regulation,
      text:
        'Structurer la régulation émotionnelle avec respiration, routines de recentrage et protocoles de retour au calme.'
    },
    {
      key: 'engagement',
      value: dimensions.engagement,
      text:
        'Clarifier l’objectif d’action, renforcer l’intention de jeu et maintenir l’investissement mental jusqu’au bout.'
    },
    {
      key: 'stabilite',
      value: dimensions.stabilite,
      text:
        'Stabiliser le niveau mental dans le temps grâce à des routines avant-match, des ancrages et une meilleure constance.'
    }
  ]

  const sorted = [...entries].sort((a, b) => a.value - b.value)
  return sorted.slice(0, 3).map((item) => item.text)
}

function getDominantProfileLabel(result?: CmpResultRow | null) {
  if (!result) return 'Aucun profil disponible'
  return result.profile_label || result.profile_code || 'Profil non renseigné'
}

function getCoachReading(result?: CmpResultRow | null, dimensions?: DimensionMap | null) {
  const score = typeof result?.score_global === 'number' ? result.score_global : null
  const label = result?.profile_label || result?.profile_code || ''

  if (dimensions) {
    const values = Object.entries(dimensions)
    const strongest = values.sort((a, b) => b[1] - a[1])[0]?.[0]

    if (strongest === 'regulation') {
      return 'Le joueur semble mieux tenir quand il retrouve un cadre interne de régulation. La stabilité émotionnelle reste un levier important pour consolider la performance.'
    }

    if (strongest === 'confiance') {
      return 'Le joueur paraît s’appuyer d’abord sur la confiance. L’enjeu sera de rendre cette confiance plus stable et moins dépendante du contexte.'
    }

    if (strongest === 'engagement') {
      return 'Le joueur semble avancer quand il sait où mettre son énergie. La priorité est de transformer cet engagement en constance mentale.'
    }

    if (strongest === 'stabilite') {
      return 'Le joueur montre surtout un besoin de constance. Quand ses repères tiennent, l’expression du potentiel devient plus fiable.'
    }
  }

  if (score !== null && score < 45) {
    return 'Lecture coach : le joueur a besoin d’un cadre mental simple, de repères stables et d’un accompagnement progressif sur la confiance et la régulation.'
  }

  if (score !== null && score < 65) {
    return 'Lecture coach : le potentiel est présent mais encore irrégulier. L’objectif est de stabiliser la réponse mentale dans les moments clés.'
  }

  if (score !== null) {
    return 'Lecture coach : la base mentale paraît globalement solide. Le travail porte surtout sur l’optimisation, la constance et la précision sous pression.'
  }

  if (label) {
    return `Lecture coach : ${label}. Les données disponibles confirment une orientation mentale identifiable, mais il faut compléter les dimensions pour une lecture plus fine.`
  }

  return 'Lecture coach : aucune donnée suffisamment complète pour produire une interprétation détaillée.'
}

function RadarChart({
  dimensions
}: {
  dimensions: DimensionMap | null
}) {
  if (!dimensions) {
    return (
      <div style={radarEmptyStyle}>
        Radar indisponible pour ce joueur : les dimensions CMP ne sont pas encore enregistrées dans la base.
      </div>
    )
  }

  const labels = ['Confiance', 'Régulation', 'Engagement', 'Stabilité']
  const values = [
    dimensions.confiance,
    dimensions.regulation,
    dimensions.engagement,
    dimensions.stabilite
  ]

  const cx = 160
  const cy = 160
  const maxRadius = 108
  const levels = [25, 50, 75, 100]
  const axisAngles = [-90, 0, 90, 180]

  const toPoint = (value: number, angleDeg: number) => {
    const angle = (angleDeg * Math.PI) / 180
    const radius = (value / 100) * maxRadius
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    }
  }

  const polygonPoints = values
    .map((value, index) => {
      const point = toPoint(value, axisAngles[index])
      return `${point.x},${point.y}`
    })
    .join(' ')

  return (
    <div style={radarWrapperStyle}>
      <svg viewBox="0 0 320 320" style={radarSvgStyle} aria-label="Radar mental CMP">
        {levels.map((level) => {
          const pts = axisAngles
            .map((angle) => {
              const point = toPoint(level, angle)
              return `${point.x},${point.y}`
            })
            .join(' ')

          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="#d8e1ef"
              strokeWidth="1"
            />
          )
        })}

        {axisAngles.map((angle, index) => {
          const end = toPoint(100, angle)
          const labelPoint = toPoint(118, angle)

          return (
            <g key={labels[index]}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#d8e1ef" strokeWidth="1" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  fill: '#61708d'
                }}
              >
                {labels[index]}
              </text>
            </g>
          )
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(65,104,176,0.24)"
          stroke="#2f4d85"
          strokeWidth="3"
        />

        {values.map((value, index) => {
          const point = toPoint(value, axisAngles[index])
          return <circle key={labels[index]} cx={point.x} cy={point.y} r="4.5" fill="#2f4d85" />
        })}

        <circle cx={cx} cy={cy} r="4" fill="#2f4d85" />
      </svg>

      <div style={radarLegendStyle}>
        <div style={legendItemStyle}>
          <span style={legendDotStyle} />
          Profil mental CMP
        </div>
      </div>
    </div>
  )
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

export default function ClubPlayerPremiumPage() {
  const params = useParams()
  const playerId = typeof params?.playerId === 'string' ? params.playerId : ''

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    userEmail: '',
    profile: null,
    club: null,
    team: null,
    player: null,
    passations: [],
    latestPassation: null,
    cmpResults: [],
    latestResult: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        if (!playerId) {
          throw new Error('Identifiant joueur manquant.')
        }

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(userError.message)
        }

        if (!user) {
          throw new Error('Aucun utilisateur connecté. Connecte-toi pour accéder à la fiche joueur.')
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(
            'id, user_id, role, club_id, player_id, firstname, lastname, full_name, email, status'
          )
          .eq('user_id', user.id)
          .single<ProfileRow>()

        if (profileError || !profile) {
          throw new Error("Profil utilisateur introuvable dans la table profiles.")
        }

        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('id, firstname, lastname, email, team_id, created_at')
          .eq('id', playerId)
          .single<PlayerRow>()

        if (playerError || !player) {
          throw new Error('Joueur introuvable.')
        }

        const teamId = player.team_id || ''
        let team: TeamRow | null = null
        let club: ClubRow | null = null

        if (teamId) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('id, name, team_name, season, club_id, created_at')
            .eq('id', teamId)
            .single<TeamRow>()

          if (teamError || !teamData) {
            throw new Error("Équipe introuvable pour ce joueur.")
          }

          team = teamData

          if (team.club_id) {
            const { data: clubData, error: clubError } = await supabase
              .from('clubs')
              .select('id, name, club_name, created_at')
              .eq('id', team.club_id)
              .single<ClubRow>()

            if (clubError) {
              throw new Error(clubError.message)
            }

            club = clubData ?? null
          }
        }

        if (profile.role !== 'admin') {
          if (!profile.club_id) {
            throw new Error("Ce compte n'est rattaché à aucun club.")
          }

          if (!team?.club_id || profile.club_id !== team.club_id) {
            throw new Error("Accès refusé : ce joueur n'appartient pas à ton club.")
          }
        }

        const { data: passations, error: passationsError } = await supabase
          .from('passations')
          .select('id, token, module, status, player_id, team_id, club_id, created_at')
          .eq('player_id', player.id)
          .order('created_at', { ascending: false })
          .returns<PassationRow[]>()

        if (passationsError) {
          throw new Error(passationsError.message)
        }

        const passationData = passations ?? []
        const latestPassation = passationData[0] ?? null
        const tokens = passationData
          .map((item) => item.token)
          .filter((token): token is string => Boolean(token))

        let cmpResults: CmpResultRow[] = []

        if (tokens.length > 0) {
          const { data: cmpData, error: cmpError } = await supabase
            .from('cmp_results')
            .select('*')
            .in('token', tokens)
            .order('created_at', { ascending: false })

          if (cmpError) {
            throw new Error(cmpError.message)
          }

          cmpResults = (cmpData as CmpResultRow[]) ?? []
        }

        const latestResult = cmpResults[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            userEmail: user.email || profile.email || '',
            profile,
            club,
            team,
            player,
            passations: passationData,
            latestPassation,
            cmpResults,
            latestResult
          })
        }
      } catch (error: any) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error?.message || 'Erreur inconnue sur la fiche joueur.'
          }))
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [playerId])

  const playerLabel = getPlayerFullName(state.player)
  const clubLabel = getClubLabel(state.club)
  const teamLabel = getTeamLabel(state.team)

  const latestDimensions = useMemo(
    () => extractCmpDimensions(state.latestResult),
    [state.latestResult]
  )

  const scoreGlobal =
    typeof state.latestResult?.score_global === 'number' ? state.latestResult.score_global : null

  const dominantProfile = getDominantProfileLabel(state.latestResult)
  const coachReading = getCoachReading(state.latestResult, latestDimensions)
  const progressAxes = buildProgressAxes(latestDimensions, scoreGlobal)

  const averagePlayerScore = scoreAverage(state.cmpResults.map((item) => item.score_global))
  const completedCount = state.passations.filter((item) => item.status === 'completed').length
  const pendingCount = state.passations.filter((item) => item.status === 'pending').length
  const inProgressCount = state.passations.filter((item) => item.status === 'in_progress').length
  const sentCount = state.passations.filter((item) => item.status === 'sent').length

  if (state.loading) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>Fiche joueur coach</div>
          <h1 style={heroTitleStyle}>Chargement du profil mental…</h1>
          <p style={heroTextStyle}>Lecture sécurisée des données du joueur en cours.</p>
        </section>
      </main>
    )
  }

  if (state.error) {
    return (
      <main style={pageStyle}>
        <section style={heroStyle}>
          <div style={eyebrowStyle}>Fiche joueur coach</div>
          <h1 style={heroTitleStyle}>Accès indisponible</h1>
          <p style={heroTextStyle}>{state.error}</p>

          <div style={heroActionsStyle}>
            <Link href="/club" style={secondaryButtonStyle}>
              Retour club
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
            <div style={eyebrowStyle}>Fiche joueur coach premium</div>
            <h1 style={heroTitleStyle}>{playerLabel}</h1>
            <p style={heroTextStyle}>
              Lecture mentale individuelle du joueur à partir des résultats CMP disponibles dans la
              base A4P.
            </p>

            <div style={pillRowStyle}>
              <span style={pillStyle}>Club : {clubLabel}</span>
              <span style={pillStyle}>Équipe : {teamLabel}</span>
              <span style={pillStyle}>Email : {state.player?.email || '—'}</span>
            </div>
          </div>

          <div style={heroActionsStyle}>
            {state.team?.id ? (
              <Link href={`/club/equipes/${state.team.id}`} style={primaryButtonStyle}>
                Retour équipe
              </Link>
            ) : (
              <Link href="/club/equipes" style={primaryButtonStyle}>
                Voir les équipes
              </Link>
            )}

            <Link href="/club" style={secondaryButtonStyle}>
              Dashboard club
            </Link>
          </div>
        </div>
      </section>

      <section style={gridStatsStyle}>
        <StatCard
          value={scoreGlobal !== null ? `${scoreGlobal}/100` : '—'}
          label="score global CMP"
          helper="dernier résultat enregistré"
        />
        <StatCard value={dominantProfile} label="profil dominant" helper="lecture mentale actuelle" />
        <StatCard
          value={averagePlayerScore}
          label="score moyen joueur"
          helper="moyenne des résultats CMP du joueur"
        />
        <StatCard
          value={state.cmpResults.length}
          label="résultats CMP"
          helper="historique disponible"
        />
      </section>

      <section style={gridStatsStyle}>
        <StatCard value={state.passations.length} label="passations" helper="liens générés" />
        <StatCard value={completedCount} label="terminées" helper="tests finalisés" />
        <StatCard value={pendingCount} label="à faire" helper="liens non utilisés" />
        <StatCard value={inProgressCount} label="en cours" helper="questionnaires commencés" />
        <StatCard value={sentCount} label="envoyées" helper="passations transmises" />
        <StatCard
          value={formatDate(state.latestResult?.created_at || state.latestPassation?.created_at)}
          label="dernière activité"
          helper="passation ou résultat le plus récent"
        />
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Profil mental dominant</h2>
            <p style={panelTextStyle}>
              Lecture synthétique destinée au coach pour comprendre rapidement le fonctionnement
              mental actuel du joueur.
            </p>
          </div>

          <div style={panelBodyStyle}>
            <div style={dominantProfileCardStyle}>
              <div style={dominantProfileLabelStyle}>{dominantProfile}</div>
              <p style={dominantProfileTextStyle}>{coachReading}</p>
            </div>

            <div style={metaGridStyle}>
              <MetaBox label="Code profil" value={state.latestResult?.profile_code || '—'} />
              <MetaBox
                label="Date résultat"
                value={formatDate(state.latestResult?.created_at || null)}
              />
              <MetaBox
                label="Token résultat"
                value={state.latestResult?.token || state.latestPassation?.token || '—'}
                mono
              />
              <MetaBox
                label="Statut passation"
                value={getStatusLabel(state.latestPassation?.status || null)}
              />
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Radar mental CMP</h2>
            <p style={panelTextStyle}>
              Visualisation des 4 leviers mentaux : confiance, régulation, engagement et stabilité.
            </p>
          </div>

          <div style={panelBodyStyle}>
            <RadarChart dimensions={latestDimensions} />

            <div style={dimensionGridStyle}>
              <MetaBox
                label="Confiance"
                value={
                  latestDimensions ? `${latestDimensions.confiance}/100` : 'Donnée indisponible'
                }
              />
              <MetaBox
                label="Régulation"
                value={
                  latestDimensions ? `${latestDimensions.regulation}/100` : 'Donnée indisponible'
                }
              />
              <MetaBox
                label="Engagement"
                value={
                  latestDimensions ? `${latestDimensions.engagement}/100` : 'Donnée indisponible'
                }
              />
              <MetaBox
                label="Stabilité"
                value={
                  latestDimensions ? `${latestDimensions.stabilite}/100` : 'Donnée indisponible'
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section style={twoColumnsStyle}>
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Axes de progression</h2>
            <p style={panelTextStyle}>
              Priorités d’accompagnement proposées pour le travail du coach.
            </p>
          </div>

          <div style={panelBodyStyle}>
            <div style={progressListStyle}>
              {progressAxes.map((item, index) => (
                <div key={`${item}-${index}`} style={progressItemStyle}>
                  <div style={progressNumberStyle}>{index + 1}</div>
                  <div style={progressTextStyle}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h2 style={panelTitleStyle}>Historique passations</h2>
            <p style={panelTextStyle}>
              Vue chronologique des passations et de leur état pour ce joueur.
            </p>
          </div>

          {state.passations.length === 0 ? (
            <div style={emptyStyle}>Aucune passation rattachée à ce joueur.</div>
          ) : (
            <div style={listStyle}>
              {state.passations.map((item, index) => {
                const linkedResult = state.cmpResults.find((result) => result.token === item.token)

                return (
                  <div key={`${item.id || item.token || 'passation'}-${index}`} style={rowCardStyle}>
                    <div style={rowTopStyle}>
                      <div style={rowMainTitleStyle}>{item.module || 'CMP'}</div>
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
                      <MetaBox label="Token" value={item.token || '—'} mono />
                      <MetaBox label="Créée le" value={formatDate(item.created_at)} />
                      <MetaBox
                        label="Score"
                        value={
                          typeof linkedResult?.score_global === 'number'
                            ? `${linkedResult.score_global}/100`
                            : '—'
                        }
                      />
                      <MetaBox
                        label="Profil"
                        value={linkedResult?.profile_label || linkedResult?.profile_code || '—'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>Historique des résultats CMP</h2>
          <p style={panelTextStyle}>
            Résultats enregistrés pour ce joueur, du plus récent au plus ancien.
          </p>
        </div>

        {state.cmpResults.length === 0 ? (
          <div style={emptyStyle}>Aucun résultat CMP disponible pour ce joueur.</div>
        ) : (
          <div style={listStyle}>
            {state.cmpResults.map((item, index) => {
              const dims = extractCmpDimensions(item)

              return (
                <div key={`${item.token || 'result'}-${index}`} style={rowCardStyle}>
                  <div style={rowTopStyle}>
                    <div style={rowMainTitleStyle}>
                      {item.profile_label || item.profile_code || 'Résultat CMP'}
                    </div>

                    <span style={scorePillStyle}>
                      {typeof item.score_global === 'number' ? `${item.score_global}/100` : '—'}
                    </span>
                  </div>

                  <div style={metaGridStyle}>
                    <MetaBox label="Code" value={item.profile_code || '—'} />
                    <MetaBox label="Date résultat" value={formatDate(item.created_at)} />
                    <MetaBox label="Token" value={item.token || '—'} mono />
                    <MetaBox
                      label="Confiance"
                      value={dims ? `${dims.confiance}/100` : '—'}
                    />
                    <MetaBox
                      label="Régulation"
                      value={dims ? `${dims.regulation}/100` : '—'}
                    />
                    <MetaBox
                      label="Engagement"
                      value={dims ? `${dims.engagement}/100` : '—'}
                    />
                    <MetaBox
                      label="Stabilité"
                      value={dims ? `${dims.stabilite}/100` : '—'}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
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
  fontSize: 44,
  lineHeight: 1.02,
  fontWeight: 900,
  color: '#223461',
  marginBottom: 12,
  wordBreak: 'break-word'
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
  overflow: 'hidden',
  marginBottom: 24
}

const panelHeaderStyle: CSSProperties = {
  padding: 24,
  borderBottom: '1px solid #e5ebf5'
}

const panelBodyStyle: CSSProperties = {
  padding: 24
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

const dominantProfileCardStyle: CSSProperties = {
  padding: 20,
  borderRadius: 22,
  background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
  border: '1px solid #dbe5f4',
  marginBottom: 18
}

const dominantProfileLabelStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1.2,
  color: '#1b2d52',
  marginBottom: 12
}

const dominantProfileTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.8,
  color: '#5f6f8e'
}

const radarWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16
}

const radarSvgStyle: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  height: 'auto',
  display: 'block'
}

const radarLegendStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center'
}

const legendItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: '#5f6f8e',
  fontWeight: 800
}

const legendDotStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 999,
  background: '#2f4d85',
  display: 'inline-block'
}

const radarEmptyStyle: CSSProperties = {
  padding: 24,
  borderRadius: 18,
  border: '1px dashed #cfd8e8',
  background: '#f8fbff',
  color: '#667085',
  fontSize: 16,
  lineHeight: 1.7,
  textAlign: 'center'
}

const dimensionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginTop: 18
}

const progressListStyle: CSSProperties = {
  display: 'grid',
  gap: 14
}

const progressItemStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '52px 1fr',
  gap: 16,
  alignItems: 'start',
  padding: 18,
  borderRadius: 20,
  background: '#f8fafd',
  border: '1px solid #e1e8f3'
}

const progressNumberStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 900,
  fontSize: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const progressTextStyle: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.75,
  color: '#44516d',
  fontWeight: 700
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
  color: '#1e2b45',
  wordBreak: 'break-word'
}
