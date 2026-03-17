'use client'

import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()

  const playerId = Array.isArray(params?.playerId)
    ? params.playerId[0]
    : params?.playerId || ''

  return (
    <main style={{ padding: 24 }}>
      <h1>TEST ROUTE JOUEUR</h1>
      <p>playerId lu par la page :</p>
      <pre>{String(playerId)}</pre>
    </main>
  )
}
