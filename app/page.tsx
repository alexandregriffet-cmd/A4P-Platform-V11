import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '24px 18px 48px',
        color: '#1f3158',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* HEADER */}
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 24,
            padding: '22px 18px 26px',
            boxShadow: '0 18px 48px rgba(31,49,88,0.14)',
            color: '#ffffff',
            marginBottom: 22,
            textAlign: 'center',
          }}
        >
          {/* LOGO LIGHT */}
          <img
            src="/logo-a4p.png"
            alt="A4P"
            style={{
              width: 180,
              margin: '0 auto 12px',
              display: 'block',
              opacity: 0.95,
            }}
          />

          <div
            style={{
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              opacity: 0.7,
              marginBottom: 6,
            }}
          >
            Plateforme A4P
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Choisissez votre accès
          </h1>

          <p
            style={{
              marginTop: 8,
              fontSize: 16,
              opacity: 0.85,
            }}
          >
            Individuel ou club
          </p>
        </section>

        {/* CARTES */}
        <section style={{ display: 'grid', gap: 18 }}>

          {/* INDIVIDUEL */}
          <Link href="/individuel" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
                border: '1px solid #e3eaf5',
              }}
            >
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
                Accès individuel
              </h2>

              <p style={{ color: '#5d6d89', marginBottom: 12 }}>
                Tests, résultats et progression personnelle.
              </p>

              <ul style={{ paddingLeft: 18, color: '#6b7a95' }}>
                <li>Passer les tests</li>
                <li>Consulter ses résultats</li>
                <li>Suivre sa progression</li>
              </ul>

              <div
                style={{
                  marginTop: 16,
                  background: '#1f3158',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: 10,
                  display: 'inline-block',
                  fontWeight: 700,
                }}
              >
                Accéder →
              </div>
            </div>
          </Link>

          {/* CLUB */}
          <Link href="/club" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
                border: '1px solid #e3eaf5',
              }}
            >
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
                Accès club
              </h2>

              <p style={{ color: '#5d6d89', marginBottom: 12 }}>
                Analyse et pilotage des équipes.
              </p>

              <ul style={{ paddingLeft: 18, color: '#6b7a95' }}>
                <li>Voir les équipes</li>
                <li>Analyser les profils</li>
                <li>Piloter le collectif</li>
              </ul>

              <div
                style={{
                  marginTop: 16,
                  background: '#1f3158',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: 10,
                  display: 'inline-block',
                  fontWeight: 700,
                }}
              >
                Accéder →
              </div>
            </div>
          </Link>

        </section>
      </div>
    </main>
  )
}
