'use client'

import { useEffect, useState } from 'react'
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
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return Math.round(n)
  }
  return null
}

function getPlayerName(player: Player | null) {
  if (!player) return 'Joueur'
  const fullName = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return fullName || 'Sportif sans nom'
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

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/club">← Retour club</Link>
      </div>

      <h1 style={{ margin: 0 }}>{getPlayerName(state.player)}</h1>
      <p style={{ color: '#667085' }}>{state.player.email || 'Email non renseigné'}</p>

      {!state.result ? (
        <section
          style={{
            marginTop: 24,
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
        <section
          style={{
            marginTop: 24,
            padding: 24,
            borderRadius: 20,
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
          }}
        >
          <h2 style={{ marginTop: 0 }}>Dernier résultat CMP</h2>
          <p><strong>Score global :</strong> {score !== null ? `${score}/100` : '—'}</p>
          <p><strong>Profil :</strong> {state.result.profile_label || state.result.profile_code || '—'}</p>
          <p><strong>Date :</strong> {formatDate(state.result.created_at)}</p>
        </section>
      )}
    </main>
  )
}
