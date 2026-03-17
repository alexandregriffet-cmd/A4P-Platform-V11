'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Team = {
  id: string
  club_id?: string | null
  name?: string | null
  season?: string | null
  category?: string | null
  coach_name?: string | null
  created_at?: string | null
}

type Club = {
  id: string
  name?: string | null
  code?: string | null
  contact_email?: string | null
}

type Player = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  team_id?: string | null
  club_id?: string | null
}

type CmpResultRow = {
  id?: string | null
  player_id?: string | null
  team_id?: string | null
  club_id?: string | null
  score_global?: number | string | null
  profile_label?: string | null
  created_at?: string | null
}

type PmpResultRow = {
  id?: string | null
  player_id?: string | null
  team_id?: string | null
  club_id?: string | null
  score_global?: number | string | null
  profile_label?: string | null
  created_at?: string | null
}

type PsychoResultRow = {
  id?: string | null
  player_id?: string | null
  team_id?: string | null
  club_id?: string | null
  stress_level?: number | string | null
  confidence_level?: number | string | null
  emotional_control?: number | string | null
  profile_label?: string | null
  created_at?: string | null
}

type PlayerRowView = {
  id: string
  name: string
  email: string
  cmpScore: number | null
  pmpScore: number | null
  stressLevel: number | null
}

type PageState = {
  loading: boolean
  error: string
  team: Team | null
  club: Club | null
  players: Player[]
  cmpResults: CmpResultRow[]
  pmpResults: PmpResultRow[]
  psychoResults: PsychoResultRow[]
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

function formatDate(value?: string | null) {
  if (!value) return '—'

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

function getPlayerName(player: Player) {
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sportif sans nom'
}

function average(values: Array<number | null>) {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
}

function getCollectiveSummary({
  cmpAverage,
  pmpAverage,
  stressAverage,
  emotionalAverage,
  playersCount
}: {
  cmpAverage: number | null
  pmpAverage: number | null
  stressAverage: number | null
  emotionalAverage: number | null
  playersCount: number
}) {
  const lines: string[] = []

  if (playersCount === 0) {
    return [
      "Aucun joueur n’est actuellement rattaché à cette équipe. La lecture collective n’est donc pas encore disponible."
    ]
  }

  if (cmpAverage !== null) {
    if (cmpAverage >= 80) {
      lines.push("Le niveau mental collectif observé via le CMP apparaît globalement fort et déjà compétitif.")
    } else if (cmpAverage >= 65) {
      lines.push("Le CMP collectif montre une base solide, mais encore irrégulière dans la constance d’ensemble.")
    } else {
      lines.push("Le CMP collectif suggère une équipe qui a besoin de structuration mentale et de repères plus stables.")
    }
  }

  if (pmpAverage !== null) {
    if (pmpAverage >= 80) {
      lines.push("Le PMP indique un potentiel de fonctionnement globalement favorable à l’adaptation et à la performance.")
    } else if (pmpAverage >= 65) {
      lines.push("Le PMP collectif montre des ressources intéressantes, avec une marge de progression sur la cohérence du fonctionnement.")
    } else {
      lines.push("Le PMP collectif laisse penser qu’une partie de l’équipe manque encore de repères mentaux stables dans sa manière de fonctionner.")
    }
  }

  if (stressAverage !== null) {
    if (stressAverage >= 70) {
      lines.push("Le niveau de stress moyen est élevé, ce qui peut impacter la fluidité collective dans les moments à enjeu.")
    } else if (stressAverage >= 50) {
      lines.push("Le stress collectif reste présent sans être explosif, mais il mérite d’être mieux canalisé dans les temps clés.")
    } else {
      lines.push("Le niveau de stress moyen reste plutôt contenu, ce qui constitue un point d’appui collectif intéressant.")
    }
  }

  if (emotionalAverage !== null) {
    if (emotionalAverage >= 70) {
      lines.push("Le contrôle émotionnel collectif semble plutôt solide, ce qui favorise la stabilité de performance.")
    } else {
      lines.push("Le contrôle émotionnel collectif semble encore variable, avec un besoin de routines de régulation partagées.")
    }
  }

  if (lines.length === 0) {
    lines.push("Les données collectives sont encore insuffisantes pour produire une lecture d’équipe fiable.")
  }

  return lines
}

function getPriorityAxes({
  cmpAverage,
  stressAverage,
  emotionalAverage
}: {
  cmpAverage: number | null
  stressAverage: number | null
  emotionalAverage: number | null
}) {
  const axes: Array<{ score: number; text: string }> = []

  axes.push({
    score: cmpAverage === null ? 999 : cmpAverage,
    text: "Renforcer les routines mentales collectives pour créer davantage de stabilité entre entraînement et compétition."
  })

  axes.push({
    score: emotionalAverage === null ? 999 : emotionalAverage,
    text: "Travailler la régulation émotionnelle collective avec des protocoles simples, répétés et partagés."
  })

  axes.push({
    score: stressAverage === null ? 999 : 100 - stressAverage,
    text: "Réduire l’impact du stress dans les moments à enjeu par un langage commun, des repères de recentrage et des rôles clarifiés."
  })

  axes.push({
    score: 60,
    text: "Structurer des rituels d’équipe avant, pendant et après match pour homogénéiser la réponse mentale du groupe."
  })

  return axes
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => item.text)
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
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 14, color: '#8a96ad', lineHeight: 1.5 }}>
          {helper}
        </div>
      ) : null}
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

