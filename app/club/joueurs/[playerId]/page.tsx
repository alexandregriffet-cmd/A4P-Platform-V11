'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Player = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
  created_at?: string | null
}

type Team = {
  id: string
  name?: string | null
  team_name?: string | null
  season?: string | null
  club_id?: string | null
}

type Club = {
  id: string
  name?: string | null
  club_name?: string | null
}

type Result = {
  id?: string | null
  player_id?: string | null
  token?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | string | null
  created_at?: string | null
  confiance?: number | string | null
  regulation?: number | string | null
  engagement?: number | string | null
  stabilite?: number | string | null
  confidence?: number | string | null
  stability?: number | string | null
  dimensions?: Record<string, unknown> | null
  scores?: Record<string, unknown> | null
  payload?: Record<string, unknown> | null
  raw_payload?: Record<string, unknown> | null
  result?: Record<string, unknown> | null
  [key: string]: unknown
}

type Radar = {
  confiance: number
  regulation: number
  engagement: number
  stabilite: number
}

type PageState = {
  loading: boolean
  error: string
  player: Player | null
  team: Team | null
  club: Club | null
  result: Result | null
  teamResults: Result[]
}

function normalize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)))
  }

  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) {
      return Math.max(0, Math.min(100, Math.round(n)))
    }
  }

  return null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function getFromSource(source: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!source) return null

  for (const key of keys) {
    const value = normalize(source[key])
    if (value !== null) return value
  }

  return null
}

function extractRadar(result: Result | null): Radar | null {
  if (!result) return null

  const direct = {
    confiance: getFromSource(result as Record<string, unknown>, ['confiance', 'confidence']),
    regulation: getFromSource(result as Record<string, unknown>, ['regulation', 'régulation']),
    engagement: getFromSource(result as Record<string, unknown>, ['engagement']),
    stabilite: getFromSource(result as Record<string, unknown>, ['stabilite', 'stabilité', 'stability'])
  }

  if (Object.values(direct).some((v) => v !== null)) {
    return {
      confiance: direct.confiance ?? 0,
      regulation: direct.regulation ?? 0,
      engagement: direct.engagement ?? 0,
      stabilite: direct.stabilite ?? 0
    }
  }

  const payload = asRecord(result.payload)
  const rawPayload = asRecord(result.raw_payload)
  const resultObj = asRecord(result.result)

  const sources: Array<Record<string, unknown> | null> = [
    asRecord(result.dimensions),
    asRecord(result.scores),
    payload,
    asRecord(payload?.dimensions),
    asRecord(payload?.scores),
    rawPayload,
    asRecord(rawPayload?.dimensions),
    asRecord(rawPayload?.scores),
    resultObj,
    asRecord(resultObj?.dimensions),
    asRecord(resultObj?.scores)
  ]

  for (const source of sources) {
    if (!source) continue

    const confiance = getFromSource(source, ['confiance', 'confidence'])
    const regulation = getFromSource(source, ['regulation', 'régulation'])
    const engagement = getFromSource(source, ['engagement'])
    const stabilite = getFromSource(source, ['stabilite', 'stabilité', 'stability'])

    if ([confiance, regulation, engagement, stabilite].some((v) => v !== null)) {
      return {
        confiance: confiance ?? 0,
        regulation: regulation ?? 0,
        engagement: engagement ?? 0,
        stabilite: stabilite ?? 0
      }
    }
  }

  return null
}

function getPlayerName(player: Player | null) {
  if (!player) return 'Joueur'
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sportif sans nom'
}

function getTeamName(team: Team | null) {
  if (!team) return '—'
  return team.team_name || team.name || 'Équipe sans nom'
}

