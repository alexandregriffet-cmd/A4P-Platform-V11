'use client'

import { useState } from 'react'

export default function CMPForm() {
  const [status, setStatus] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('Envoi en cours…')

    const formData = new FormData(e.currentTarget)
    const payload = {
      firstname: String(formData.get('firstname') || ''),
      lastname: String(formData.get('lastname') || ''),
      email: String(formData.get('email') || ''),
      club_name: String(formData.get('club_name') || ''),
      team_name: String(formData.get('team_name') || ''),
      module: 'CMP',
      score_global: Number(formData.get('score_global') || 0),
      profile_name: String(formData.get('profile_name') || ''),
      dimensions: {
        confiance: Number(formData.get('confiance') || 0),
        focus: Number(formData.get('focus') || 0),
        motivation: Number(formData.get('motivation') || 0),
        regulation: Number(formData.get('regulation') || 0)
      }
    }

    try {
      const res = await fetch('/api/results/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('submit_failed')
      setStatus('Résultat CMP enregistré.')
    } catch {
      setStatus('Erreur lors de l’enregistrement.')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
      <input name="firstname" placeholder="Prénom" />
      <input name="lastname" placeholder="Nom" />
      <input name="email" placeholder="Email" />
      <input name="club_name" placeholder="Club" />
      <input name="team_name" placeholder="Équipe" />
      <input name="score_global" type="number" placeholder="Score global" />
      <input name="profile_name" placeholder="Profil" />
      <input name="confiance" type="number" placeholder="Confiance" />
      <input name="focus" type="number" placeholder="Focus" />
      <input name="motivation" type="number" placeholder="Motivation" />
      <input name="regulation" type="number" placeholder="Régulation" />
      <button type="submit">Enregistrer</button>
      {status ? <p>{status}</p> : null}
    </form>
  )
}
