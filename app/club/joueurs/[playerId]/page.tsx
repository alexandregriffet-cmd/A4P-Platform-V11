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

type CmpResultRow = {
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

type PmpResultRow = {
  id?: string | null
  player_id?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | string | null
  decision_style?: string | null
  focus_mode?: string | null
  strengths?: string | null
  vigilance_points?: string | null
  raw_payload?: unknown
  created_at?: string | null
  [key: string]: unknown
}

type PsychoResultRow = {
  id?: string | null
  player_id?: string | null
  stress_level?: number | string | null
  confidence_level?: number | string | null
  emotional_control?: number | string | null
  fear_factor?: number | string | null
  blockages?: string | null
  profile_label?: string | null
  raw_payload?: unknown
  created_at?: string | null
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
  cmp: CmpResultRow | null
  pmp: PmpResultRow | null
  psycho: PsychoResultRow | null
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string' && error.trim()) return error

  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }
  }

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

function extractRadar(result: CmpResultRow | null): Radar | null {
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
          marginBottom: 8,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#667085' }}>{label}</div>
    </div>
  )
}

function SectionCard({
  title,
  children
}: {
  title: string
  children: any
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 34, color: '#182847' }}>{title}</h2>
      {children}
    </div>
  )
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <SectionCard title={title}>
      <p style={{ margin: 0, color: '#667085', lineHeight: 1.7 }}>{text}</p>
    </SectionCard>
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

