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
}

type Result = {
  score_global?: number | null
  profile_label?: string | null
  profile_code?: string | null
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

function coachInsight(result: Result | null, radar: Radar | null) {
  if (!result) return "Aucune donnée exploitable pour le moment."

  if (radar) {
    const ordered = [
      { key: 'confiance', value: radar.confiance },
      { key: 'régulation', value: radar.regulation },
      { key: 'engagement', value: radar.engagement },
      { key: 'stabilité', value: radar.stabilite }
    ].sort((a, b) => b.value - a.value)

    const top = ordered[0].key

    return `Le levier mental dominant est la ${top}. Le travail du coach doit s'appuyer sur ce point fort pour stabiliser la performance dans les moments clés.`
  }

  if (result.score_global && result.score_global < 45) {
    return "Le joueur nécessite un cadre mental sécurisant avec des routines simples et répétées."
  }

  if (result.score_global && result.score_global < 65) {
    return "Le joueur possède une base intéressante mais encore irrégulière. L'enjeu est la stabilisation."
  }

  return "Le joueur présente une base mentale solide. Travail d'optimisation et de constance recommandé."
}

function axesProgression(radar: Radar | null) {
  if (!radar) {
    return [
      "Mettre en place des routines mentales",
      "Renforcer la concentration",
      "Stabiliser la confiance"
    ]
  }

  return [
    { key: 'confiance', value: radar.confiance, text: "Renforcer la confiance par des repères de réussite" },
    { key: 'regulation', value: radar.regulation, text: "Améliorer la régulation émotionnelle" },
    { key: 'engagement', value: radar.engagement, text: "Clarifier l'intention et l'engagement" },
    { key: 'stabilite', value: radar.stabilite, text: "Développer la stabilité sous pression" }
  ]
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map(a => a.text)
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
        const { data: p } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single()

        const { data: r } = await supabase
          .from('cmp_results')
          .select('*')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(1)

        setPlayer(p)
        setResult(r?.[0] || null)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (playerId) load()
  }, [playerId])

  const radar = useMemo(() => extractRadar(result), [result])

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>
  if (error) return <div style={{ padding: 20 }}>{error}</div>
  if (!player) return <div style={{ padding: 20 }}>Joueur introuvable</div>

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>

      <Link href="/club">← Retour</Link>

      <h1 style={{ fontSize: 42 }}>
        {player.firstname} {player.lastname}
      </h1>

      <p style={{ opacity: 0.7 }}>{player.email}</p>

      <section style={{ marginTop: 30 }}>
        <h2>Score global</h2>
        <div style={{ fontSize: 36, fontWeight: 800 }}>
          {result?.score_global ? `${result.score_global}/100` : '—'}
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Profil mental</h2>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {result?.profile_label || result?.profile_code || '—'}
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Analyse coach</h2>
        <p style={{ lineHeight: 1.7 }}>
          {coachInsight(result, radar)}
        </p>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Axes de progression</h2>
        <ul>
          {axesProgression(radar).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>Radar mental</h2>

        {!radar && <p>Aucune donnée</p>}

        {radar && (
          <ul>
            <li>Confiance : {radar.confiance}</li>
            <li>Régulation : {radar.regulation}</li>
            <li>Engagement : {radar.engagement}</li>
            <li>Stabilité : {radar.stabilite}</li>
          </ul>
        )}
      </section>

    </main>
  )
}
