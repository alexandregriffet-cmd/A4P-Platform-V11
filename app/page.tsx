import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '28px 20px 48px',
        color: '#1f3158',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        
        {/* HEADER */}
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 26,
            padding: '28px 20px',
            boxShadow: '0 18px 48px rgba(31,49,88,0.16)',
            color: '#ffffff',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {/* LOGO CLEAN */}
          <img
            src="/logo-a4p.png"
            alt="A4P"
            style={{
              width: '100%',
              maxWidth: 260,
              margin: '0 auto 18px',
              display: 'block',
              objectFit: 'contain',
              opacity: 0.95,
            }}
          />

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              opacity: 0.75,
              marginBottom: 8,
            }}
          >
            Plateforme A4P
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(28px, 6vw, 42px)',
              lineHeight: 1.1,
              fontWeight: 900,
            }}
          >
            Choisissez votre accès
          </h1>

          <p
            style={{
              marginTop: 10,
              fontSize: 18,
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            Individuel ou club.
          </p>
        </section>

        {/* CARTES */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 20,
          }}
        >
          {/* INDIVIDUEL */}
          <Link href="/individuel" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 22,
                padding: 26,
                boxShadow: '0 12px 32px rgba(31,49,88,0.08)',
                border: '1px solid #e3eaf5',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#1f3158',
                }}
              >
                Accès individuel
              </h2>

              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 16,
                  color: '#5d6d89',
                  lineHeight: 1.6,
                }}
              >
                Accédez à vos tests, résultats et progression personnelle.
              </p>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 14,
                  color: '#6b7a95',
                  lineHeight: 1.8,
                }}
              >
                <li>Passer les tests</li>
                <li>Consulter ses résultats</li>
                <li>Suivre sa progression</li>
              </ul>

              <div
                style={{
                  marginTop: 20,
                  display: 'inline-block',
                  background: '#1f3158',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 12,
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
                borderRadius: 22,
                padding: 26,
                boxShadow: '0 12px 32px rgba(31,49,88,0.08)',
                border: '1px solid #e3eaf5',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#1f3158',
                }}
              >
                Accès club
              </h2>

              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 16,
                  color: '#5d6d89',
                  lineHeight: 1.6,
                }}
              >
                Analysez vos équipes et pilotez la performance mentale.
              </p>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 14,
                  color: '#6b7a95',
                  lineHeight: 1.8,
                }}
              >
                <li>Voir les équipes</li>
                <li>Analyser les profils</li>
                <li>Piloter le collectif</li>
              </ul>

              <div
                style={{
                  marginTop: 20,
                  display: 'inline-block',
                  background: '#1f3158',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: 12,
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
