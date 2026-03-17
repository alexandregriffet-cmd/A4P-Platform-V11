import Link from 'next/link'

export default function ConnexionPage() {
  return (
    <main
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 24,
        background: '#eef2f7',
        minHeight: '100vh'
      }}
    >
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 30,
          padding: 32,
          boxShadow: '0 18px 48px rgba(18, 35, 66, 0.08)'
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#7180a0',
            marginBottom: 12
          }}
        >
          Connexion A4P
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 52,
            lineHeight: 1.05,
            color: '#182847'
          }}
        >
          Choisir votre accès
        </h1>

        <p
          style={{
            margin: '18px 0 0 0',
            fontSize: 22,
            lineHeight: 1.7,
            color: '#5f6f8e',
            maxWidth: 900
          }}
        >
          Cette page centralise les différents points d’entrée de la plateforme A4P.
          Choisissez l’espace correspondant à votre rôle.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginTop: 28
          }}
        >
          <Link
            href="/admin"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #2f4d85 0%, #4168b0 100%)',
              color: '#ffffff',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 14px 30px rgba(47,77,133,0.22)',
              display: 'block'
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>
              Admin A4P
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.65, opacity: 0.95 }}>
              Accès complet à la supervision, aux clubs, aux passations et aux résultats.
            </div>
          </Link>

          <Link
            href="/club"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #dde5f0',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 24px rgba(21,37,69,0.05)',
              display: 'block',
              color: '#182847'
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>
              Portail club
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.65, color: '#5f6f8e' }}>
              Accès sécurisé au club, aux équipes, aux joueurs et aux résultats autorisés.
            </div>
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: 'none',
              background: '#ffffff',
              border: '1px solid #dde5f0',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 24px rgba(21,37,69,0.05)',
              display: 'block',
              color: '#182847'
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>
              Accueil plateforme
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.65, color: '#5f6f8e' }}>
              Retour vers la page d’entrée générale de la plateforme A4P.
            </div>
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 28
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              padding: '14px 18px',
              borderRadius: 16,
              border: '1px solid #d9e3f0',
              background: '#ffffff',
              color: '#223461',
              fontWeight: 800
            }}
          >
            Retour accueil
          </Link>

          <Link
            href="/admin/clubs"
            style={{
              textDecoration: 'none',
              padding: '14px 18px',
              borderRadius: 16,
              border: '1px solid #d9e3f0',
              background: '#ffffff',
              color: '#223461',
              fontWeight: 800
            }}
          >
            Gérer les clubs
          </Link>
        </div>
      </section>
    </main>
  )
}
