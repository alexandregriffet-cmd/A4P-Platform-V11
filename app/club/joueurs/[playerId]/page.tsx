'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type PlayerRow = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
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

type ClubRow = {
  id: string
  name?: string | null
  club_name?: string | null
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
  player: PlayerRow | null
  team: TeamRow | null
  club: ClubRow | null
  passations: PassationRow[]
  results: CmpResultRow[]
}

type RadarDimensions = {
  confiance: number
  regulation: number
  engagement: number
  stabilite: number
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

function getPlayerName(player?: { firstname?: string | null; lastname?: string | null } | null) {
  if (!player) return 'Joueur'
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sportif sans nom'
}

function getTeamName(team?: TeamRow | null) {
  if (!team) return '—'
  return team.team_name || team.name || 'Équipe sans nom'
}

function getClubName(club?: ClubRow | null) {
  if (!club) return '—'
  return club.club_name || club.name || 'Club sans nom'
}

function getStatusLabel(status?: string | null) {
  if (status === 'completed') return 'Terminée'
  if (status === 'in_progress') return 'En cours'
  if (status === 'sent') return 'Envoyée'
  if (status === 'pending') return 'À faire'
  return status || 'Inconnu'
}

function normalizeScore(value: unknown): number | null {
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

function getDimensionFromSource(source: Record<string, any> | null | undefined, keys: string[]) {
  if (!source) return null

  for (const key of keys) {
    const value = normalizeScore(source[key])
    if (value !== null) return value
  }

  return null
}

function extractRadarDimensions(result?: CmpResultRow | null): RadarDimensions | null {
  if (!result) return null

  const direct = {
    confiance: getDimensionFromSource(result, ['confiance', 'confidence']),
    regulation: getDimensionFromSource(result, ['regulation', 'régulation']),
    engagement: getDimensionFromSource(result, ['engagement']),
    stabilite: getDimensionFromSource(result, ['stabilite', 'stabilité', 'stability'])
  }

  if (Object.values(direct).some((value) => value !== null)) {
    return {
      confiance: direct.confiance ?? 0,
      regulation: direct.regulation ?? 0,
      engagement: direct.engagement ?? 0,
      stabilite: direct.stabilite ?? 0
    }
  }

  const nestedSources = [
    result.dimensions,
    result.dimension_scores,
    result.scores,
    result.payload,
    result.payload?.dimensions,
    result.payload?.dimension_scores,
    result.raw_payload,
    result.raw_payload?.dimensions,
    result.raw_payload?.dimension_scores,
    result.result,
    result.result?.dimensions
  ]

  for (const source of nestedSources) {
    if (source && typeof source === 'object') {
      const confiance = getDimensionFromSource(source, ['confiance', 'confidence'])
      const regulation = getDimensionFromSource(source, ['regulation', 'régulation'])
      const engagement = getDimensionFromSource(source, ['engagement'])
      const stabilite = getDimensionFromSource(source, ['stabilite', 'stabilité', 'stability'])

      if ([confiance, regulation, engagement, stabilite].some((value) => value !== null)) {
        return {
          confiance: confiance ?? 0,
          regulation: regulation ?? 0,
          engagement: engagement ?? 0,
          stabilite: stabilite ?? 0
        }
      }
    }
  }

  return null
}

function getDominantProfile(result?: CmpResultRow | null) {
  if (!result) return 'Aucun profil disponible'
  return result.profile_label || result.profile_code || 'Profil non renseigné'
}

function getCoachSummary(result?: CmpResultRow | null, radar?: RadarDimensions | null) {
  const score = typeof result?.score_global === 'number' ? result.score_global : null

  if (radar) {
    const ordered = [
      ['confiance', radar.confiance],
      ['régulation', radar.regulation],
      ['engagement', radar.engagement],
      ['stabilité', radar.stabilite]
    ].sort((a, b) => b[1] - a[1])

    const top = ordered[0]?.[0] || 'mental'
    return `Le point fort actuellement le plus visible est la ${top}. Cette lecture doit servir de base au travail du coach pour stabiliser la performance du joueur dans les moments importants.`
  }

  if (score !== null && score < 45) {
    return "Le joueur semble avoir besoin d'un cadre mental simple, sécurisant et très progressif pour installer des repères stables."
  }

  if (score !== null && score < 65) {
    return "Le joueur présente une base utile mais encore irrégulière. L'enjeu principal est de transformer le potentiel en stabilité."
  }

  if (score !== null) {
    return "Le joueur montre une base mentale plutôt solide. Le travail du coach peut se concentrer sur la précision, la constance et l'optimisation."
  }

  return 'Aucune lecture détaillée disponible tant que les résultats CMP ne sont pas encore remontés.'
}

function getProgressAxes(radar?: RadarDimensions | null, scoreGlobal?: number | null) {
  if (!radar) {
    if (typeof scoreGlobal === 'number' && scoreGlobal < 45) {
      return [
        'Installer des routines mentales simples avant entraînement et compétition.',
        'Travailler la respiration et le recentrage pour limiter la dispersion.',
        'Reconstruire progressivement la confiance sur des situations maîtrisées.'
      ]
    }

    if (typeof scoreGlobal === 'number' && scoreGlobal < 65) {
      return [
        'Stabiliser le fonctionnement mental dans les moments clés.',
        'Identifier les déclencheurs émotionnels qui font chuter la performance.',
        'Renforcer la continuité entre engagement, lucidité et action.'
      ]
    }

    return [
      'Consolider les acquis mentaux déjà présents.',
      'Affiner la qualité de présence sous pression.',
      'Transformer les points forts en habitudes durables.'
    ]
  }

  const axes = [
    {
      key: 'confiance',
      value: radar.confiance,
      text: 'Renforcer la confiance par des repères de réussite et des validations concrètes.'
    },
    {
      key: 'regulation',
      value: radar.regulation,
      text: 'Développer la régulation émotionnelle avec routines respiratoires et recentrage.'
    },
    {
      key: 'engagement',
      value: radar.engagement,
      text: "Clarifier l'intention d'action et soutenir l'engagement jusqu'au bout."
    },
    {
      key: 'stabilite',
      value: radar.stabilite,
      text: 'Construire plus de stabilité mentale dans la durée et sous pression.'
    }
  ]

  return axes.sort((a, b) => a.value - b.value).slice(0, 3).map((item) => item.text)
}

function RadarChart({ radar }: { radar: RadarDimensions | null }) {
  if (!radar) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          border: '1px dashed #cfd7e6',
          color: '#667085',
          background: '#f8fbff',
          lineHeight: 1.7
        }}
      >
        Radar indisponible : les dimensions CMP ne sont pas encore enregistrées dans la base pour ce joueur.
      </div>
    )
  }

  const labels = ['Confiance', 'Régulation', 'Engagement', 'Stabilité']
  const values = [radar.confiance, radar.regulation, radar.engagement, radar.stabilite]
  const cx = 160
  const cy = 160
  const maxRadius = 108
  const levels = [25, 50, 75, 100]
  const angles = [-90, 0, 90, 180]

  const point = (value: number, angleDeg: number) => {
    const angle = (angleDeg * Math.PI) / 180
    const radius = (value / 100) * maxRadius
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    }
  }

  const polygonPoints = values
    .map((value, index) => {
      const p = point(value, angles[index])
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 420, height: 'auto' }}>
        {levels.map((level) => {
          const pts = angles
            .map((angle) => {
              const p = point(level, angle)
              return `${p.x},${p.y}`
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

        {angles.map((angle, index) => {
          const end = point(100, angle)
          const labelPoint = point(118, angle)
          return (
            <g key={labels[index]}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#d8e1ef" strokeWidth="1" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 12, fontWeight: 800, fill: '#61708d' }}
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
          const p = point(value, angles[index])
          return <circle key={index} cx={p.x} cy={p.y} r="4.5" fill="#2f4d85" />
        })}

        <circle cx={cx} cy={cy} r="4" fill="#2f4d85" />
      </svg>

      <div style={{ color: '#5f6f8e', fontWeight: 800 }}>Radar mental CMP</div>
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
    <div
      style={{
        background: '#ffffff',
        borderRadius: 26,
        padding: 24,
        boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
      }}
    >
      <div
        style={{
          fontSize: 44,
          lineHeight: 1.02,
          fontWeight: 900,
          color: '#223461',
          marginBottom: 12,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 20, lineHeight: 1.35, fontWeight: 800, color: '#667085' }}>
        {label}
      </div>
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: '#8a96ad' }}>
          {helper}
        </div>
      ) : null}
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
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: '1px solid #e2e8f4',
        background: '#ffffff'
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#7a869d',
          marginBottom: 8
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: mono ? 13 : 16,
          lineHeight: 1.5,
          fontWeight: 800,
          color: '#1e2b45',
          wordBreak: 'break-word',
          ...(mono ? { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } : {})
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function PlayerPage() {
  const params = useParams()
  const playerId = params?.playerId as string

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    player: null,
    team: null,
    club: null,
    passations: [],
    results: []
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        if (!playerId) {
          throw new Error('Identifiant joueur manquant.')
        }

        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .maybeSingle<PlayerRow>()

        if (playerError) {
          throw new Error(`Erreur players : ${playerError.message}`)
        }

        if (!playerData) {
          throw new Error(`Joueur introuvable pour l'id ${playerId}`)
        }

        let teamData: TeamRow | null = null
        let clubData: ClubRow | null = null

        if (playerData.team_id) {
          const { data: teamResponse, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', playerData.team_id)
            .maybeSingle<TeamRow>()

          if (teamError) {
            throw new Error(`Erreur teams : ${teamError.message}`)
          }

          teamData = teamResponse ?? null

          if (teamData?.club_id) {
            const { data: clubResponse, error: clubError } = await supabase
              .from('clubs')
              .select('*')
              .eq('id', teamData.club_id)
              .maybeSingle<ClubRow>()

            if (clubError) {
              throw new Error(`Erreur clubs : ${clubError.message}`)
            }

            clubData = clubResponse ?? null
          }
        }

        const { data: passationsData, error: passationsError } = await supabase
          .from('passations')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .returns<PassationRow[]>()

        if (passationsError) {
          throw new Error(`Erreur passations : ${passationsError.message}`)
        }

        const passations = passationsData ?? []
        const tokens = passations
          .map((item) => item.token)
          .filter((token): token is string => Boolean(token))

        let results: CmpResultRow[] = []

        if (tokens.length > 0) {
          const { data: cmpData, error: cmpError } = await supabase
            .from('cmp_results')
            .select('*')
            .in('token', tokens)
            .order('created_at', { ascending: false })

          if (cmpError) {
            throw new Error(`Erreur cmp_results : ${cmpError.message}`)
          }

          results = (cmpData as CmpResultRow[]) ?? []
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            player: playerData,
            team: teamData,
            club: clubData,
            passations,
            results
          })
        }
      } catch (error: any) {
        if (!cancelled) {
          setState({
            loading: false,
            error: error?.message || 'Erreur inconnue.',
            player: null,
            team: null,
            club: null,
            passations: [],
            results: []
          })
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [playerId])

  const latestResult = state.results[0] ?? null
  const latestPassation = state.passations[0] ?? null
  const radar = useMemo(() => extractRadarDimensions(latestResult), [latestResult])
  const dominantProfile = getDominantProfile(latestResult)
  const coachSummary = getCoachSummary(latestResult, radar)
  const progressAxes = getProgressAxes(
    radar,
    typeof latestResult?.score_global === 'number' ? latestResult.score_global : null
  )

  const completedCount = state.passations.filter((item) => item.status === 'completed').length
  const pendingCount = state.passations.filter((item) => item.status === 'pending').length
  const inProgressCount = state.passations.filter((item) => item.status === 'in_progress').length

  if (state.loading) {
    return <div style={{ padding: 20 }}>Chargement...</div>
  }

  if (state.error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Accès indisponible</h1>
        <p>{state.error}</p>
        <Link href="/club">Retour club</Link>
      </div>
    )
  }

  if (!state.player) {
    return <div style={{ padding: 20 }}>Joueur introuvable</div>
  }

  return (
    <main
      style={{
        maxWidth: 1480,
        margin: '0 auto',
        padding: 24,
        background: '#eef2f7'
      }}
    >
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 30,
          padding: 30,
          boxShadow: '0 18px 48px rgba(18, 35, 66, 0.08)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#7180a0',
                marginBottom: 12
              }}
            >
              Fiche joueur coach premium
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 56,
                lineHeight: 1.02,
                color: '#182847',
                maxWidth: 860
              }}
            >
              {getPlayerName(state.player)}
            </h1>

            <p
              style={{
                margin: '18px 0 0 0',
                fontSize: 22,
                lineHeight: 1.75,
                color: '#5f6f8e',
                maxWidth: 980
              }}
            >
              Lecture mentale individuelle du joueur à partir des résultats CMP disponibles dans la
              base A4P.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                marginTop: 18
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 999,
                  background: '#eef2ff',
                  color: '#34518b',
                  fontWeight: 800
                }}
              >
                Club : {getClubName(state.club)}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 999,
                  background: '#eef2ff',
                  color: '#34518b',
                  fontWeight: 800
                }}
              >
                Équipe : {getTeamName(state.team)}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 999,
                  background: '#eef2ff',
                  color: '#34518b',
                  fontWeight: 800
                }}
              >
                Email : {state.player.email || '—'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <Link
              href="/club"
              style={{
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
              }}
            >
              Retour club
            </Link>
          </div>
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
        <StatCard
          value={
            typeof latestResult?.score_global === 'number' ? `${latestResult.score_global}/100` : '—'
          }
          label="score global CMP"
          helper="dernier résultat enregistré"
        />
        <StatCard value={dominantProfile} label="profil dominant" helper="lecture mentale actuelle" />
        <StatCard
          value={state.results.length}
          label="résultats CMP"
          helper="historique disponible"
        />
        <StatCard
          value={formatDate(latestResult?.created_at || latestPassation?.created_at)}
          label="dernière activité"
          helper="résultat ou passation récente"
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={state.passations.length} label="passations" helper="liens générés" />
        <StatCard value={completedCount} label="terminées" helper="tests finalisés" />
        <StatCard value={pendingCount} label="à faire" helper="liens non utilisés" />
        <StatCard value={inProgressCount} label="en cours" helper="questionnaires commencés" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 28,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 24, borderBottom: '1px solid #e5ebf5' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.05,
                color: '#182847'
              }}
            >
              Profil mental dominant
            </h2>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 18,
                lineHeight: 1.7,
                color: '#667085'
              }}
            >
              Lecture synthétique destinée au coach.
            </p>
          </div>

          <div style={{ padding: 24 }}>
            <div
              style={{
                padding: 20,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
                border: '1px solid #dbe5f4',
                marginBottom: 18
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: '#1b2d52',
                  marginBottom: 12
                }}
              >
                {dominantProfile}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.8,
                  color: '#5f6f8e'
                }}
              >
                {coachSummary}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12
              }}
            >
              <MetaBox label="Code profil" value={latestResult?.profile_code || '—'} />
              <MetaBox label="Date résultat" value={formatDate(latestResult?.created_at)} />
              <MetaBox label="Token" value={latestResult?.token || latestPassation?.token || '—'} mono />
              <MetaBox
                label="Statut passation"
                value={getStatusLabel(latestPassation?.status)}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 28,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 24, borderBottom: '1px solid #e5ebf5' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.05,
                color: '#182847'
              }}
            >
              Radar mental CMP
            </h2>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 18,
                lineHeight: 1.7,
                color: '#667085'
              }}
            >
              Visualisation des 4 leviers mentaux : confiance, régulation, engagement et stabilité.
            </p>
          </div>

          <div style={{ padding: 24 }}>
            <RadarChart radar={radar} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginTop: 18
              }}
            >
              <MetaBox label="Confiance" value={radar ? `${radar.confiance}/100` : '—'} />
              <MetaBox label="Régulation" value={radar ? `${radar.regulation}/100` : '—'} />
              <MetaBox label="Engagement" value={radar ? `${radar.engagement}/100` : '—'} />
              <MetaBox label="Stabilité" value={radar ? `${radar.stabilite}/100` : '—'} />
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 28,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 24, borderBottom: '1px solid #e5ebf5' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.05,
                color: '#182847'
              }}
            >
              Axes de progression
            </h2>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 18,
                lineHeight: 1.7,
                color: '#667085'
              }}
            >
              Priorités d’accompagnement pour le coach.
            </p>
          </div>

          <div style={{ padding: 24, display: 'grid', gap: 14 }}>
            {progressAxes.map((item, index) => (
              <div
                key={`${item}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr',
                  gap: 16,
                  alignItems: 'start',
                  padding: 18,
                  borderRadius: 20,
                  background: '#f8fafd',
                  border: '1px solid #e1e8f3'
                }}
              >
                <div
                  style={{
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
                  }}
                >
                  {index + 1}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    lineHeight: 1.75,
                    color: '#44516d',
                    fontWeight: 700
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 28,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 24, borderBottom: '1px solid #e5ebf5' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.05,
                color: '#182847'
              }}
            >
              Historique passations
            </h2>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 18,
                lineHeight: 1.7,
                color: '#667085'
              }}
            >
              Vue chronologique des passations pour ce joueur.
            </p>
          </div>

          {state.passations.length === 0 ? (
            <div style={{ padding: 24, fontSize: 18, lineHeight: 1.7, color: '#667085' }}>
              Aucune passation rattachée à ce joueur.
            </div>
          ) : (
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              {state.passations.map((item, index) => {
                const linkedResult = state.results.find((result) => result.token === item.token)

                return (
                  <div
                    key={`${item.id || item.token || 'passation'}-${index}`}
                    style={{
                      border: '1px solid #e1e8f3',
                      borderRadius: 22,
                      background: '#f8fafd',
                      padding: 18
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginBottom: 14
                      }}
                    >
                      <div
                        style={{
                          fontSize: 21,
                          fontWeight: 900,
                          color: '#182847'
                        }}
                      >
                        {item.module || 'CMP'}
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 999,
                          fontWeight: 900,
                          fontSize: 14,
                          background:
                            item.status === 'completed'
                              ? '#ecfdf3'
                              : item.status === 'in_progress'
                              ? '#eff8ff'
                              : item.status === 'sent'
                              ? '#eef4ff'
                              : '#f8fafd',
                          color:
                            item.status === 'completed'
                              ? '#067647'
                              : item.status === 'in_progress'
                              ? '#175cd3'
                              : item.status === 'sent'
                              ? '#34518b'
                              : '#667085',
                          border:
                            item.status === 'completed'
                              ? '1px solid #abefc6'
                              : item.status === 'in_progress'
                              ? '1px solid #b2ddff'
                              : item.status === 'sent'
                              ? '1px solid #c7d7fe'
                              : '1px solid #d5ddea'
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12
                      }}
                    >
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
    </main>
  )
}