function getClubName(club: Club | null) {
  if (!club) return '—'
  return club.club_name || club.name || 'Club sans nom'
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

function getLevel(score: number | null) {
  if (score === null) return 'Donnée indisponible'
  if (score < 45) return 'Zone fragile'
  if (score < 65) return 'Zone de progression'
  if (score < 80) return 'Zone solide'
  return 'Zone forte'
}

function getCoachInsight(score: number | null, radar: Radar | null) {
  if (radar) {
    const ordered = [
      { key: 'confiance', value: radar.confiance },
      { key: 'régulation', value: radar.regulation },
      { key: 'engagement', value: radar.engagement },
      { key: 'stabilité', value: radar.stabilite }
    ].sort((a, b) => b.value - a.value)

    const strongest = ordered[0]?.key || 'mental'
    const weakest = ordered[ordered.length - 1]?.key || 'mental'

    return `Le levier actuellement le plus fort est la ${strongest}. Le point de vigilance principal concerne la ${weakest}. L’accompagnement doit s’appuyer sur le point fort pour renforcer la stabilité du joueur dans les moments à enjeu.`
  }

  if (score === null) {
    return 'Aucune lecture détaillée disponible pour le moment.'
  }

  if (score < 45) {
    return "Le joueur a besoin d'un cadre mental simple, sécurisant et répétitif pour installer des repères stables."
  }

  if (score < 65) {
    return "Le joueur présente une base utile mais encore irrégulière. L'enjeu principal est de transformer le potentiel en constance."
  }

  if (score < 80) {
    return 'Le joueur montre une base mentale solide. Le travail du coach peut viser la précision et la répétabilité.'
  }

  return 'Le joueur présente une structure mentale forte. Le travail peut porter sur l’optimisation sous haute pression.'
}

function getProgressAxes(radar: Radar | null, score: number | null) {
  if (!radar) {
    if (score === null) {
      return [
        'Mettre en place des routines mentales simples.',
        'Structurer un protocole de concentration avant effort.',
        'Installer des repères de confiance observables.'
      ]
    }

    if (score < 45) {
      return [
        'Revenir à des routines courtes et répétées avant entraînement et compétition.',
        'Travailler la respiration et le recentrage émotionnel.',
        'Reconstruire la confiance par micro-objectifs atteignables.'
      ]
    }

    if (score < 65) {
      return [
        'Stabiliser le fonctionnement mental dans les temps faibles.',
        'Identifier les déclencheurs qui perturbent la performance.',
        'Renforcer la continuité entre intention, engagement et action.'
      ]
    }

    return [
      'Consolider les acquis déjà présents.',
      'Travailler la précision mentale sous pression.',
      'Transformer les forces en habitudes durables.'
    ]
  }

  return [
    {
      key: 'confiance',
      value: radar.confiance,
      text: 'Renforcer la confiance par des repères de réussite concrets.'
    },
    {
      key: 'regulation',
      value: radar.regulation,
      text: 'Améliorer la régulation émotionnelle avec routines respiratoires et recentrage.'
    },
    {
      key: 'engagement',
      value: radar.engagement,
      text: "Clarifier l'intention d'action et maintenir l'engagement jusqu'au bout."
    },
    {
      key: 'stabilite',
      value: radar.stabilite,
      text: 'Développer la stabilité mentale dans la durée et sous pression.'
    }
  ]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((item) => item.text)
}

function getPercentileText(playerScore: number | null, teamScores: number[]) {
  if (playerScore === null || teamScores.length <= 1) return 'Référence équipe indisponible'

  const lowerOrEqual = teamScores.filter((s) => s <= playerScore).length
  const percentile = Math.round((lowerOrEqual / teamScores.length) * 100)

  if (percentile >= 80) return `Top ${100 - percentile}% équipe`
  if (percentile >= 60) return 'Au-dessus de la moyenne équipe'
  if (percentile >= 40) return 'Dans la moyenne équipe'
  return 'En dessous de la moyenne équipe'
}

function RadarChart({ radar }: { radar: Radar | null }) {
  if (!radar) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          border: '1px dashed #cad5e5',
          background: '#f8fbff',
          color: '#667085',
          lineHeight: 1.7
        }}
      >
        Radar indisponible : les dimensions détaillées ne sont pas encore remontées.
      </div>
    )
  }

  const labels = ['Confiance', 'Régulation', 'Engagement', 'Stabilité']
  const values = [radar.confiance, radar.regulation, radar.engagement, radar.stabilite]
  const cx = 170
  const cy = 170
  const maxRadius = 112
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
      <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 430, height: 'auto' }}>
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
          const labelPoint = point(120, angle)
          return (
            <g key={labels[index]}>
              <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#d8e1ef" strokeWidth="1" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 12, fontWeight: 800, fill: '#667892' }}
              >
                {labels[index]}
              </text>
            </g>
          )
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(65,104,176,0.22)"
          stroke="#2f4d85"
          strokeWidth="3"
        />

        {values.map((value, index) => {
          const p = point(value, angles[index])
          return <circle key={index} cx={p.x} cy={p.y} r="4.5" fill="#2f4d85" />
        })}

        <circle cx={cx} cy={cy} r="4" fill="#2f4d85" />
      </svg>

      <div style={{ color: '#5f6f8e', fontWeight: 800 }}>Radar mental A4P</div>
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
        borderRadius: 24,
        padding: 22,
        boxShadow: '0 12px 34px rgba(23,37,69,0.08)'
      }}
    >
      <div
        style={{
          fontSize: 38,
          lineHeight: 1.05,
          fontWeight: 900,
          color: '#20335d',
          marginBottom: 10,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 18, lineHeight: 1.35, fontWeight: 800, color: '#667085' }}>
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

