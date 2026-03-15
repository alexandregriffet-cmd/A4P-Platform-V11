'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Suspense } from 'react'

function CreatePlayerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamIdFromUrl = searchParams.get('teamId') || ''
  const [teamId, setTeamId] = useState(teamIdFromUrl)
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
        first_name: firstname,
        last_name: lastname,
        email: email || null,
        position: position || null
      })
      .select()
      .single()

    setLoading(false)
    if (error) return alert(error.message)
    alert('Joueur créé')
    if (data?.id) {
      router.push(`/passations/create?playerId=${data.id}&teamId=${teamId}`)
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
      <h1>Créer un joueur</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="ID équipe" required />
        <input value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Prénom" required />
        <input value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Nom" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Poste" />
        <button type="submit" disabled={loading}>{loading ? 'Création…' : 'Créer joueur'}</button>
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
