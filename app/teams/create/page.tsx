'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('')
  const [sport, setSport] = useState('Rugby')
  const [category, setCategory] = useState('U18')
  const [clubId, setClubId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('teams').insert({ club_id: clubId, team_name: teamName, sport, category })
    setLoading(false)
    if (error) return alert(error.message)
    router.push('/teams')
  }

  return (
    <main className="page">
      <h1>Créer une équipe</h1>
      <form onSubmit={handleSubmit} className="form">
        <input placeholder="ID du club" value={clubId} onChange={(e)=>setClubId(e.target.value)} required />
        <input placeholder="Nom de l’équipe" value={teamName} onChange={(e)=>setTeamName(e.target.value)} required />
        <input placeholder="Sport" value={sport} onChange={(e)=>setSport(e.target.value)} required />
        <input placeholder="Catégorie" value={category} onChange={(e)=>setCategory(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer l’équipe'}</button>
      </form>
    </main>
  )
}
