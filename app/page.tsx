import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '32px 20px 56px',
        color: '#1f3158',
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
        }}
      >
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 30,
            padding: '34px 26px',
            boxShadow: '0 20px 54px rgba(31, 49, 88, 0.16)',
            color: '#ffffff',
            marginBottom: 28,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <img
              src="/logo-a4p.png"
              alt="Académie de Performances"
              style={{
                width: '100%',
                maxWidth: 440,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))',
              }}
            />

            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                opacity: 0.82,
              }}
            >
              Plateforme A4P
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(34px, 7vw, 56px)',
                lineHeight: 1.02,
                fontWeight: 900,
              }}
            >
              Choisissez votre accès
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 720,
                fontSize: 'clamp(18px, 2.7vw, 22px)',
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              Deux accès simples : individuel ou club.
            </p>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          <Link
            href="/individuel"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <article
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: 30,
                minHeight: 300,
                boxShadow: '0 14px 36px rgba(31, 49, 88, 0.10)',
                border: '1px solid #dbe4f2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: '#eef3fb',
                    marginBottom: 22,
                  }}
                />

                <h2
                  style={{
                    margin: '0 0 14px 0',
                    fontSize: 34,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: '#1f3158',
                  }}
                >
                  Accès individuel
                </h2>

                <p
                  style={{
                    margin: '0 0 18px 0',
                    fontSize: 17,
                    lineHeight: 1.7,
                    color: '#5d6d89',
                  }}
                >
                  Accédez à vos tests, vos résultats et à votre suivi personnel.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    color: '#62728d',
                    fontSize: 15,
                    lineHeight: 1.9,
                  }}
                >
                  <li>Passer les tests</li>
                  <li>Consulter ses résultats</li>
                  <li>Suivre sa progression</li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: 28,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: '#1f3158',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 16,
                  width: 'fit-content',
                }}
              >
                Accéder
                <span aria-hidden="true">→</span>
              </div>
            </article>
          </Link>

          <Link
            href="/club"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <article
              style={{
                background: '#ffffff',
                borderRadius: 24,
                padding: 30,
                minHeight: 300,
                boxShadow: '0 14px 36px rgba(31, 49, 88, 0.10)',
                border: '1px solid #dbe4f2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: '#eef3fb',
                    marginBottom: 22,
                  }}
                />

                <h2
                  style={{
                    margin: '0 0 14px 0',
                    fontSize: 34,
                    lineHeight: 1.05,
                    fontWeight: 900,
                    color: '#1f3158',
                  }}
                >
                  Accès club
                </h2>

                <p
                  style={{
                    margin: '0 0 18px 0',
                    fontSize: 17,
                    lineHeight: 1.7,
                    color: '#5d6d89',
                  }}
                >
                  Pilotez vos équipes, analysez les profils et prenez des
                  décisions concrètes.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    color: '#62728d',
                    fontSize: 15,
                    lineHeight: 1.9,
                  }}
                >
                  <li>Voir les équipes</li>
                  <li>Analyser les profils</li>
                  <li>Piloter le collectif</li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: 28,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: '#1f3158',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 16,
                  width: 'fit-content',
                }}
              >
                Accéder
                <span aria-hidden="true">→</span>
              </div>
            </article>
          </Link>
        </section>
      </div>
    </main>
  )
}
