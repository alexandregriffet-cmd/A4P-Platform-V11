import Link from 'next/link'

type SearchParamsInput = {
  as?: string | string[]
}

export default function ClubPage({
  searchParams
}: {
  searchParams?: SearchParamsInput
}) {
  const rawRole = searchParams?.as
  const role = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'guest'

  return (
    <main style={{ padding: 24 }}>
      <h1>TEST PORTAIL CLUB A4P</h1>
      <p>
        <strong>Rôle lu dans l’URL :</strong> {role}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        <Link href="/club?as=a4p_admin">Vue Admin A4P</Link>
        <Link href="/club?as=club_admin">Vue Admin club</Link>
        <Link href="/club?as=coach">Vue Coach</Link>
        <Link href="/club?as=player">Vue Joueur</Link>
      </div>

      {role === 'a4p_admin' && (
        <div>
          <h2>Vue ADMIN A4P OK</h2>
          <p>Accès complet : clubs, équipes, joueurs, données.</p>
        </div>
      )}

      {role === 'club_admin' && (
        <div>
          <h2>Vue ADMIN CLUB OK</h2>
          <p>Accès au club, aux équipes et aux joueurs du club.</p>
        </div>
      )}

      {role === 'coach' && (
        <div>
          <h2>Vue COACH OK</h2>
          <p>Accès à son équipe et à ses joueurs.</p>
        </div>
      )}

      {role === 'player' && (
        <div>
          <h2>Vue JOUEUR OK</h2>
          <p>Accès uniquement à ses résultats personnels.</p>
        </div>
      )}

      {role === 'guest' && (
        <div>
          <h2>Accès invité</h2>
          <p>Ajoute <code>?as=role</code> dans l’URL.</p>
        </div>
      )}
    </main>
  )
}
