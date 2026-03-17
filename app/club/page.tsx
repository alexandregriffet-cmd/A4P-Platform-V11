'use client'

import { useSearchParams } from 'next/navigation'

export default function ClubPage() {
  const params = useSearchParams()
  const role = params.get('as') || 'guest'

  return (
    <div style={{ padding: 30 }}>
      <h1>Portail Club A4P</h1>

      <p><strong>Rôle détecté :</strong> {role}</p>

      {role === 'a4p_admin' && (
        <div>
          <h2>Vue ADMIN A4P</h2>
          <p>Accès complet : clubs, équipes, joueurs, données</p>
        </div>
      )}

      {role === 'club_admin' && (
        <div>
          <h2>Vue ADMIN CLUB</h2>
          <p>Accès au club + équipes + joueurs</p>
        </div>
      )}

      {role === 'coach' && (
        <div>
          <h2>Vue COACH</h2>
          <p>Accès à son équipe + joueurs</p>
        </div>
      )}

      {role === 'player' && (
        <div>
          <h2>Vue JOUEUR</h2>
          <p>Accès uniquement à ses résultats</p>
        </div>
      )}

      {role === 'guest' && (
        <div>
          <h2>Accès invité</h2>
          <p>Ajoute ?as=role dans l’URL</p>
        </div>
      )}
    </div>
  )
}
