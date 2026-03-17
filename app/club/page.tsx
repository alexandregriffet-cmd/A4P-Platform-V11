'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
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
  is_active?: boolean | null
  created_at?: string | null
}

type Club = {
  id: string
  name?: string | null
  code?: string | null
  contact_email?: string | null
  created_at?: string | null
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

type ResultBase = {
  id?: string | null
  player_id?: string | null
  club_id?: string | null
  team_id?: string | null
  score_global?: number | string | null
  created_at?: string | null
}

type CMPResult = ResultBase & {
  profile_label?: string | null
  confidence?: number | string | null
  regulation?: number | string | null
  engagement?: number | string | null
  stability?: number | string | null
}

type PMPResult = ResultBase & {
  profile_label?: string | null
}

type PsychoResult = {
  id?: string | null
  player_id?: string | null
  club_id?: string | null
  team_id?: string | null
  stress_level?: number | string | null
  created_at?: string | null
}

type PlayerStatus = 'top' | 'stable' | 'watch' | 'risk'

type PageState = {
  loading: boolean
  error: string
  userState: { id: string; email?: string | null } | null
  selectedUser: ClubUser | null
  visibleClubs: Club[]
  visibleTeams: Team[]
  visiblePlayers: Player[]
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

function getUserName(user: ClubUser | null) {
  if (!user) return 'Utilisateur'
  const full = [user.firstname || '', user.lastname || ''].filter(Boolean).join(' ').trim()
  return full || user.email || 'Utilisateur'
}

function getPlayerName(player: Player) {
  const full = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return full || 'Sportif sans nom'
}

function formatDateFR(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR')
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
      className="a4p-card"
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
      className="a4p-card a4p-avoid-break"
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
  if (items.length === 0) {
    return <p style={{ margin: 0, color: '#667085' }}>Aucun élément disponible.</p>
  }

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

function RadarBlock({
  confidence,
  regulation,
  engagement,
  stability
}: {
  confidence: number | null
  regulation: number | null
  engagement: number | null
  stability: number | null
}) {
  const size = 260
  const center = size / 2
  const radius = 95

  const valueOrZero = (v: number | null) => (v ?? 0) / 100

  const top = {
    x: center,
    y: center - radius * valueOrZero(confidence)
  }
  const right = {
    x: center + radius * valueOrZero(regulation),
    y: center
  }
  const bottom = {
    x: center,
    y: center + radius * valueOrZero(engagement)
  }
  const left = {
    x: center - radius * valueOrZero(stability),
    y: center
  }

  const points = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`

  return (
    <div
      className="a4p-card a4p-avoid-break"
      style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 30, color: '#182847' }}>
        Radar collectif A4P
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon
            points={`${center},${center - radius} ${center + radius},${center} ${center},${center + radius} ${center - radius},${center}`}
            fill="none"
            stroke="#d5deee"
            strokeWidth="1.2"
          />
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#d5deee" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#d5deee" />
          <polygon points={points} fill="rgba(53,82,143,0.18)" stroke="#35528f" strokeWidth="4" />

          <text x={center} y={20} textAnchor="middle" fontSize="15" fill="#667085" fontWeight="700">
            Confiance
          </text>
          <text x={size - 18} y={center + 5} textAnchor="end" fontSize="15" fill="#667085" fontWeight="700">
            Régulation
          </text>
          <text x={center} y={size - 14} textAnchor="middle" fontSize="15" fill="#667085" fontWeight="700">
            Engagement
          </text>
          <text x={18} y={center + 5} textAnchor="start" fontSize="15" fill="#667085" fontWeight="700">
            Stabilité
          </text>
        </svg>
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12
        }}
      >
        <div style={{ color: '#44516d' }}><strong>Confiance :</strong> {confidence !== null ? `${confidence}/100` : '—'}</div>
        <div style={{ color: '#44516d' }}><strong>Régulation :</strong> {regulation !== null ? `${regulation}/100` : '—'}</div>
        <div style={{ color: '#44516d' }}><strong>Engagement :</strong> {engagement !== null ? `${engagement}/100` : '—'}</div>
        <div style={{ color: '#44516d' }}><strong>Stabilité :</strong> {stability !== null ? `${stability}/100` : '—'}</div>
      </div>
    </div>
  )
}

function statusMeta(status: PlayerStatus) {
  if (status === 'top') return { label: 'Top mental', bg: '#e9f7ef', border: '#cfead9', color: '#1f6b43' }
  if (status === 'stable') return { label: 'Stable', bg: '#edf4ff', border: '#d8e5ff', color: '#35528f' }
  if (status === 'watch') return { label: 'À accompagner', bg: '#fff7e8', border: '#f6e2b8', color: '#9a6b00' }
  return { label: 'À risque', bg: '#fff0f0', border: '#f2c9c9', color: '#9f2f2f' }
}

export default function ClubPage() {
  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    userState: null,
    selectedUser: null,
    visibleClubs: [],
    visibleTeams: [],
    visiblePlayers: [],
    cmpByPlayer: new Map(),
    pmpByPlayer: new Map(),
    psychoByPlayer: new Map()
  })

  const [sending, setSending] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        if (userError) throw new Error(userError.message)

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

        const authUserId = user.id

        const [
          clubUsersRes,
          clubsRes,
          teamsRes,
          playersRes,
          cmpRes,
          pmpRes,
          psychoRes
        ] = await Promise.all([
          supabase.from('club_users').select('*').eq('auth_user_id', authUserId),
          supabase.from('clubs').select('*').order('created_at', { ascending: false }),
          supabase.from('teams').select('*').order('created_at', { ascending: false }),
          supabase.from('players').select('*').order('created_at', { ascending: false }),
          supabase.from('cmp_results').select('*').order('created_at', { ascending: false }),
          supabase.from('pmp_results').select('*').order('created_at', { ascending: false }),
          supabase.from('psycho_results').select('*').order('created_at', { ascending: false })
        ])

        if (clubUsersRes.error) throw new Error(`club_users: ${clubUsersRes.error.message}`)
        if (clubsRes.error) throw new Error(`clubs: ${clubsRes.error.message}`)
        if (teamsRes.error) throw new Error(`teams: ${teamsRes.error.message}`)
        if (playersRes.error) throw new Error(`players: ${playersRes.error.message}`)
        if (cmpRes.error) throw new Error(`cmp_results: ${cmpRes.error.message}`)
        if (pmpRes.error) throw new Error(`pmp_results: ${pmpRes.error.message}`)
        if (psychoRes.error) throw new Error(`psycho_results: ${psychoRes.error.message}`)

        const selectedUser = ((clubUsersRes.data as ClubUser[] | null) ?? [])[0] ?? null
        const clubs = (clubsRes.data as Club[] | null) ?? []
        const teams = (teamsRes.data as Team[] | null) ?? []
        const players = (playersRes.data as Player[] | null) ?? []
        const cmpResults = (cmpRes.data as CMPResult[] | null) ?? []
        const pmpResults = (pmpRes.data as PMPResult[] | null) ?? []
        const psychoResults = (psychoRes.data as PsychoResult[] | null) ?? []

        if (!selectedUser) {
          if (!cancelled) {
            setState((prev) => ({
              ...prev,
              loading: false,
              userState: { id: user.id, email: user.email },
              selectedUser: null,
              error: 'Aucun profil club_users relié à cet utilisateur connecté.'
            }))
          }
          return
        }

        let visibleClubs: Club[] = []
        let visibleTeams: Team[] = []
        let visiblePlayers: Player[] = []

        if (selectedUser.role === 'a4p_admin') {
          visibleClubs = clubs
          visibleTeams = teams
          visiblePlayers = players
        } else if (selectedUser.role === 'club_admin') {
          visibleClubs = clubs.filter((club) => club.id === selectedUser.club_id)
          visibleTeams = teams.filter((team) => team.club_id === selectedUser.club_id)
          visiblePlayers = players.filter((player) => player.club_id === selectedUser.club_id)
        } else if (selectedUser.role === 'coach') {
          visibleClubs = clubs.filter((club) => club.id === selectedUser.club_id)
          visibleTeams = teams.filter((team) => team.id === selectedUser.team_id)
          visiblePlayers = players.filter((player) => player.team_id === selectedUser.team_id)
        } else if (selectedUser.role === 'player') {
          visibleClubs = clubs.filter((club) => club.id === selectedUser.club_id)
          const myPlayer = players.find((p) => p.club_user_id === selectedUser.id)
          visibleTeams = myPlayer?.team_id ? teams.filter((team) => team.id === myPlayer.team_id) : []
          visiblePlayers = players.filter((player) => player.club_user_id === selectedUser.id)
        }

        const visiblePlayerIds = visiblePlayers.map((p) => p.id)

        const cmpByPlayer = new Map<string, CMPResult>()
        for (const item of cmpResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && visiblePlayerIds.includes(pid) && !cmpByPlayer.has(pid)) {
            cmpByPlayer.set(pid, item)
          }
        }

        const pmpByPlayer = new Map<string, PMPResult>()
        for (const item of pmpResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && visiblePlayerIds.includes(pid) && !pmpByPlayer.has(pid)) {
            pmpByPlayer.set(pid, item)
          }
        }

        const psychoByPlayer = new Map<string, PsychoResult>()
        for (const item of psychoResults) {
          const pid = typeof item.player_id === 'string' ? item.player_id : null
          if (pid && visiblePlayerIds.includes(pid) && !psychoByPlayer.has(pid)) {
            psychoByPlayer.set(pid, item)
          }
        }

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            userState: { id: user.id, email: user.email },
            selectedUser,
            visibleClubs,
            visibleTeams,
            visiblePlayers,
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
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/club'
  }

  async function handleMagicLink() {
    const email = prompt('Entre ton email')
    if (!email) return

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://a4-p-platform-v11.vercel.app/club'
      }
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Regarde tes emails pour te connecter')
  }

  function handleExportPDF() {
    window.print()
  }

  const metrics = useMemo(() => {
    const cmpValues = state.visiblePlayers.map((p) => normalizeScore(state.cmpByPlayer.get(p.id)?.score_global))
    const pmpValues = state.visiblePlayers.map((p) => normalizeScore(state.pmpByPlayer.get(p.id)?.score_global))
    const stressValues = state.visiblePlayers.map((p) => normalizeScore(state.psychoByPlayer.get(p.id)?.stress_level))
    const confidenceValues = state.visiblePlayers.map((p) => normalizeScore(state.cmpByPlayer.get(p.id)?.confidence))
    const regulationValues = state.visiblePlayers.map((p) => normalizeScore(state.cmpByPlayer.get(p.id)?.regulation))
    const engagementValues = state.visiblePlayers.map((p) => normalizeScore(state.cmpByPlayer.get(p.id)?.engagement))
    const stabilityValues = state.visiblePlayers.map((p) => normalizeScore(state.cmpByPlayer.get(p.id)?.stability))

    return {
      cmpAverage: average(cmpValues),
      pmpAverage: average(pmpValues),
      stressAverage: average(stressValues),
      confidenceAverage: average(confidenceValues),
      regulationAverage: average(regulationValues),
      engagementAverage: average(engagementValues),
      stabilityAverage: average(stabilityValues)
    }
  }, [state.visiblePlayers, state.cmpByPlayer, state.pmpByPlayer, state.psychoByPlayer])

  const segmentedPlayers = useMemo(() => {
    return state.visiblePlayers
      .map((player) => {
        const cmp = normalizeScore(state.cmpByPlayer.get(player.id)?.score_global)
        const pmp = normalizeScore(state.pmpByPlayer.get(player.id)?.score_global)
        const stress = normalizeScore(state.psychoByPlayer.get(player.id)?.stress_level)
        const regulation = normalizeScore(state.cmpByPlayer.get(player.id)?.regulation)

        let status: PlayerStatus = 'stable'

        if ((cmp !== null && cmp >= 78) && (pmp !== null && pmp >= 75) && (stress === null || stress <= 60)) {
          status = 'top'
        } else if ((cmp !== null && cmp < 60) || (stress !== null && stress >= 75)) {
          status = 'risk'
        } else if ((stress !== null && stress >= 65) || (regulation !== null && regulation < 65)) {
          status = 'watch'
        } else {
          status = 'stable'
        }

        return { player, cmp, pmp, stress, status }
      })
      .sort((a, b) => {
        const rank = { top: 0, stable: 1, watch: 2, risk: 3 }
        return rank[a.status] - rank[b.status]
      })
  }, [state.visiblePlayers, state.cmpByPlayer, state.pmpByPlayer, state.psychoByPlayer])

  const segmentationCounts = useMemo(() => {
    return {
      top: segmentedPlayers.filter((p) => p.status === 'top').length,
      stable: segmentedPlayers.filter((p) => p.status === 'stable').length,
      watch: segmentedPlayers.filter((p) => p.status === 'watch').length,
      risk: segmentedPlayers.filter((p) => p.status === 'risk').length
    }
  }, [segmentedPlayers])

  const coachRecommendations = useMemo(() => {
    const items: string[] = []

    if ((metrics.stressAverage ?? 0) >= 65) {
      items.push("Mettre en place des routines collectives de respiration, recentrage et retour au calme avant les temps forts.")
    }
    if ((metrics.regulationAverage ?? 100) < 65) {
      items.push("Structurer les feedbacks coach avec des consignes brèves, concrètes et orientées vers la prochaine action.")
    }
    if ((metrics.stabilityAverage ?? 100) < 60) {
      items.push("Installer des rituels entre les séquences pour maintenir une continuité mentale et éviter les décrochages.")
    }
    if ((metrics.engagementAverage ?? 100) < 70) {
      items.push("Clarifier les intentions collectives et les rôles pour soutenir l'engagement du groupe dans la durée.")
    }
    if ((metrics.confidenceAverage ?? 100) < 70) {
      items.push("Renforcer la confiance collective en s'appuyant sur des repères de progrès observables et répétés.")
    }
    if (segmentationCounts.risk > 0) {
      items.push(`Prévoir un accompagnement renforcé pour ${segmentationCounts.risk} joueur(s) actuellement classé(s) à risque.`)
    }
    if (items.length === 0) {
      items.push("L'équipe présente une base fonctionnelle satisfaisante. L'enjeu principal est désormais la consolidation et le suivi dans le temps.")
    }

    return items.slice(0, 5)
  }, [metrics, segmentationCounts])

  const collectiveSynthesis = useMemo(() => {
    const items: string[] = []

    if (metrics.cmpAverage !== null) {
      if (metrics.cmpAverage >= 75) {
        items.push(`Le socle mental collectif apparaît solide avec une moyenne CMP de ${metrics.cmpAverage}/100.`)
      } else if (metrics.cmpAverage >= 60) {
        items.push(`Le socle mental collectif reste correct mais encore irrégulier avec une moyenne CMP de ${metrics.cmpAverage}/100.`)
      } else {
        items.push(`Le socle mental collectif semble fragile avec une moyenne CMP de ${metrics.cmpAverage}/100.`)
      }
    }

    if (metrics.pmpAverage !== null) {
      if (metrics.pmpAverage >= 75) {
        items.push("Les profils PMP suggèrent une équipe capable de se mobiliser vite et de produire de l'intention dans l'action.")
      } else {
        items.push("Les profils PMP montrent un collectif qui doit encore clarifier ses repères de décision et son fonctionnement dominant.")
      }
    }

    if (metrics.stressAverage !== null) {
      if (metrics.stressAverage >= 70) {
        items.push(`Le niveau de stress moyen est élevé (${metrics.stressAverage}/100), avec un risque de dégradation de la lucidité en compétition.`)
      } else if (metrics.stressAverage >= 55) {
        items.push(`Le stress moyen reste présent (${metrics.stressAverage}/100) et peut dégrader la constance dans les moments à enjeu.`)
      } else {
        items.push(`Le stress moyen reste plutôt maîtrisé (${metrics.stressAverage}/100), ce qui constitue un appui collectif intéressant.`)
      }
    }

    if ((metrics.regulationAverage ?? 100) < 65) {
      items.push("La régulation émotionnelle collective doit être structurée pour limiter les variations de performance sous pression.")
    }

    if (segmentationCounts.top > 0) {
      items.push(`${segmentationCounts.top} joueur(s) ressort(ent) comme top mental et peuvent servir de points d'appui dans le groupe.`)
    }

    if (items.length === 0) {
      items.push("Les données restent encore trop partielles pour une lecture collective complète.")
    }

    return items
  }, [metrics, segmentationCounts])

  const reportTitle = useMemo(() => {
    const clubName =
      state.visibleClubs.length === 1
        ? state.visibleClubs[0].name || 'Club'
        : state.visibleClubs.length > 1
          ? 'Multi-clubs'
          : 'Club'

    return `Rapport Club Pro A4P — ${clubName}`
  }, [state.visibleClubs])

  async function handleSendToCoach() {
    try {
      const defaultEmail =
        state.visibleClubs.length === 1 ? state.visibleClubs[0].contact_email || '' : ''

      const to = prompt('Adresse email du coach ou du responsable club', defaultEmail)
      if (!to) return

      setSending(true)

      const response = await fetch('/api/send-club-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          clubName:
            state.visibleClubs.length === 1
              ? state.visibleClubs[0].name || 'Club'
              : 'Rapport club A4P',
          teamsCount: state.visibleTeams.length,
          playersCount: state.visiblePlayers.length,
          portalUrl: 'https://a4-p-platform-v11.vercel.app/club',
          senderName: getUserName(state.selectedUser)
        })
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Erreur envoi email.')
      }

      alert('Email envoyé au coach avec succès.')
    } catch (error: any) {
      alert(error?.message || 'Erreur inconnue.')
    } finally {
      setSending(false)
    }
  }

  if (state.loading) {
    return <div style={{ padding: 24 }}>Chargement...</div>
  }

  if (!state.userState) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Connexion requise</h1>
        <button onClick={handleMagicLink}>Se connecter</button>
      </main>
    )
  }

  if (state.error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Accès club indisponible</h1>
        <p>{state.error}</p>
        <button onClick={handleLogout}>Déconnexion</button>
      </main>
    )
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html, body {
            background: #ffffff !important;
          }

          .a4p-no-print {
            display: none !important;
          }

          .a4p-print-root {
            max-width: 100% !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .a4p-card {
            box-shadow: none !important;
            border: 1px solid #dbe4f0 !important;
          }

          .a4p-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          a {
            color: #182847 !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <main className="a4p-print-root" style={{ maxWidth: 1280, margin: '0 auto', padding: 24, background: '#eef2f7' }}>
        <section
          className="a4p-card a4p-avoid-break"
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
              <div className="a4p-no-print" style={{ marginBottom: 10, color: '#5b3df5', fontWeight: 700 }}>
                Portail Club Pro
              </div>

              <h1 style={{ margin: 0, fontSize: 46, lineHeight: 1.02, color: '#182847' }}>
                {reportTitle}
              </h1>

              <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085', lineHeight: 1.7 }}>
                Édité le {formatDateFR(new Date())}
              </p>

              <p style={{ margin: '10px 0 0 0', fontSize: 16, color: '#35528f', fontWeight: 800 }}>
                Utilisateur connecté : {state.selectedUser?.role || '—'} · {getUserName(state.selectedUser)}
              </p>
            </div>

            <div className="a4p-no-print" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handleExportPDF}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontWeight: 800,
                  background: '#1f3158',
                  color: '#ffffff',
                  border: '1px solid #1f3158'
                }}
              >
                Exporter PDF club
              </button>

              <button
                onClick={handleSendToCoach}
                disabled={sending}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontWeight: 800,
                  background: '#0f9d58',
                  color: '#ffffff',
                  border: '1px solid #0f9d58',
                  opacity: sending ? 0.7 : 1
                }}
              >
                {sending ? 'Envoi...' : 'Envoyer au coach'}
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontWeight: 800,
                  background: '#35528f',
                  color: '#ffffff',
                  border: '1px solid #35528f'
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </section>

        <section
          className="a4p-avoid-break"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 24
          }}
        >
          <StatCard value={state.visibleClubs.length} label="Clubs visibles" />
          <StatCard value={state.visibleTeams.length} label="Équipes visibles" />
          <StatCard value={state.visiblePlayers.length} label="Joueurs visibles" />
          <StatCard value={metrics.cmpAverage !== null ? `${metrics.cmpAverage}/100` : '—'} label="Moyenne CMP" />
        </section>

        <section
          className="a4p-avoid-break"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 24
          }}
        >
          <StatCard value={metrics.pmpAverage !== null ? `${metrics.pmpAverage}/100` : '—'} label="Moyenne PMP" />
          <StatCard value={metrics.stressAverage !== null ? `${metrics.stressAverage}/100` : '—'} label="Stress moyen" />
          <StatCard value={segmentationCounts.top} label="Top mental" helper="Joueurs moteurs du groupe" />
          <StatCard value={segmentationCounts.risk} label="À risque" helper="Joueurs à sécuriser en priorité" />
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: 24,
            marginBottom: 24
          }}
        >
          <RadarBlock
            confidence={metrics.confidenceAverage}
            regulation={metrics.regulationAverage}
            engagement={metrics.engagementAverage}
            stability={metrics.stabilityAverage}
          />

          <SectionCard title="Recommandations coach globales">
            <BulletList items={coachRecommendations} />
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
          <SectionCard title="Synthèse collective A4P">
            <BulletList items={collectiveSynthesis} />
          </SectionCard>

          <SectionCard title="Segmentation automatique des joueurs">
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ color: '#44516d', lineHeight: 1.7 }}>
                <strong>Top mental :</strong> {segmentationCounts.top}
              </div>
              <div style={{ color: '#44516d', lineHeight: 1.7 }}>
                <strong>Stable :</strong> {segmentationCounts.stable}
              </div>
              <div style={{ color: '#44516d', lineHeight: 1.7 }}>
                <strong>À accompagner :</strong> {segmentationCounts.watch}
              </div>
              <div style={{ color: '#44516d', lineHeight: 1.7 }}>
                <strong>À risque :</strong> {segmentationCounts.risk}
              </div>
            </div>
          </SectionCard>
        </section>

        <SectionCard title="Équipes visibles">
          {state.visibleTeams.length === 0 ? (
            <p style={{ margin: 0, color: '#667085' }}>Aucune équipe visible pour ce rôle.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {state.visibleTeams.map((team) => (
                <div
                  key={team.id}
                  className="a4p-avoid-break"
                  style={{
                    border: '1px solid #e2e8f4',
                    borderRadius: 18,
                    background: '#f8fbff',
                    padding: 18
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1f3158' }}>
                    {team.name || 'Équipe'}
                  </div>
                  <div style={{ fontSize: 14, color: '#667085', marginTop: 6 }}>
                    Saison : {team.season || '—'} · Catégorie : {team.category || '—'}
                  </div>
                  <div className="a4p-no-print" style={{ marginTop: 14 }}>
                    <Link
                      href={`/club/equipes/${team.id}`}
                      style={{
                        textDecoration: 'none',
                        padding: '10px 14px',
                        borderRadius: 14,
                        color: '#ffffff',
                        background: '#35528f',
                        fontWeight: 800,
                        display: 'inline-block'
                      }}
                    >
                      Voir le dashboard équipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ height: 24 }} />

        <SectionCard title="Lecture club pro des joueurs">
          {segmentedPlayers.length === 0 ? (
            <p style={{ margin: 0, color: '#667085' }}>Aucun joueur visible pour ce rôle.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {segmentedPlayers.map(({ player, cmp, pmp, stress, status }) => {
                const meta = statusMeta(status)

                return (
                  <div
                    key={player.id}
                    className="a4p-avoid-break"
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

                      <div
                        style={{
                          background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          color: meta.color,
                          borderRadius: 999,
                          padding: '8px 12px',
                          fontWeight: 800
                        }}
                      >
                        {meta.label}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 12,
                        marginBottom: 12
                      }}
                    >
                      <StatCard value={cmp !== null ? `${cmp}/100` : '—'} label="CMP" />
                      <StatCard value={pmp !== null ? `${pmp}/100` : '—'} label="PMP" />
                      <StatCard value={stress !== null ? `${stress}/100` : '—'} label="Stress" />
                    </div>

                    <div className="a4p-no-print" style={{ marginTop: 10 }}>
                      <Link
                        href={`/club/joueurs/${player.id}`}
                        style={{
                          textDecoration: 'none',
                          padding: '10px 14px',
                          borderRadius: 14,
                          color: '#ffffff',
                          background: '#35528f',
                          fontWeight: 800,
                          display: 'inline-block'
                        }}
                      >
                        Voir la fiche joueur
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>
      </main>
    </>
  )
}
