import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '32px 20px 48px',
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
            borderRadius: 28,
            padding: '28px 24px',
            boxShadow: '0 18px 48px rgba(31, 49, 88, 0.16)',
            color: '#ffffff',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.2,
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
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              Une entrée simple pour vos clients : un parcours individuel pour
              les sportifs et un parcours club pour les coachs, dirigeants et
              staffs.
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
                padding: 28,
                minHeight: 330,
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
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: '#eef3fb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 22,
                  }}
                >
                  🧍
                </div>

                <h2
                  style={{
                    margin: '0 0 12px 0',
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
                  Pour le sportif, le parent ou l’utilisateur individuel.
                  Accédez au parcours personnel, aux tests et aux résultats.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 22,
                    color: '#62728d',
                    fontSize: 15,
                    lineHeight: 1.9,
                  }}
                >
                  <li>Passer les tests</li>
                  <li>Consulter ses résultats</li>
                  <li>Retrouver son historique</li>
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
                padding: 28,
                minHeight: 330,
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
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: '#eef3fb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 22,
                  }}
                >
                  🏉
                </div>

                <h2
                  style={{
                    margin: '0 0 12px 0',
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
                  Pour les dirigeants, coachs et staffs. Consultez les joueurs,
                  les équipes, les synthèses et les dashboards du club.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 22,
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

        <div
          style={{
            marginTop: 26,
            textAlign: 'center',
            color: '#61718d',
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          Une plateforme simple pour comprendre et piloter le mental des
          joueurs et des équipes.
        </div>
      </div>
    </main>
  )
}
