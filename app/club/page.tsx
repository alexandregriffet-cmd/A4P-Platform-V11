'use client'

import { useSearchParams } from 'next/navigation'

export default function ClubPage() {
  const params = useSearchParams()
  const role = params.get('as') || 'guest'

  return (
    <main style={{ padding: 24 }}>
      <h1>TEST PORTAIL CLUB A4P</h1>
      <p>Rôle lu dans l’URL : {role}</p>

      {role === 'a4p_admin' && <p>Vue ADMIN A4P OK</p>}
      {role === 'club_admin' && <p>Vue ADMIN CLUB OK</p>}
      {role === 'coach' && <p>Vue COACH OK</p>}
      {role === 'player' && <p>Vue JOUEUR OK</p>}
      {role === 'guest' && <p>Aucun rôle fourni</p>}
    </main>
  )
}
