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

function getDominantDimension(radar: Radar | null) {
  if (!radar) return null

  const items = [
    { key: 'confiance', value: radar.confiance },
    { key: 'régulation', value: radar.regulation },
    { key: 'engagement', value: radar.engagement },
    { key: 'stabilité', value: radar.stabilite }
  ].sort((a, b) => b.value - a.value)

  return items[0]?.key ?? null
}

function getWeakestDimension(radar: Radar | null) {
  if (!radar) return null

  const items = [
    { key: 'confiance', value: radar.confiance },
    { key: 'régulation', value: radar.regulation },
    { key: 'engagement', value: radar.engagement },
    { key: 'stabilité', value: radar.stabilite }
  ].sort((a, b) => a.value - b.value)

  return items[0]?.key ?? null
}

function getProfileSummary(profile: string | null | undefined) {
  if (!profile || typeof profile !== 'string') {
    return "Le profil du joueur n’est pas encore défini avec précision. L’analyse reste générale et nécessite des données complémentaires pour être affinée."
  }

  const value = profile.toLowerCase()

  if (value.includes('explorateur')) {
    return "Le profil explorateur stratégique renvoie à un fonctionnement orienté vers l’adaptation, l’anticipation et la recherche de solutions. Le joueur a tendance à lire vite les situations, à s’ajuster en fonction du contexte et à mobiliser ses ressources lorsqu’il perçoit du sens dans l’action."
  }

  if (value.includes('leader')) {
    return "Le profil de leader traduit souvent une orientation vers l’initiative, l’impact et la prise de responsabilités. Le joueur cherche à peser sur le jeu et à donner une direction claire à son action."
  }

  if (value.includes('analytique')) {
    return "Le profil analytique renvoie généralement à un besoin de compréhension, de structure et de maîtrise. Le joueur performe mieux lorsqu’il dispose de repères clairs et d’un cadre cohérent."
  }

  return "Le profil actuel donne une première lecture utile du fonctionnement mental du joueur. Il sert surtout de repère pour orienter l’accompagnement et prioriser les leviers de progression."
}

function getScoreSummary(score: number | null) {
  if (score === null) {
    return "Aucun score global n’est disponible pour le moment."
  }

  if (score < 45) {
    return "Le score global situe actuellement le joueur dans une zone fragile. L’enjeu prioritaire est de recréer de la sécurité mentale, de la répétition et des repères simples."
  }

  if (score < 65) {
    return "Le score global montre une base présente mais encore irrégulière. Le joueur dispose de ressources, mais elles ne se stabilisent pas encore suffisamment dans la durée ou sous pression."
  }

  if (score < 80) {
    return "Le score global indique une base mentale solide. Le joueur possède déjà des appuis fiables, avec un potentiel clair de progression vers davantage de constance."
  }

  return "Le score global place le joueur dans une zone forte. La structure mentale semble globalement robuste, avec un potentiel d’optimisation plus que de reconstruction."
}

function getDimensionSummary(radar: Radar | null) {
  if (!radar) {
    return "Les dimensions détaillées ne sont pas encore disponibles, ce qui limite la finesse de lecture du fonctionnement mental."
  }

  const dominant = getDominantDimension(radar)
  const weakest = getWeakestDimension(radar)

  return `Le point d’appui principal semble être la ${dominant}. À l’inverse, la ${weakest} apparaît comme le levier le plus vulnérable à court terme. Cela signifie que le travail doit s’appuyer sur le point fort existant tout en sécurisant en priorité la zone la plus instable.`
}

function getPriorityAxes(radar: Radar | null, score: number | null) {
  if (!radar) {
    return [
      'Installer des routines mentales courtes avant entraînement et compétition.',
      'Structurer un protocole simple de concentration et de recentrage.',
      'Créer des repères de confiance observables et répétables.'
    ]
  }

  const items = [
    {
      key: 'confiance',
      value: radar.confiance,
      text: 'Renforcer la confiance avec des repères de réussite concrets et répétés.'
    },
    {
      key: 'regulation',
      value: radar.regulation,
      text: 'Développer la régulation émotionnelle pour mieux absorber la pression et les variations de match.'
    },
    {
      key: 'engagement',
      value: radar.engagement,
      text: "Clarifier l'intention d'action et maintenir l'engagement jusqu'au bout de la séquence."
    },
    {
      key: 'stabilite',
      value: radar.stabilite,
      text: 'Construire davantage de stabilité mentale dans la durée et dans les moments à enjeu.'
    }
  ]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((item) => item.text)

  if (score !== null && score >= 80) {
    return [
      items[0],
      'Transformer les points forts actuels en routines de haut niveau.',
      'Travailler la précision mentale et la répétabilité sous pression.'
    ]
  }

  return items
}

function SyntheseA4P({
  profile,
  score,
  radar
}: {
  profile: string | null | undefined
  score: number | null
  radar: Radar | null
}) {
  const profileSummary = getProfileSummary(profile)
  const scoreSummary = getScoreSummary(score)
  const dimensionSummary = getDimensionSummary(radar)
  const axes = getPriorityAxes(radar, score)

  return (
    <SectionCard title="Synthèse automatique A4P">
      <div style={{ display: 'grid', gap: 18 }}>
        <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d', fontSize: 17 }}>
          {profileSummary}
        </p>

        <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d', fontSize: 17 }}>
          {scoreSummary}
        </p>

        <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d', fontSize: 17 }}>
          {dimensionSummary}
        </p>

        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: '#f8fbff',
            border: '1px solid #dbe5f4'
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#60708f',
              marginBottom: 12
            }}
          >
            Axes de travail prioritaires
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {axes.map((axis, index) => (
              <div
                key={`${axis}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: 12,
                  alignItems: 'start'
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: '#e9efff',
                    color: '#35528f',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ lineHeight: 1.7, color: '#44516d', fontWeight: 700 }}>{axis}</div>
              </div>
            ))}
          </div>
        </div>
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

  const score = useMemo(() => normalizeScore(state.result?.score_global), [state.result])
  const radar = useMemo(() => extractRadar(state.result), [state.result])

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
              gap: 24,
              marginBottom: 24
            }}
          >
            <SectionCard title="Dernier résultat CMP">
              <p><strong>Score global :</strong> {score !== null ? `${score}/100` : '—'}</p>
              <p><strong>Profil :</strong> {state.result.profile_label || state.result.profile_code || '—'}</p>
              <p><strong>Date :</strong> {formatDate(state.result.created_at)}</p>
              <p><strong>Confiance :</strong> {radar ? `${radar.confiance}/100` : '—'}</p>
              <p><strong>Régulation :</strong> {radar ? `${radar.regulation}/100` : '—'}</p>
              <p><strong>Engagement :</strong> {radar ? `${radar.engagement}/100` : '—'}</p>
              <p><strong>Stabilité :</strong> {radar ? `${radar.stabilite}/100` : '—'}</p>
            </SectionCard>

            <SectionCard title="Radar mental">
              <RadarChart radar={radar} />
            </SectionCard>
          </section>

          <SyntheseA4P
            profile={state.result?.profile_label ?? state.result?.profile_code ?? ''}
            score={score}
            radar={radar}
          />
        </>
      )}
    </main>
  )
}
