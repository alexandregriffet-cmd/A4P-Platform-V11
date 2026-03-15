'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CreatePlayerPage() {
  const [teamId, setTeamId] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [position, setPosition] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('players').insert({
      team_id: teamId,
      firstname,
      lastname,
      position,
      first_name: firstname,
      last_name: lastname
    })
    if (error) return alert(error.message)
    router.push(`/teams/${teamId}`)
  }

  return (
    <main className="page">
      <h1>Ajouter un joueur</h1>
      <form onSubmit={handleSubmit} className="form">
        <input value={teamId} onChange={(e)=>setTeamId(e.target.value)} placeholder="ID équipe" required />
        <input value={firstname} onChange={(e)=>setFirstname(e.target.value)} placeholder="Prénom" required />
        <input value={lastname} onChange={(e)=>setLastname(e.target.value)} placeholder="Nom" required />
        <input value={position} onChange={(e)=>setPosition(e.target.value)} placeholder="Poste" />
        <button type="submit">Ajouter</button>
      </form>
    </main>
  )
}