function PreSyntheseCroisee({
  cmp,
  pmp,
  psycho
}: {
  cmp: CmpResultRow | null
  pmp: PmpResultRow | null
  psycho: PsychoResultRow | null
}) {
  const cmpScore = normalizeScore(cmp?.score_global)
  const pmpScore = normalizeScore(pmp?.score_global)
  const stress = normalizeScore(psycho?.stress_level)
  const confidence = normalizeScore(psycho?.confidence_level)
  const emotionalControl = normalizeScore(psycho?.emotional_control)

  const lines: string[] = []

  if (cmpScore !== null) {
    if (cmpScore >= 80) {
      lines.push("Le CMP montre actuellement une base mentale forte et déjà exploitable en situation de performance.")
    } else if (cmpScore >= 65) {
      lines.push("Le CMP met en évidence une base mentale solide mais encore perfectible dans la régularité.")
    } else {
      lines.push("Le CMP suggère une base mentale encore instable qui demande de la structuration.")
    }
  }

  if (pmp?.profile_label || pmp?.profile_code) {
    lines.push(
      `Le PMP décrit un fonctionnement dominant de type ${pmp?.profile_label || pmp?.profile_code}, ce qui aide à comprendre comment le joueur traite l’information et entre dans l’action.`
    )
  }

  if (stress !== null || confidence !== null || emotionalControl !== null) {
    const stressText =
      stress === null ? '' : stress >= 70 ? 'une charge de stress élevée' : 'une charge de stress plutôt contenue'
    const confidenceText =
      confidence === null
        ? ''
        : confidence >= 70
          ? 'un socle de confiance intéressant'
          : 'une confiance encore fragile'
    const regulationText =
      emotionalControl === null
        ? ''
        : emotionalControl >= 70
          ? 'une régulation émotionnelle relativement solide'
          : 'une régulation émotionnelle encore instable'

    lines.push(
      `Sur le plan psycho-émotionnel, on observe ${stressText}${stressText && (confidenceText || regulationText) ? ', ' : ''}${confidenceText}${confidenceText && regulationText ? ' et ' : ''}${regulationText}.`
    )
  }

  if (lines.length === 0) {
    lines.push("La synthèse croisée n’est pas encore disponible car les trois sources de données ne sont pas suffisamment renseignées.")
  }

  return (
    <SectionCard title="Pré-synthèse croisée A4P">
      <div style={{ display: 'grid', gap: 16 }}>
        {lines.map((line, index) => (
          <p key={index} style={{ margin: 0, lineHeight: 1.8, color: '#44516d', fontSize: 17 }}>
            {line}
          </p>
        ))}
      </div>
    </SectionCard>
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
    cmp: null,
    pmp: null,
    psycho: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState({
          loading: true,
          error: '',
          player: null,
          cmp: null,
          pmp: null,
          psycho: null
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
              cmp: null,
              pmp: null,
              psycho: null
            })
          }
          return
        }

        const { data: cmpData, error: cmpError } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (cmpError) {
          throw new Error(`cmp_results: ${cmpError.message}`)
        }

        const { data: pmpData, error: pmpError } = await supabase
          .from('pmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (pmpError) {
          throw new Error(`pmp_results: ${pmpError.message}`)
        }

        const { data: psychoData, error: psychoError } = await supabase
          .from('psycho_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (psychoError) {
          throw new Error(`psycho_results: ${psychoError.message}`)
        }

        const cmp = ((cmpData as CmpResultRow[] | null) ?? [])[0] ?? null
        const pmp = ((pmpData as PmpResultRow[] | null) ?? [])[0] ?? null
        const psycho = ((psychoData as PsychoResultRow[] | null) ?? [])[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            player,
            cmp,
            pmp,
            psycho
          })
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            loading: false,
            error: getErrorMessage(error),
            player: null,
            cmp: null,
            pmp: null,
            psycho: null
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [playerId])

  const cmpScore = useMemo(() => normalizeScore(state.cmp?.score_global), [state.cmp])
  const pmpScore = useMemo(() => normalizeScore(state.pmp?.score_global), [state.pmp])
  const stressLevel = useMemo(() => normalizeScore(state.psycho?.stress_level), [state.psycho])
  const radar = useMemo(() => extractRadar(state.cmp), [state.cmp])

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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={cmpScore !== null ? `${cmpScore}/100` : '—'} label="CMP" />
        <StatCard value={state.pmp?.profile_label || state.pmp?.profile_code || '—'} label="PMP" />
        <StatCard value={stressLevel !== null ? `${stressLevel}/100` : '—'} label="Stress psycho" />
        <StatCard value={formatDate(state.cmp?.created_at || state.pmp?.created_at || state.psycho?.created_at)} label="Dernière mesure" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        {state.cmp ? (
          <SectionCard title="CMP">
            <p><strong>Score global :</strong> {cmpScore !== null ? `${cmpScore}/100` : '—'}</p>
            <p><strong>Profil :</strong> {state.cmp.profile_label || state.cmp.profile_code || '—'}</p>
            <p><strong>Date :</strong> {formatDate(state.cmp.created_at)}</p>
            <p><strong>Confiance :</strong> {radar ? `${radar.confiance}/100` : '—'}</p>
            <p><strong>Régulation :</strong> {radar ? `${radar.regulation}/100` : '—'}</p>
            <p><strong>Engagement :</strong> {radar ? `${radar.engagement}/100` : '—'}</p>
            <p><strong>Stabilité :</strong> {radar ? `${radar.stabilite}/100` : '—'}</p>
          </SectionCard>
        ) : (
          <EmptyCard title="CMP" text="Aucun résultat CMP n’est encore enregistré pour ce joueur." />
        )}

        <SectionCard title="Radar mental CMP">
          <RadarChart radar={radar} />
        </SectionCard>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        {state.pmp ? (
          <SectionCard title="PMP">
            <p><strong>Score global :</strong> {pmpScore !== null ? `${pmpScore}/100` : '—'}</p>
            <p><strong>Profil :</strong> {state.pmp.profile_label || state.pmp.profile_code || '—'}</p>
            <p><strong>Style de décision :</strong> {state.pmp.decision_style || '—'}</p>
            <p><strong>Mode de focus :</strong> {state.pmp.focus_mode || '—'}</p>
            <p><strong>Points forts :</strong> {state.pmp.strengths || '—'}</p>
            <p><strong>Points de vigilance :</strong> {state.pmp.vigilance_points || '—'}</p>
            <p><strong>Date :</strong> {formatDate(state.pmp.created_at)}</p>
          </SectionCard>
        ) : (
          <EmptyCard title="PMP" text="Aucun résultat PMP n’est encore enregistré pour ce joueur." />
        )}

        {state.psycho ? (
          <SectionCard title="Psycho-émotionnel">
            <p><strong>Profil :</strong> {state.psycho.profile_label || '—'}</p>
            <p><strong>Niveau de stress :</strong> {normalizeScore(state.psycho.stress_level) ?? '—'}/100</p>
            <p><strong>Niveau de confiance :</strong> {normalizeScore(state.psycho.confidence_level) ?? '—'}/100</p>
            <p><strong>Contrôle émotionnel :</strong> {normalizeScore(state.psycho.emotional_control) ?? '—'}/100</p>
            <p><strong>Facteur peur :</strong> {normalizeScore(state.psycho.fear_factor) ?? '—'}/100</p>
            <p><strong>Blocages :</strong> {state.psycho.blockages || '—'}</p>
            <p><strong>Date :</strong> {formatDate(state.psycho.created_at)}</p>
          </SectionCard>
        ) : (
          <EmptyCard
            title="Psycho-émotionnel"
            text="Aucun résultat psycho-émotionnel n’est encore enregistré pour ce joueur."
          />
        )}
      </section>

      <PreSyntheseCroisee cmp={state.cmp} pmp={state.pmp} psycho={state.psycho} />
    </main>
  )
}
