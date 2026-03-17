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
}

type Result = {
  token?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | null
  created_at?: string | null
  confiance?: number
  regulation?: number
  engagement?: number
  stabilite?: number
  [key: string]: any
}

type Radar = {
  confiance: number
  regulation: number
  engagement: number
  stabilite: number
}

function normalize(v: any): number | null {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function extractRadar(r: Result | null): Radar | null {
  if (!r) return null

  const c = normalize(r.confiance)
  const reg = normalize(r.regulation)
  const e = normalize(r.engagement)
  const s = normalize(r.stabilite)

  if ([c, reg, e, s].every(v => v === null)) return null

  return {
    confiance: c ?? 0,
    regulation: reg ?? 0,
    engagement: e ?? 0,
    stabilite: s ?? 0
  }
}

export default function Page() {
  const params = useParams()
  const playerId = params?.playerId as string

  const [player, setPlayer] = useState<Player | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data: p, error: pe } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single()

        if (pe) throw pe

        const { data: r, error: re } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (re) throw re

        setPlayer(p)
        setResult(r?.[0] ?? null)

      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (playerId) load()
  }, [playerId])

  const radar = useMemo(() => extractRadar(result), [result])

  const ordered = radar
    ? [
        { key: 'confiance', value: radar.confiance },
        { key: 'regulation', value: radar.regulation },
        { key: 'engagement', value: radar.engagement },
        { key: 'stabilite', value: radar.stabilite }
      ].sort((a, b) => b.value - a.value)
    : []

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>
  if (error) return <div style={{ padding: 20 }}>{error}</div>
  if (!player) return <div style={{ padding: 20 }}>Joueur introuvable</div>

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>

      <Link href="/club">← Retour</Link>

      <h1 style={{ marginTop: 20 }}>
        {player.firstname} {player.lastname}
      </h1>

      <p>Email : {player.email || '—'}</p>

      <hr />

      <h2>Résultat CMP</h2>

      <p>
        Score :
        {' '}
        {typeof result?.score_global === 'number'
          ? `${result.score_global}/100`
          : '—'}
      </p>

      <p>
        Profil :
        {' '}
        {result?.profile_label || result?.profile_code || '—'}
      </p>

      <hr />

      <h2>Radar mental</h2>

      {!radar && <p>Aucune donnée</p>}

      {radar && (
        <ul>
          {ordered.map(item => (
            <li key={item.key}>
              {item.key} : {item.value}
            </li>
          ))}
        </ul>
      )}

    </main>
  )
}
