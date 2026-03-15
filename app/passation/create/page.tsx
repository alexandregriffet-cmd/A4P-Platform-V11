'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

function randomToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function CreatePassationPage() {
  const [clubId, setClubId] = useState('')
  const [teamId, setTeamId] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = randomToken()
    const { error } = await supabase.from('passations').insert({
      club_id: clubId,
      team_id: teamId,
      module: 'CMP',
      token,
      status: 'active'
    })
    if (error) return alert(error.message)
    router.push(`/passations/${token}`)
  }

  return (
    <main className="page">
      <h1>Créer une passation CMP</h1>
      <form onSubmit={handleSubmit} className="form">
        <input value={clubId} onChange={(e)=>setClubId(e.target.value)} placeholder="ID club" required />
        <input value={teamId} onChange={(e)=>setTeamId(e.target.value)} placeholder="ID équipe" required />
        <button type="submit">Générer le lien</button>
      </form>
    </main>
  )
}
