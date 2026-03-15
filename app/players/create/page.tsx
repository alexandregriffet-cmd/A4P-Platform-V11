'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function CreatePlayerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [position, setPosition] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('players')
      .insert({
        team_id: teamId || null,
        firstname,
        lastname,
        email: email || null,
        position: position || null
      })
      .select('id, firstname, lastname')
      .single()

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Joueur créé')

    const params = new URLSearchParams()
    params.set('playerId', data.id)
    if (teamId) params.set('teamId', teamId)

    router.push(`/passations/create?${params.toString()}`)
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
      <h1>Créer un joueur</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="ID équipe (optionnel)"
        />
        <input
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          placeholder="Prénom"
          required
        />
        <input
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          placeholder="Nom"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Poste"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Création…' : 'Créer joueur'}
        </button>
      </form>
    </main>
  )
}

export default function CreatePlayerPage() {
  return (
    <Suspense fallback={<main style={{ padding: 20 }}>Chargement…</main>}>
      <CreatePlayerInner />
    </Suspense>
  )
}
