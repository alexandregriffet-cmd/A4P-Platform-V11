'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ClubUser = {
  id: string
  auth_user_id?: string | null
  club_id?: string | null
  team_id?: string | null
  role?: 'a4p_admin' | 'club_admin' | 'coach' | 'player' | string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
}

type Team = {
  id: string
  club_id?: string | null
  name?: string | null
  season?: string | null
  category?: string | null
  coach_name?: string | null
  created_at?: string | null
}

type Player = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  club_id?: string | null
  team_id?: string | null
  club_user_id?: string | null
  created_at?: string | null
}

type CMPResult = {
  id?: string | null
  player_id?: string | null
  score_global?: number | string | null
  profile_label?: string | null
  confidence?: number | string | null
  regulation?: number | string | null
  engagement?: number | string | null
  stability?: number | string | null
  created_at?: string | null
}

type PMPResult = {
  id?: string | null
  player_id?: string | null
  score_global?: number | string | null
  profile_label?: string | null
  decision_style?: string | null
  focus_mode?: string | null
  strong_points?: string | null
  vigilance_points?: string | null
  created_at?: string | null
}

type PsychoResult = {
  id?: string | null
  player_id?: string | null
  profile_label?: string | null
  stress_level?: number | string | null
  confidence_level?: number | string | null
  emotional_control?: number | string | null
  fear_factor?: number | string | null
  blockages?: string | null
  created_at?: string | null
}

type TeamPageState = {
  loading: boolean
  error: string
  userState: { id: string; email?: string | null } | null
  currentUser: ClubUser | null
  team: Team | null
  players: Player[]
  cmpByPlayer: Map<string, CMPResult>
  pmpByPlayer: Map<string, PMPResult>
  psychoByPlayer: Map<string, PsychoResult>
}

function normalizeScore(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return Math.round(n)
  }
  return null
}

function average(values: Array<number | null>) {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
}

function countAboveOrEqual(values: Array<number | null>, threshold: number) {
  return values.filter((v) => v !== null && v >= threshold).length
}

function countBelow(values: Array<number | null>, threshold: number) {
  return values.filter((v) => v !== null && v < threshold).length
}

function getPlayerName(player: Player) {
  const full = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return full || 'Sportif sans nom'
}

