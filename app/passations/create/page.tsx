'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function makeToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function CreatePassationInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [playerId, setPlayerId] = useState(searchParams.get('playerId') || '')
  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '')
  const [clubId, setClubId] = useState('')
  const [moduleName, setModuleName] = useState('CMP')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const token = makeToken()

    const { error } = await supabase
      .from('passations')
      .insert({
        player_id: playerId || null,
        team_id: teamId || null,
        club_id: clubId || null,
        module: moduleName,
        token,
        status: 'pending'
      })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push(`/passations/${token}`)
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
      <h1>Créer une passation</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          placeholder="ID joueur"
        />
        <input
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="ID équipe"
        />
        <input
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          placeholder="ID club (optionnel)"
        />
        <select value={moduleName} onChange={(e) => setModuleName(e.target.value)}>
          <option value="CMP">CMP</option>
          <option value="PMP">PMP</option>
          <option value="PSYCHO">PSYCHO</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Génération…' : 'Créer passation'}
        </button>
      </form>
    </main>
  )
}

export default function CreatePassationPage() {
  return (
    <Suspense fallback={<main style={{ padding: 20 }}>Chargement…</main>}>
      <CreatePassationInner />
    </Suspense>
  )
}