function InfoBox({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: 28,
        boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: 24, borderBottom: '1px solid #e5ebf5' }}>
        <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: '#182847' }}>{title}</h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </section>
  )
}

export default function PlayerPage() {
  const params = useParams()
  const playerId = typeof params?.playerId === 'string' ? params.playerId : ''

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    player: null,
    team: null,
    club: null,
    result: null,
    teamResults: []
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
          .single()

        if (playerError) throw playerError
        const player = (playerData as Player | null) ?? null

        if (!player) {
          throw new Error(`Joueur introuvable pour l'id ${playerId}`)
        }

        let team: Team | null = null
        let club: Club | null = null
        let teamResults: Result[] = []

        if (player.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', player.team_id)
            .maybeSingle()

          if (teamError) throw teamError
          team = (teamData as Team | null) ?? null

          if (team?.club_id) {
            const { data: clubData, error: clubError } = await supabase
              .from('clubs')
              .select('*')
              .eq('id', team.club_id)
              .maybeSingle()

            if (clubError) throw clubError
            club = (clubData as Club | null) ?? null
          }

          const { data: teamPlayersData, error: teamPlayersError } = await supabase
            .from('players')
            .select('id')
            .eq('team_id', player.team_id)

          if (teamPlayersError) throw teamPlayersError

          const teamPlayerIds = ((teamPlayersData as Array<{ id: string }> | null) ?? []).map((p) => p.id)

          if (teamPlayerIds.length > 0) {
            const { data: allTeamResultsData, error: allTeamResultsError } = await supabase
              .from('cmp_results')
              .select('*')
              .in('player_id', teamPlayerIds)
              .order('created_at', { ascending: false })

            if (allTeamResultsError) throw allTeamResultsError

            const allTeamResults = (allTeamResultsData as Result[] | null) ?? []

            const latestByPlayer = new Map<string, Result>()

            for (const item of allTeamResults) {
              const pid = typeof item.player_id === 'string' ? item.player_id : null
              if (!pid) continue
              if (!latestByPlayer.has(pid)) {
                latestByPlayer.set(pid, item)
              }
            }

            teamResults = Array.from(latestByPlayer.values())
          }
        }

        let result: Result | null = null

        const { data: resultData, error: resultError } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (resultError) throw resultError

        result = ((resultData as Result[] | null) ?? [])[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            player,
            team,
            club,
            result,
            teamResults
          })
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue.'

        if (!cancelled) {
          setState({
            loading: false,
            error: message,
            player: null,
            team: null,
            club: null,
            result: null,
            teamResults: []
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [playerId])

  const radar = useMemo(() => extractRadar(state.result), [state.result])
  const globalScore = normalize(state.result?.score_global)

  const teamScores = useMemo(
    () =>
      state.teamResults
        .map((item) => normalize(item.score_global))
        .filter((v): v is number => v !== null),
    [state.teamResults]
  )

  const teamAverage = useMemo(() => {
    if (teamScores.length === 0) return null
    return Math.round(teamScores.reduce((sum, value) => sum + value, 0) / teamScores.length)
  }, [teamScores])

  const gapVsTeam = globalScore !== null && teamAverage !== null ? globalScore - teamAverage : null
  const percentileText = getPercentileText(globalScore, teamScores)
  const coachInsight = getCoachInsight(globalScore, radar)
  const progressAxes = getProgressAxes(radar, globalScore)

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
        maxWidth: 1420,
        margin: '0 auto',
        padding: 24,
        background: '#eef2f7'
      }}
    >
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)',
          borderRadius: 30,
          padding: 30,
          boxShadow: '0 18px 48px rgba(18,35,66,0.08)',
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
              Fiche joueur premium A4P
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 54,
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
                fontSize: 21,
                lineHeight: 1.75,
                color: '#5f6f8e',
                maxWidth: 980
              }}
            >
              Lecture mentale individuelle, repérage des leviers prioritaires et positionnement par
              rapport à l’équipe.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
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

          <Link
            href="/club"
            style={{
              textDecoration: 'none',
              padding: '14px 20px',
              borderRadius: 16,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #2f4d85 0%, #4168b0 100%)',
              fontWeight: 800,
              fontSize: 16,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 26px rgba(47,77,133,0.22)'
            }}
          >
            Retour club
          </Link>
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
          value={globalScore !== null ? `${globalScore}/100` : '—'}
          label="score global"
          helper={getLevel(globalScore)}
        />
        <StatCard
          value={state.result?.profile_label || state.result?.profile_code || '—'}
          label="profil mental"
          helper="lecture actuelle"
        />
        <StatCard
          value={teamAverage !== null ? `${teamAverage}/100` : '—'}
          label="moyenne équipe"
          helper="référence collective"
        />
        <StatCard
          value={gapVsTeam !== null ? `${gapVsTeam > 0 ? '+' : ''}${gapVsTeam}` : '—'}
          label="écart équipe"
          helper={percentileText}
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <InfoBox title="Analyse coach">
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.8, color: '#5f6f8e' }}>
            {coachInsight}
          </p>

          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12
            }}
          >
            <StatCard
              value={formatDate(state.result?.created_at)}
              label="dernière mesure"
              helper="date résultat"
            />
            <StatCard
              value={state.teamResults.length}
              label="joueurs comparés"
              helper="base équipe"
            />
          </div>
        </InfoBox>

        <InfoBox title="Radar mental">
          <RadarChart radar={radar} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginTop: 18
            }}
          >
            <StatCard value={radar ? `${radar.confiance}/100` : '—'} label="confiance" />
            <StatCard value={radar ? `${radar.regulation}/100` : '—'} label="régulation" />
            <StatCard value={radar ? `${radar.engagement}/100` : '—'} label="engagement" />
            <StatCard value={radar ? `${radar.stabilite}/100` : '—'} label="stabilité" />
          </div>
        </InfoBox>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24
        }}
      >
        <InfoBox title="Axes de progression prioritaires">
          <div style={{ display: 'grid', gap: 14 }}>
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
        </InfoBox>

        <InfoBox title="Synthèse staff">
          <div
            style={{
              display: 'grid',
              gap: 14
            }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: '#f8fafd',
                border: '1px solid #e1e8f3',
                color: '#44516d',
                lineHeight: 1.8,
                fontWeight: 700
              }}
            >
              Niveau actuel : {getLevel(globalScore)}.
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: '#f8fafd',
                border: '1px solid #e1e8f3',
                color: '#44516d',
                lineHeight: 1.8,
                fontWeight: 700
              }}
            >
              Positionnement équipe : {percentileText}.
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 20,
                background: '#f8fafd',
                border: '1px solid #e1e8f3',
                color: '#44516d',
                lineHeight: 1.8,
                fontWeight: 700
              }}
            >
              Priorité coach : transformer les axes faibles en routines observables à l’entraînement
              et en compétition.
            </div>
          </div>
        </InfoBox>
      </section>
    </main>
  )
}
