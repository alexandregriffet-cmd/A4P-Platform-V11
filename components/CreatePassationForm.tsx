'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function randomToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function CreatePassationForm({ teamIdDefault = '', previewToken = '' }: { teamIdDefault?: string; previewToken?: string }) {
  const [clubId, setClubId] = useState('')
  const [teamId, setTeamId] = useState(teamIdDefault)
  const [generated, setGenerated] = useState(previewToken)

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
    setGenerated(token)
  }

  const playerUrl = generated ? `${window.location.origin}/passation/${generated}` : ''

  return (
    <div className="split">
      <form onSubmit={handleSubmit} className="form card">
        <h2>Créer une passation CMP</h2>
        <input placeholder="ID club" value={clubId} onChange={(e) => setClubId(e.target.value)} required />
        <input placeholder="ID équipe" value={teamId} onChange={(e) => setTeamId(e.target.value)} required />
        <button className="btn" type="submit">Générer le lien</button>
      </form>

      <div className="card">
        <h2>Lien joueur</h2>
        {generated ? <pre className="codebox">{playerUrl}</pre> : <p className="small">Le lien s’affichera ici après création.</p>}
      </div>
    </div>
  )
}