export default function TeamPage() {
  const params = useParams()
  const teamId = Array.isArray(params?.teamId) ? params.teamId[0] : params?.teamId || ''

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    team: null,
    club: null,
    players: [],
    cmpResults: [],
    pmpResults: [],
    psychoResults: []
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState({
          loading: true,
          error: '',
          team: null,
          club: null,
          players: [],
          cmpResults: [],
          pmpResults: [],
          psychoResults: []
        })

        if (!teamId) {
          throw new Error("Identifiant équipe manquant.")
        }

        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .maybeSingle()

        if (teamError) {
          throw new Error(`teams: ${teamError.message}`)
        }

        const team = (teamData as Team | null) ?? null

        if (!team) {
          throw new Error(`Équipe introuvable pour l'id ${teamId}`)
        }

        let club: Club | null = null

        if (team.club_id) {
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

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })

        if (playersError) {
          throw new Error(`players: ${playersError.message}`)
        }

        const players = (playersData as Player[] | null) ?? []
        const playerIds = players.map((p) => p.id)

        let cmpResults: CmpResultRow[] = []
        let pmpResults: PmpResultRow[] = []
        let psychoResults: PsychoResultRow[] = []

        if (playerIds.length > 0) {
          const { data: cmpData, error: cmpError } = await supabase
            .from('cmp_results')
            .select('*')
            .in('player_id', playerIds)
            .order('created_at', { ascending: false })

          if (cmpError) {
            throw new Error(`cmp_results: ${cmpError.message}`)
          }

          const { data: pmpData, error: pmpError } = await supabase
            .from('pmp_results')
            .select('*')
            .in('player_id', playerIds)
            .order('created_at', { ascending: false })

          if (pmpError) {
            throw new Error(`pmp_results: ${pmpError.message}`)
          }

          const { data: psychoData, error: psychoError } = await supabase
            .from('psycho_results')
            .select('*')
            .in('player_id', playerIds)
            .order('created_at', { ascending: false })

          if (psychoError) {
            throw new Error(`psycho_results: ${psychoError.message}`)
          }

          cmpResults = (cmpData as CmpResultRow[] | null) ?? []
          pmpResults = (pmpData as PmpResultRow[] | null) ?? []
          psychoResults = (psychoData as PsychoResultRow[] | null) ?? []
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            team,
            club,
            players,
            cmpResults,
            pmpResults,
            psychoResults
          })
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setState({
            loading: false,
            error: getErrorMessage(error),
            team: null,
            club: null,
            players: [],
            cmpResults: [],
            pmpResults: [],
            psychoResults: []
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [teamId])

  const cmpLatestByPlayer = useMemo(() => {
    const map = new Map<string, CmpResultRow>()
    for (const item of state.cmpResults) {
      const playerId = typeof item.player_id === 'string' ? item.player_id : null
      if (playerId && !map.has(playerId)) map.set(playerId, item)
    }
    return map
  }, [state.cmpResults])

  const pmpLatestByPlayer = useMemo(() => {
    const map = new Map<string, PmpResultRow>()
    for (const item of state.pmpResults) {
      const playerId = typeof item.player_id === 'string' ? item.player_id : null
      if (playerId && !map.has(playerId)) map.set(playerId, item)
    }
    return map
  }, [state.pmpResults])

  const psychoLatestByPlayer = useMemo(() => {
    const map = new Map<string, PsychoResultRow>()
    for (const item of state.psychoResults) {
      const playerId = typeof item.player_id === 'string' ? item.player_id : null
      if (playerId && !map.has(playerId)) map.set(playerId, item)
    }
    return map
  }, [state.psychoResults])

  const rows: PlayerRowView[] = useMemo(() => {
    return state.players.map((player) => {
      const cmp = cmpLatestByPlayer.get(player.id)
      const pmp = pmpLatestByPlayer.get(player.id)
      const psycho = psychoLatestByPlayer.get(player.id)

      return {
        id: player.id,
        name: getPlayerName(player),
        email: player.email || '—',
        cmpScore: normalizeScore(cmp?.score_global),
        pmpScore: normalizeScore(pmp?.score_global),
        stressLevel: normalizeScore(psycho?.stress_level)
      }
    })
  }, [state.players, cmpLatestByPlayer, pmpLatestByPlayer, psychoLatestByPlayer])

  const cmpAverage = useMemo(() => average(rows.map((r) => r.cmpScore)), [rows])
  const pmpAverage = useMemo(() => average(rows.map((r) => r.pmpScore)), [rows])
  const stressAverage = useMemo(() => average(rows.map((r) => r.stressLevel)), [rows])
  const emotionalAverage = useMemo(
    () =>
      average(
        state.players.map((player) => {
          const psycho = psychoLatestByPlayer.get(player.id)
          return normalizeScore(psycho?.emotional_control)
        })
      ),
    [state.players, psychoLatestByPlayer]
  )

  const collectiveSummary = getCollectiveSummary({
    cmpAverage,
    pmpAverage,
    stressAverage,
    emotionalAverage,
    playersCount: state.players.length
  })

  const priorityAxes = getPriorityAxes({
    cmpAverage,
    stressAverage,
    emotionalAverage
  })

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

  if (!state.team) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Équipe introuvable</h1>
        <Link href="/club">Retour club</Link>
      </div>
    )
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24, background: '#eef2f7' }}>
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
          {state.team.name || 'Équipe sans nom'}
        </h1>
        <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085', lineHeight: 1.7 }}>
          Club : {state.club?.name || '—'} · Saison : {state.team.season || '—'} · Catégorie :{' '}
          {state.team.category || '—'} · Coach : {state.team.coach_name || '—'}
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
        <StatCard value={state.players.length} label="Joueurs" />
        <StatCard value={cmpAverage !== null ? `${cmpAverage}/100` : '—'} label="Moyenne CMP" />
        <StatCard value={pmpAverage !== null ? `${pmpAverage}/100` : '—'} label="Moyenne PMP" />
        <StatCard value={stressAverage !== null ? `${stressAverage}/100` : '—'} label="Stress moyen" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <SectionCard title="Synthèse collective équipe">
          <div style={{ display: 'grid', gap: 16 }}>
            {collectiveSummary.map((line, index) => (
              <p key={index} style={{ margin: 0, lineHeight: 1.8, color: '#44516d', fontSize: 17 }}>
                {line}
              </p>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Axes collectifs prioritaires">
          <div style={{ display: 'grid', gap: 12 }}>
            {priorityAxes.map((axis, index) => (
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
        </SectionCard>
      </section>

      <SectionCard title="Joueurs de l’équipe">
        {rows.length === 0 ? (
          <p style={{ margin: 0, color: '#667085' }}>Aucun joueur rattaché à cette équipe.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {rows.map((row) => (
              <div
                key={row.id}
                style={{
                  border: '1px solid #e2e8f4',
                  borderRadius: 18,
                  background: '#f8fbff',
                  padding: 18
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1f3158' }}>{row.name}</div>
                    <div style={{ fontSize: 14, color: '#667085' }}>{row.email}</div>
                  </div>

                  <Link
                    href={`/club/joueurs/${row.id}`}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 14px',
                      borderRadius: 14,
                      color: '#ffffff',
                      background: '#35528f',
                      fontWeight: 800
                    }}
                  >
                    Voir la fiche joueur
                  </Link>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 12
                  }}
                >
                  <StatCard value={row.cmpScore !== null ? `${row.cmpScore}/100` : '—'} label="CMP" />
                  <StatCard value={row.pmpScore !== null ? `${row.pmpScore}/100` : '—'} label="PMP" />
                  <StatCard value={row.stressLevel !== null ? `${row.stressLevel}/100` : '—'} label="Stress" />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </main>
  )
}