function getTeamLabel(team: Team | null) {
  if (!team) return 'Équipe'
  return team.name || 'Équipe'
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
  children: ReactNode
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
      <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 30, color: '#182847' }}>{title}</h2>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p style={{ margin: 0, color: '#667085' }}>Aucun point à afficher.</p>

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((item, index) => (
        <div
          key={`${index}-${item}`}
          style={{
            background: '#f8fbff',
            border: '1px solid #e2e8f4',
            borderRadius: 16,
            padding: 14,
            color: '#44516d',
            lineHeight: 1.6
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

export default function TeamPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = Array.isArray(params?.teamId) ? params.teamId[0] : params?.teamId

  const [state, setState] = useState<TeamPageState>({
    loading: true,
    error: '',
    userState: null,
    currentUser: null,
    team: null,
    players: [],
    cmpByPlayer: new Map(),
    pmpByPlayer: new Map(),
    psychoByPlayer: new Map()
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        if (!teamId) {
          throw new Error("ID d'équipe manquant.")
        }

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(userError.message)
        }

        if (!user) {
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              loading: false,
              userState: null,
              error: ''
            }))
          }
          return
        }

        const clubUsersRes = await supabase
          .from('club_users')
          .select('*')
          .eq('auth_user_id', user.id)

        if (clubUsersRes.error) {
          throw new Error(`club_users: ${clubUsersRes.error.message}`)
        }

        const currentUser = ((clubUsersRes.data as ClubUser[] | null) ?? [])[0] ?? null

        if (!currentUser) {
          throw new Error('Aucun profil club_users relié à cet utilisateur connecté.')
        }

        const teamRes = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .maybeSingle()

        if (teamRes.error) {
          throw new Error(`teams: ${teamRes.error.message}`)
        }

        const team = (teamRes.data as Team | null) ?? null

        if (!team) {
          throw new Error(`Équipe introuvable pour l'id ${teamId}`)
        }

        const isAllowed =
          currentUser.role === 'a4p_admin' ||
          (currentUser.role === 'club_admin' && currentUser.club_id === team.club_id) ||
          (currentUser.role === 'coach' && currentUser.team_id === team.id)

        if (!isAllowed) {
          throw new Error("Vous n'avez pas accès à cette équipe.")
        }

        const [
          playersRes,
          cmpRes,
          pmpRes,
          psychoRes
        ] = await Promise.all([
          supabase.from('players').select('*').eq('team_id', team.id).order('created_at', { ascending: false }),
          supabase.from('cmp_results').select('*').order('created_at', { ascending: false }),
          supabase.from('pmp_results').select('*').order('created_at', { ascending: false }),
          supabase.from('psycho_results').select('*').order('created_at', { ascending: false })
        ])

        if (playersRes.error) throw new Error(`players: ${playersRes.error.message}`)
        if (cmpRes.error) throw new Error(`cmp_results: ${cmpRes.error.message}`)
        if (pmpRes.error) throw new Error(`pmp_results: ${pmpRes.error.message}`)
        if (psychoRes.error) throw new Error(`psycho_results: ${psychoRes.error.message}`)

        const players = (playersRes.data as Player[] | null) ?? []
        const cmpResults = (cmpRes.data as CMPResult[] | null) ?? []
        const pmpResults = (pmpRes.data as PMPResult[] | null) ?? []
        const psychoResults = (psychoRes.data as PsychoResult[] | null) ?? []

        const playerIds = players.map((p) => p.id)

        const cmpByPlayer = new Map<string, CMPResult>()
        for (const item of cmpResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && playerIds.includes(pid) && !cmpByPlayer.has(pid)) {
            cmpByPlayer.set(pid, item)
          }
        }

        const pmpByPlayer = new Map<string, PMPResult>()
        for (const item of pmpResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && playerIds.includes(pid) && !pmpByPlayer.has(pid)) {
            pmpByPlayer.set(pid, item)
          }
        }

        const psychoByPlayer = new Map<string, PsychoResult>()
        for (const item of psychoResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && playerIds.includes(pid) && !psychoByPlayer.has(pid)) {
            psychoByPlayer.set(pid, item)
          }
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            userState: { id: user.id, email: user.email },
            currentUser,
            team,
            players,
            cmpByPlayer,
            pmpByPlayer,
            psychoByPlayer
          })
        }
      } catch (error: any) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error?.message || 'Erreur inconnue.'
          }))
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [teamId])

  const metrics = useMemo(() => {
    const cmpValues = state.players.map((p) =>
      normalizeScore(state.cmpByPlayer.get(p.id)?.score_global)
    )
    const pmpValues = state.players.map((p) =>
      normalizeScore(state.pmpByPlayer.get(p.id)?.score_global)
    )
    const stressValues = state.players.map((p) =>
      normalizeScore(state.psychoByPlayer.get(p.id)?.stress_level)
    )
    const confidenceValues = state.players.map((p) =>
      normalizeScore(state.cmpByPlayer.get(p.id)?.confidence)
    )
    const regulationValues = state.players.map((p) =>
      normalizeScore(state.cmpByPlayer.get(p.id)?.regulation)
    )
    const engagementValues = state.players.map((p) =>
      normalizeScore(state.cmpByPlayer.get(p.id)?.engagement)
    )
    const stabilityValues = state.players.map((p) =>
      normalizeScore(state.cmpByPlayer.get(p.id)?.stability)
    )

    return {
      cmpAverage: average(cmpValues),
      pmpAverage: average(pmpValues),
      stressAverage: average(stressValues),
      confidenceAverage: average(confidenceValues),
      regulationAverage: average(regulationValues),
      engagementAverage: average(engagementValues),
      stabilityAverage: average(stabilityValues),
      cmpStrongCount: countAboveOrEqual(cmpValues, 75),
      cmpFragileCount: countBelow(cmpValues, 60),
      stressHighCount: countAboveOrEqual(stressValues, 70),
      stressLowCount: countBelow(stressValues, 50)
    }
  }, [state.players, state.cmpByPlayer, state.pmpByPlayer, state.psychoByPlayer])

  const synthesisItems = useMemo(() => {
    const items: string[] = []

    if (metrics.cmpAverage !== null) {
      if (metrics.cmpAverage >= 75) {
        items.push(
          `Le socle mental collectif apparaît globalement solide avec une moyenne CMP de ${metrics.cmpAverage}/100.`
        )
      } else if (metrics.cmpAverage >= 60) {
        items.push(
          `Le niveau mental collectif reste correct mais encore irrégulier, avec une moyenne CMP de ${metrics.cmpAverage}/100.`
        )
      } else {
        items.push(
          `Le socle mental collectif semble fragile à ce stade, avec une moyenne CMP de ${metrics.cmpAverage}/100.`
        )
      }
    }

    if (metrics.pmpAverage !== null) {
      if (metrics.pmpAverage >= 75) {
        items.push(
          `Les profils PMP suggèrent une équipe capable de se mobiliser vite et de produire de l'intention dans l'action.`
        )
      } else {
        items.push(
          `Les profils PMP montrent un collectif qui doit encore clarifier ses repères de décision et son mode de fonctionnement dominant.`
        )
      }
    }

    if (metrics.stressAverage !== null) {
      if (metrics.stressAverage >= 70) {
        items.push(
          `Le niveau de stress moyen est élevé (${metrics.stressAverage}/100), ce qui justifie un travail prioritaire de régulation émotionnelle.`
        )
      } else if (metrics.stressAverage >= 55) {
        items.push(
          `Le stress moyen reste présent (${metrics.stressAverage}/100) et peut dégrader la constance dans les moments à enjeu.`
        )
      } else {
        items.push(
          `Le stress moyen reste plutôt maîtrisé (${metrics.stressAverage}/100), ce qui constitue un appui collectif intéressant.`
        )
      }
    }

    if (metrics.stabilityAverage !== null && metrics.stabilityAverage < 60) {
      items.push(
        `La stabilité mentale ressort comme un point de vigilance collectif : l'équipe peut perdre en continuité entre deux séquences ou deux temps forts.`
      )
    }

    if (metrics.regulationAverage !== null && metrics.regulationAverage < 65) {
      items.push(
        `La régulation émotionnelle doit être structurée au niveau du groupe pour éviter les variations de performance sous pression.`
      )
    }

    if (items.length === 0) {
      items.push("Les données disponibles sont encore insuffisantes pour produire une lecture collective fiable.")
    }

    return items
  }, [metrics])

  const priorityItems = useMemo(() => {
    const items: string[] = []

    if ((metrics.stressAverage ?? 0) >= 65) {
      items.push(
        "Installer des routines collectives de retour au calme, respiration et recentrage avant et pendant les temps forts."
      )
    }

    if ((metrics.stabilityAverage ?? 100) < 60) {
      items.push(
        "Travailler la stabilité mentale dans la durée afin d'éviter les variations d'intensité émotionnelle et d'engagement."
      )
    }

    if ((metrics.regulationAverage ?? 100) < 65) {
      items.push(
        "Renforcer la régulation émotionnelle pour mieux absorber l'erreur, la frustration et la pression compétitive."
      )
    }

    if ((metrics.engagementAverage ?? 100) < 70) {
      items.push(
        "Clarifier les intentions de jeu et les rôles pour soutenir l'engagement collectif jusqu'au bout des séquences."
      )
    }

    if ((metrics.confidenceAverage ?? 100) < 70) {
      items.push(
        "Développer la confiance collective à travers des repères de réussite concrets, observables et répétés."
      )
    }

    if (items.length === 0) {
      items.push(
        "Consolider les points forts actuels par un suivi régulier et des passages répétés des tests dans le temps."
      )
    }

    return items.slice(0, 3)
  }, [metrics])

  if (state.loading) {
    return <div style={{ padding: 24 }}>Chargement...</div>
  }

  if (!state.userState) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Connexion requise</h1>
        <Link href="/club">Retour portail club</Link>
      </main>
    )
  }

  if (state.error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Accès équipe indisponible</h1>
        <p>{state.error}</p>
        <Link href="/club">Retour club</Link>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24, background: '#eef2f7' }}>
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <Link
              href="/club"
              style={{
                display: 'inline-block',
                marginBottom: 18,
                color: '#5b3df5',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              ← Retour club
            </Link>

            <h1 style={{ margin: 0, fontSize: 46, lineHeight: 1.02, color: '#182847' }}>
              Dashboard équipe A4P
            </h1>

            <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085', lineHeight: 1.7 }}>
              {getTeamLabel(state.team)} · Saison {state.team?.season || '—'} · Catégorie {state.team?.category || '—'}
            </p>

            <p style={{ margin: '10px 0 0 0', fontSize: 16, color: '#35528f', fontWeight: 800 }}>
              Vue sécurisée : {state.currentUser?.role || '—'}
            </p>
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
        <StatCard value={state.players.length} label="Joueurs de l'équipe" />
        <StatCard
          value={metrics.cmpAverage !== null ? `${metrics.cmpAverage}/100` : '—'}
          label="Moyenne CMP"
        />
        <StatCard
          value={metrics.pmpAverage !== null ? `${metrics.pmpAverage}/100` : '—'}
          label="Moyenne PMP"
        />
        <StatCard
          value={metrics.stressAverage !== null ? `${metrics.stressAverage}/100` : '—'}
          label="Stress moyen"
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
        <StatCard
          value={metrics.confidenceAverage !== null ? `${metrics.confidenceAverage}/100` : '—'}
          label="Confiance moyenne"
        />
        <StatCard
          value={metrics.regulationAverage !== null ? `${metrics.regulationAverage}/100` : '—'}
          label="Régulation moyenne"
        />
        <StatCard
          value={metrics.engagementAverage !== null ? `${metrics.engagementAverage}/100` : '—'}
          label="Engagement moyen"
        />
        <StatCard
          value={metrics.stabilityAverage !== null ? `${metrics.stabilityAverage}/100` : '—'}
          label="Stabilité moyenne"
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
        <StatCard
          value={metrics.cmpStrongCount}
          label="CMP forts"
          helper="Nombre de joueurs avec un score CMP ≥ 75"
        />
        <StatCard
          value={metrics.cmpFragileCount}
          label="CMP fragiles"
          helper="Nombre de joueurs avec un score CMP < 60"
        />
        <StatCard
          value={metrics.stressHighCount}
          label="Stress élevé"
          helper="Nombre de joueurs avec un stress ≥ 70"
        />
        <StatCard
          value={metrics.stressLowCount}
          label="Stress bas"
          helper="Nombre de joueurs avec un stress < 50"
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
        <SectionCard title="Synthèse collective A4P">
          <BulletList items={synthesisItems} />
        </SectionCard>

        <SectionCard title="Axes de travail prioritaires">
          <BulletList items={priorityItems} />
        </SectionCard>
      </section>

      <SectionCard title="Joueurs de l'équipe">
        {state.players.length === 0 ? (
          <p style={{ margin: 0, color: '#667085' }}>Aucun joueur trouvé dans cette équipe.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {state.players.map((player) => {
              const cmp = normalizeScore(state.cmpByPlayer.get(player.id)?.score_global)
              const pmp = normalizeScore(state.pmpByPlayer.get(player.id)?.score_global)
              const stress = normalizeScore(state.psychoByPlayer.get(player.id)?.stress_level)
              const cmpProfile = state.cmpByPlayer.get(player.id)?.profile_label || '—'
              const pmpProfile = state.pmpByPlayer.get(player.id)?.profile_label || '—'
              const psychoProfile = state.psychoByPlayer.get(player.id)?.profile_label || '—'

              return (
                <div
                  key={player.id}
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
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#1f3158' }}>
                        {getPlayerName(player)}
                      </div>
                      <div style={{ fontSize: 14, color: '#667085' }}>{player.email || '—'}</div>
                    </div>

                    <Link
                      href={`/club/joueurs/${player.id}`}
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
                      gap: 12,
                      marginBottom: 14
                    }}
                  >
                    <StatCard value={cmp !== null ? `${cmp}/100` : '—'} label="CMP" />
                    <StatCard value={pmp !== null ? `${pmp}/100` : '—'} label="PMP" />
                    <StatCard value={stress !== null ? `${stress}/100` : '—'} label="Stress" />
                  </div>

                  <div style={{ display: 'grid', gap: 8, color: '#44516d', lineHeight: 1.6 }}>
                    <div><strong>Profil CMP :</strong> {cmpProfile}</div>
                    <div><strong>Profil PMP :</strong> {pmpProfile}</div>
                    <div><strong>Lecture psycho-émotionnelle :</strong> {psychoProfile}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </main>
  )
}
