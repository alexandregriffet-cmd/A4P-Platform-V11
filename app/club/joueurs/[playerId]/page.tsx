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

type ResultRow = {
  id?: string | null
  player_id?: string | null
  score_global?: number | string | null
  profile_label?: string | null
  profile_code?: string | null
  created_at?: string | null
  confiance?: number | string | null
  regulation?: number | string | null
  engagement?: number | string | null
  stabilite?: number | string | null
  confidence?: number | string | null
  stability?: number | string | null
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
  result: ResultRow | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Erreur inconnue.'
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

function normalizeScore(value: unknown): number | null {
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

function getPlayerName(player: Player | null) {
  if (!player) return 'Joueur'
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sportif sans nom'
}

function extractRadar(result: ResultRow | null): Radar | null {
  if (!result) return null

  const confiance = normalizeScore(result.confiance ?? result.confidence)
  const regulation = normalizeScore(result.regulation)
  const engagement = normalizeScore(result.engagement)
  const stabilite = normalizeScore(result.stabilite ?? result.stability)

  if ([confiance, regulation, engagement, stabilite].every((v) => v === null)) {
    return null
  }

  return {
    confiance: confiance ?? 0,
    regulation: regulation ?? 0,
    engagement: engagement ?? 0,
    stabilite: stabilite ?? 0
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
        background: '#ffffff',
        borderRadius: 20,
        padding: 22,
        boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: '#1f3158',
          marginBottom: 8
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#667085' }}>{label}</div>
    </div>
  )
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
        Radar indisponible : aucune dimension détaillée n’est enregistrée.
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
      <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 420, height: 'auto' }}>
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
          const labelPoint = point(122, angle)
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

export default function PlayerPage() {
  const params = useParams()
  const playerId = Array.isArray(params?.playerId)
    ? params.playerId[0]
    : params?.playerId || ''

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    player: null,
    result: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState({
          loading: true,
          error: '',
          player: null,
          result: null
        })

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
          if (!cancelled) {
            setState({
              loading: false,
              error: '',
              player: null,
              result: null
            })
          }
          return
        }

        const { data: resultData, error: resultError } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (resultError) {
          throw new Error(`cmp_results: ${resultError.message}`)
        }

        const result = ((resultData as ResultRow[] | null) ?? [])[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            player,
            result
          })
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            loading: false,
            error: getErrorMessage(error),
            player: null,
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
    return (
      <div style={{ padding: 20 }}>
        <h1>Accès indisponible</h1>
        <p>Joueur introuvable pour l'id {playerId}</p>
        <Link href="/club">Retour club</Link>
      </div>
    )
  }

  const score = normalizeScore(state.result?.score_global)
  const radar = extractRadar(state.result)

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 24, background: '#eef2f7' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/club">← Retour club</Link>
      </div>

      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          marginBottom: 24
        }}
      >
        <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.02, color: '#182847' }}>
          {getPlayerName(state.player)}
        </h1>
        <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085' }}>
          {state.player.email || 'Email non renseigné'}
        </p>
      </section>

      {!state.result ? (
        <section
          style={{
            padding: 24,
            borderRadius: 20,
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
          }}
        >
          <h2 style={{ marginTop: 0 }}>Joueur trouvé</h2>
          <p>Aucun résultat CMP pour ce joueur.</p>
        </section>
      ) : (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              marginBottom: 24
            }}
          >
            <StatCard value={score !== null ? `${score}/100` : '—'} label="Score global" />
            <StatCard value={state.result.profile_label || state.result.profile_code || '—'} label="Profil" />
            <StatCard value={formatDate(state.result.created_at)} label="Date" />
            <StatCard value={radar ? 'Oui' : 'Non'} label="Radar détaillé" />
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
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: 34, color: '#182847' }}>Dernier résultat CMP</h2>
              <p><strong>Score global :</strong> {score !== null ? `${score}/100` : '—'}</p>
              <p><strong>Profil :</strong> {state.result.profile_label || state.result.profile_code || '—'}</p>
              <p><strong>Date :</strong> {formatDate(state.result.created_at)}</p>
              <p><strong>Confiance :</strong> {radar ? `${radar.confiance}/100` : '—'}</p>
              <p><strong>Régulation :</strong> {radar ? `${radar.regulation}/100` : '—'}</p>
              <p><strong>Engagement :</strong> {radar ? `${radar.engagement}/100` : '—'}</p>
              <p><strong>Stabilité :</strong> {radar ? `${radar.stabilite}/100` : '—'}</p>
            </div>

            <div
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: 34, color: '#182847' }}>Radar mental</h2>
              <RadarChart radar={radar} />
            </div>
          </section>
        </>
      )}
    </main>
  )
}
