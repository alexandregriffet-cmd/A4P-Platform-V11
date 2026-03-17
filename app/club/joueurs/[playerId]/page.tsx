'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Player = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
}

type Team = {
  id: string
  name?: string | null
  team_name?: string | null
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
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }

    try {
      return JSON.stringify(error)
    } catch {
      return 'Erreur inconnue.'
    }
  }

  if (typeof error === 'string' && error.trim()) return error
  return 'Erreur inconnue.'
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
  const nestedResult = asRecord(result.result)

  const sources: Array<Record<string, unknown> | null> = [
    asRecord(result.dimensions),
    asRecord(result.scores),
    payload,
    asRecord(payload?.dimensions),
    asRecord(payload?.scores),
    rawPayload,
    asRecord(rawPayload?.dimensions),
    asRecord(rawPayload?.scores),
    nestedResult,
    asRecord(nestedResult?.dimensions),
    asRecord(nestedResult?.scores)
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

    return `Le levier actuellement le plus fort est la ${strongest}. Le point de vigilance principal concerne la ${weakest}.`
  }

  if (score === null) return 'Aucune lecture détaillée disponible pour le moment.'
  if (score < 45) return "Le joueur a besoin d'un cadre mental simple et sécurisant."
  if (score < 65) return "Le joueur présente une base utile mais encore irrégulière."
  if (score < 80) return 'Le joueur montre une base mentale solide.'
  return 'Le joueur présente une structure mentale forte.'
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
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
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
          return <polygon key={level} points={pts} fill="none" stroke="#d8e1ef" strokeWidth="1" />
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

        <polygon points={polygonPoints} fill="rgba(65,104,176,0.22)" stroke="#2f4d85" strokeWidth="3" />

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
          marginBottom: 10
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, color: '#667085' }}>{label}</div>

      {helper ? <div style={{ marginTop: 8, fontSize: 14, color: '#8a96ad' }}>{helper}</div> : null}
    </div>
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
    result: null
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
          .maybeSingle()

        if (playerError) {
          throw new Error(`players: ${playerError.message}`)
        }

        const player = (playerData as Player | null) ?? null

        if (!player) {
          throw new Error(`Joueur introuvable pour l'id ${playerId}`)
        }

        let team: Team | null = null
        let club: Club | null = null

        if (player.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', player.team_id)
            .maybeSingle()

          if (teamError) {
            throw new Error(`teams: ${teamError.message}`)
          }

          team = (teamData as Team | null) ?? null

          if (team?.club_id) {
            const { data: clubData, error: clubError } = await supabase
              .from('clubs')
              .select('*')
              .eq('id', team.club_id)
              .maybeSingle()

            if (clubError) {
              throw new Error(`clubs: ${clubError.message}`)
            }

            club = (clubData as Club | null) ?? null
          }
        }

        let result: Result | null = null

        const { data: resultData, error: resultError } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (resultError) {
          throw new Error(`cmp_results: ${resultError.message}`)
        }

        result = ((resultData as Result[] | null) ?? [])[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            player,
            team,
            club,
            result
          })
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            loading: false,
            error: getErrorMessage(error),
            player: null,
            team: null,
            club: null,
            result: null
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
  const coachInsight = getCoachInsight(globalScore, radar)

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
        maxWidth: 1200,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
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

            <h1 style={{ margin: 0, fontSize: 46, lineHeight: 1.02, color: '#182847' }}>
              {getPlayerName(state.player)}
            </h1>

            <p style={{ margin: '16px 0 0 0', fontSize: 18, lineHeight: 1.7, color: '#5f6f8e' }}>
              Club : {getClubName(state.club)} · Équipe : {getTeamName(state.team)} · Email : {state.player.email || '—'}
            </p>
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
              justifyContent: 'center'
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
        <StatCard value={globalScore !== null ? `${globalScore}/100` : '—'} label="score global" helper={getLevel(globalScore)} />
        <StatCard value={state.result?.profile_label || state.result?.profile_code || '—'} label="profil mental" helper="lecture actuelle" />
        <StatCard value={formatDate(state.result?.created_at)} label="dernière mesure" helper="date résultat" />
        <StatCard value={radar ? 'Oui' : 'Non'} label="radar détaillé" helper="dimensions disponibles" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24
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
            <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: '#182847' }}>
              Analyse coach
            </h2>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.8, color: '#5f6f8e' }}>
              {coachInsight}
            </p>
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
            <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, color: '#182847' }}>
              Radar mental
            </h2>
          </div>
          <div style={{ padding: 24 }}>
            <RadarChart radar={radar} />
          </div>
        </div>
      </section>
    </main>
  )
}
