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

type Team = {
  id: string
  name?: string | null
  season?: string | null
  category?: string | null
  coach_name?: string | null
  club_id?: string | null
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

type PageState = {
  loading: boolean
  error: string
  userState: { id: string; email?: string | null } | null
  currentUser: ClubUser | null
  player: Player | null
  team: Team | null
  latestCMP: CMPResult | null
  latestPMP: PMPResult | null
  latestPsycho: PsychoResult | null
}

function normalizeScore(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return Math.round(n)
  }
  return null
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('fr-FR')
}

function getPlayerName(player: Player | null) {
  if (!player) return 'Joueur'
  const full = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return full || 'Joueur'
}

function scoreTone(score: number | null) {
  if (score === null) return 'Donnée absente'
  if (score >= 75) return 'Point d’appui solide'
  if (score >= 60) return 'Base correcte mais perfectible'
  return 'Zone prioritaire de progression'
}

function splitText(value?: string | null) {
  if (!value) return []
  return value
    .split(/[,;•]+/)
    .map((x) => x.trim())
    .filter(Boolean)
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

export default function PlayerPage() {
  const params = useParams<{ playerId: string }>()
  const playerId = Array.isArray(params?.playerId) ? params.playerId[0] : params?.playerId

  const [state, setState] = useState<PageState>({
    loading: true,
    error: '',
    userState: null,
    currentUser: null,
    player: null,
    team: null,
    latestCMP: null,
    latestPMP: null,
    latestPsycho: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: '' }))

        if (!playerId) {
          throw new Error('ID joueur manquant.')
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

        const playerRes = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .maybeSingle()

        if (playerRes.error) {
          throw new Error(`players: ${playerRes.error.message}`)
        }

        const player = (playerRes.data as Player | null) ?? null

        if (!player) {
          throw new Error(`Joueur introuvable pour l'id ${playerId}`)
        }

        const isAllowed =
          currentUser.role === 'a4p_admin' ||
          (currentUser.role === 'club_admin' && currentUser.club_id === player.club_id) ||
          (currentUser.role === 'coach' && currentUser.team_id === player.team_id) ||
          (currentUser.role === 'player' && currentUser.id === player.club_user_id)

        if (!isAllowed) {
          throw new Error("Vous n'avez pas accès à ce joueur.")
        }

        const [teamRes, cmpRes, pmpRes, psychoRes] = await Promise.all([
          player.team_id
            ? supabase.from('teams').select('*').eq('id', player.team_id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          supabase
            .from('cmp_results')
            .select('*')
            .eq('player_id', player.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('pmp_results')
            .select('*')
            .eq('player_id', player.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('psycho_results')
            .select('*')
            .eq('player_id', player.id)
            .order('created_at', { ascending: false })
        ])

        if ('error' in teamRes && teamRes.error) {
          throw new Error(`teams: ${teamRes.error.message}`)
        }
        if (cmpRes.error) throw new Error(`cmp_results: ${cmpRes.error.message}`)
        if (pmpRes.error) throw new Error(`pmp_results: ${pmpRes.error.message}`)
        if (psychoRes.error) throw new Error(`psycho_results: ${psychoRes.error.message}`)

        const team = ('data' in teamRes ? (teamRes.data as Team | null) : null) ?? null
        const latestCMP = ((cmpRes.data as CMPResult[] | null) ?? [])[0] ?? null
        const latestPMP = ((pmpRes.data as PMPResult[] | null) ?? [])[0] ?? null
        const latestPsycho = ((psychoRes.data as PsychoResult[] | null) ?? [])[0] ?? null

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            userState: { id: user.id, email: user.email },
            currentUser,
            player,
            team,
            latestCMP,
            latestPMP,
            latestPsycho
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
  }, [playerId])

  const cmpScore = normalizeScore(state.latestCMP?.score_global)
  const cmpConfidence = normalizeScore(state.latestCMP?.confidence)
  const cmpRegulation = normalizeScore(state.latestCMP?.regulation)
  const cmpEngagement = normalizeScore(state.latestCMP?.engagement)
  const cmpStability = normalizeScore(state.latestCMP?.stability)

  const pmpScore = normalizeScore(state.latestPMP?.score_global)

  const psychoStress = normalizeScore(state.latestPsycho?.stress_level)
  const psychoConfidence = normalizeScore(state.latestPsycho?.confidence_level)
  const psychoControl = normalizeScore(state.latestPsycho?.emotional_control)
  const psychoFear = normalizeScore(state.latestPsycho?.fear_factor)

  const interpretationItems = useMemo(() => {
    const items: string[] = []

    if (cmpScore !== null) {
      if (cmpScore >= 75) {
        items.push(`Le CMP montre une base mentale solide (${cmpScore}/100), avec des appuis déjà installés dans le fonctionnement du joueur.`)
      } else if (cmpScore >= 60) {
        items.push(`Le CMP indique une base correcte (${cmpScore}/100), mais encore trop dépendante du contexte et de la pression.`)
      } else {
        items.push(`Le CMP révèle une base mentale fragile (${cmpScore}/100), qui demande un travail structuré de sécurisation mentale.`)
      }
    }

    if (state.latestCMP?.profile_label) {
      items.push(`Le profil CMP dominant est : ${state.latestCMP.profile_label}.`)
    }

    if (state.latestPMP?.profile_label) {
      items.push(`Le PMP décrit un mode de fonctionnement préférentiel orienté : ${state.latestPMP.profile_label}.`)
    }

    if (psychoStress !== null) {
      if (psychoStress >= 70) {
        items.push(`Le stress est élevé (${psychoStress}/100), avec un risque de dégradation de la lucidité et de la régularité sous pression.`)
      } else if (psychoStress >= 55) {
        items.push(`Le stress reste présent (${psychoStress}/100) et doit être régulé pour éviter les fluctuations de performance.`)
      } else {
        items.push(`Le stress semble relativement contenu (${psychoStress}/100), ce qui constitue un point d'appui intéressant.`)
      }
    }

    if (cmpStability !== null && cmpStability < 60) {
      items.push("La stabilité mentale apparaît comme une zone sensible, notamment dans la durée ou après une erreur.")
    }

    if (cmpRegulation !== null && cmpRegulation < 65) {
      items.push("La régulation émotionnelle doit être renforcée pour mieux absorber la frustration et les variations de match.")
    }

    if (items.length === 0) {
      items.push("Les données disponibles restent insuffisantes pour produire une lecture complète.")
    }

    return items
  }, [cmpScore, state.latestCMP, state.latestPMP, psychoStress, cmpStability, cmpRegulation])

  const strongPoints = useMemo(() => {
    const items: string[] = []

    if (cmpConfidence !== null && cmpConfidence >= 75) {
      items.push(`Confiance mentale solide (${cmpConfidence}/100).`)
    }
    if (cmpEngagement !== null && cmpEngagement >= 75) {
      items.push(`Capacité d'engagement élevée (${cmpEngagement}/100).`)
    }
    if (pmpScore !== null && pmpScore >= 75) {
      items.push(`Fonctionnement PMP efficace et mobilisable (${pmpScore}/100).`)
    }
    if (psychoConfidence !== null && psychoConfidence >= 70) {
      items.push(`Confiance émotionnelle plutôt stable (${psychoConfidence}/100).`)
    }

    for (const item of splitText(state.latestPMP?.strong_points)) {
      items.push(item)
    }

    if (items.length === 0) {
      items.push("Le joueur semble davantage dans une phase de construction que de consolidation d'appuis forts clairement stabilisés.")
    }

    return items.slice(0, 5)
  }, [cmpConfidence, cmpEngagement, pmpScore, psychoConfidence, state.latestPMP])

  const vigilancePoints = useMemo(() => {
    const items: string[] = []

    if (psychoStress !== null && psychoStress >= 65) {
      items.push(`Stress à surveiller (${psychoStress}/100).`)
    }
    if (cmpRegulation !== null && cmpRegulation < 65) {
      items.push(`Régulation émotionnelle fragile (${cmpRegulation}/100).`)
    }
    if (cmpStability !== null && cmpStability < 60) {
      items.push(`Stabilité mentale vulnérable (${cmpStability}/100).`)
    }
    if (psychoFear !== null && psychoFear >= 40) {
      items.push(`Facteur peur à travailler (${psychoFear}/100).`)
    }

    for (const item of splitText(state.latestPMP?.vigilance_points)) {
      items.push(item)
    }

    for (const item of splitText(state.latestPsycho?.blockages)) {
      items.push(item)
    }

    if (items.length === 0) {
      items.push("Aucun signal de vigilance majeur n'est remonté sur les données actuelles.")
    }

    return items.slice(0, 6)
  }, [psychoStress, cmpRegulation, cmpStability, psychoFear, state.latestPMP, state.latestPsycho])

  const actionPlan = useMemo(() => {
    const items: string[] = []

    if ((psychoStress ?? 0) >= 65) {
      items.push("Mettre en place une routine courte de respiration et recentrage avant les situations à enjeu.")
    }
    if ((cmpRegulation ?? 100) < 65) {
      items.push("Travailler la régulation émotionnelle après erreur pour retrouver plus vite de la stabilité.")
    }
    if ((cmpStability ?? 100) < 60) {
      items.push("Renforcer la constance mentale dans la durée avec des routines entre les séquences.")
    }
    if ((cmpConfidence ?? 100) < 70) {
      items.push("Construire des repères de réussite simples, concrets et répétés pour soutenir la confiance.")
    }
    if ((cmpEngagement ?? 100) < 70) {
      items.push("Clarifier l'intention d'action avant chaque phase importante pour maintenir l'engagement jusqu'au bout.")
    }

    if (items.length === 0) {
      items.push("Consolider les points forts actuels et suivre leur stabilité dans le temps avec de nouveaux passages de tests.")
    }

    return items.slice(0, 4)
  }, [psychoStress, cmpRegulation, cmpStability, cmpConfidence, cmpEngagement])

  const coachAxes = useMemo(() => {
    const items: string[] = []

    if ((psychoStress ?? 0) >= 65) {
      items.push("Éviter de surcharger le joueur en consignes juste avant l'action.")
    }
    if ((cmpRegulation ?? 100) < 65) {
      items.push("Privilégier un feedback bref, concret, recentré sur la prochaine action.")
    }
    if ((cmpConfidence ?? 100) < 70) {
      items.push("Valoriser les repères de progression observables plutôt que le résultat brut.")
    }
    if ((cmpStability ?? 100) < 60) {
      items.push("Installer des rituels simples de remise en route entre deux séquences.")
    }

    if (items.length === 0) {
      items.push("Continuer à stabiliser le joueur par un cadre simple, lisible et répétitif.")
    }

    return items.slice(0, 4)
  }, [psychoStress, cmpRegulation, cmpConfidence, cmpStability])

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
        <h1>Accès joueur indisponible</h1>
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
        <Link
          href={state.player?.team_id ? `/club/equipes/${state.player.team_id}` : '/club'}
          style={{
            display: 'inline-block',
            marginBottom: 18,
            color: '#5b3df5',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          ← Retour équipe
        </Link>

        <h1 style={{ margin: 0, fontSize: 46, lineHeight: 1.02, color: '#182847' }}>
          Fiche joueur A4P
        </h1>

        <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085', lineHeight: 1.7 }}>
          {getPlayerName(state.player)} · {state.team?.name || 'Équipe'} · {state.team?.season || '—'} · {state.team?.category || '—'}
        </p>

        <p style={{ margin: '10px 0 0 0', fontSize: 16, color: '#35528f', fontWeight: 800 }}>
          Vue sécurisée : {state.currentUser?.role || '—'}
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
        <StatCard value={cmpScore !== null ? `${cmpScore}/100` : '—'} label="Score global CMP" helper={scoreTone(cmpScore)} />
        <StatCard value={pmpScore !== null ? `${pmpScore}/100` : '—'} label="Score global PMP" helper={scoreTone(pmpScore)} />
        <StatCard value={psychoStress !== null ? `${psychoStress}/100` : '—'} label="Stress" helper={scoreTone(psychoStress !== null ? 100 - psychoStress : null)} />
        <StatCard value={formatDate(state.latestCMP?.created_at || state.latestPMP?.created_at || state.latestPsycho?.created_at)} label="Dernière mesure" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={cmpConfidence !== null ? `${cmpConfidence}/100` : '—'} label="Confiance CMP" />
        <StatCard value={cmpRegulation !== null ? `${cmpRegulation}/100` : '—'} label="Régulation CMP" />
        <StatCard value={cmpEngagement !== null ? `${cmpEngagement}/100` : '—'} label="Engagement CMP" />
        <StatCard value={cmpStability !== null ? `${cmpStability}/100` : '—'} label="Stabilité CMP" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={psychoConfidence !== null ? `${psychoConfidence}/100` : '—'} label="Confiance émotionnelle" />
        <StatCard value={psychoControl !== null ? `${psychoControl}/100` : '—'} label="Contrôle émotionnel" />
        <StatCard value={psychoFear !== null ? `${psychoFear}/100` : '—'} label="Facteur peur" />
        <StatCard value={state.latestPMP?.profile_label || '—'} label="Profil PMP" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <SectionCard title="Lecture automatique A4P">
          <BulletList items={interpretationItems} />
        </SectionCard>

        <SectionCard title="Plan d'action prioritaire">
          <BulletList items={actionPlan} />
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
        <SectionCard title="Points forts">
          <BulletList items={strongPoints} />
        </SectionCard>

        <SectionCard title="Points de vigilance">
          <BulletList items={vigilancePoints} />
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
        <SectionCard title="Lecture détaillée CMP">
          <div style={{ display: 'grid', gap: 12, color: '#44516d', lineHeight: 1.7 }}>
            <div><strong>Profil :</strong> {state.latestCMP?.profile_label || '—'}</div>
            <div><strong>Confiance :</strong> {cmpConfidence !== null ? `${cmpConfidence}/100` : '—'}</div>
            <div><strong>Régulation :</strong> {cmpRegulation !== null ? `${cmpRegulation}/100` : '—'}</div>
            <div><strong>Engagement :</strong> {cmpEngagement !== null ? `${cmpEngagement}/100` : '—'}</div>
            <div><strong>Stabilité :</strong> {cmpStability !== null ? `${cmpStability}/100` : '—'}</div>
          </div>
        </SectionCard>

        <SectionCard title="Lecture détaillée PMP">
          <div style={{ display: 'grid', gap: 12, color: '#44516d', lineHeight: 1.7 }}>
            <div><strong>Profil :</strong> {state.latestPMP?.profile_label || '—'}</div>
            <div><strong>Style de décision :</strong> {state.latestPMP?.decision_style || '—'}</div>
            <div><strong>Mode de focus :</strong> {state.latestPMP?.focus_mode || '—'}</div>
            <div><strong>Points forts :</strong> {state.latestPMP?.strong_points || '—'}</div>
            <div><strong>Points de vigilance :</strong> {state.latestPMP?.vigilance_points || '—'}</div>
          </div>
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
        <SectionCard title="Lecture psycho-émotionnelle">
          <div style={{ display: 'grid', gap: 12, color: '#44516d', lineHeight: 1.7 }}>
            <div><strong>Profil :</strong> {state.latestPsycho?.profile_label || '—'}</div>
            <div><strong>Stress :</strong> {psychoStress !== null ? `${psychoStress}/100` : '—'}</div>
            <div><strong>Confiance émotionnelle :</strong> {psychoConfidence !== null ? `${psychoConfidence}/100` : '—'}</div>
            <div><strong>Contrôle émotionnel :</strong> {psychoControl !== null ? `${psychoControl}/100` : '—'}</div>
            <div><strong>Facteur peur :</strong> {psychoFear !== null ? `${psychoFear}/100` : '—'}</div>
            <div><strong>Blocages :</strong> {state.latestPsycho?.blockages || '—'}</div>
          </div>
        </SectionCard>

        <SectionCard title="Axes coach A4P">
          <BulletList items={coachAxes} />
        </SectionCard>
      </section>
    </main>
  )
}
