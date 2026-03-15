'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function CreateTeamPage() {
  const router = useRouter()
  const [clubId, setClubId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [season, setSeason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('teams')
      .insert({
        club_id: clubId || null,
        name: teamName,
        team_name: teamName,
        season: season || null
      })
      .select('id, team_name')
      .single()

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Équipe créée')
    router.push(`/players/create?teamId=${data.id}`)
  }

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
      <h1>Créer une équipe</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          placeholder="ID club (optionnel)"
        />
        <input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nom équipe"
          required
        />
        <input
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          placeholder="Saison (ex. 2025-2026)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Création…' : 'Créer équipe'}
        </button>
      </form>
    </main>
  )
}
