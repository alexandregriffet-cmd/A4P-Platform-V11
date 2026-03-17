import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #eef2f8 0%, #e7edf6 50%, #eef2f8 100%)',
        padding: '32px 20px 48px',
        color: '#1f3158',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <section
          style={{
            background:
              'linear-gradient(135deg, #1f3158 0%, #243d70 55%, #2c4c89 100%)',
            borderRadius: 28,
            padding: '28px 24px',
            boxShadow: '0 18px 50px rgba(20, 40, 80, 0.18)',
            color: '#ffffff',
            marginBottom: 28,
            overflow: 'hidden',
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
            <img
              src="/logo-a4p.png"
              alt="Académie de Performances"
              style={{
                width: '100%',
                maxWidth: 300,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />

            <div style={{ maxWidth: 720 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1.1,
                  textTransform: 'uppercase',
                  opacity: 0.82,
                  marginBottom: 8,
                }}
              >
                Plateforme A4P
              </div>

              <h1
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 'clamp(34px, 6vw, 56px)',
                  lineHeight: 1.02,
                  fontWeight: 900,
                }}
              >
                Choisissez votre accès
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(17px, 2.5vw, 22px)',
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.92)',
                  maxWidth: 760,
                }}
              >
                Une entrée simple pour vos clients : un parcours individuel pour
                les sportifs et un parcours club pour les coachs, dirigeants et
                staffs.
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 28,
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
                minHeight: 280,
                boxShadow: '0 14px 36px rgba(31, 49, 88, 0.10)',
                border: '1px solid #dbe4f2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: '#eef3fb',
                    color: '#1f3158',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 20,
                  }}
                >
                  🧍
                </div>

                <h2
                  style={{
                    margin: '0 0 10px 0',
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
                    margin: '0 0 16px 0',
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: '#56657f',
                  }}
                >
                  Pour le sportif, le parent ou l’utilisateur individuel.
                  Accédez au parcours personnel, aux tests et aux résultats.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#5f6f8d',
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  <li>Passer les tests</li>
                  <li>Consulter ses résultats</li>
                  <li>Retrouver son historique</li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: 26,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 18px',
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
                minHeight: 280,
                boxShadow: '0 14px 36px rgba(31, 49, 88, 0.10)',
                border: '1px solid #dbe4f2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: '#eef3fb',
                    color: '#1f3158',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginBottom: 20,
                  }}
                >
                  🏉
                </div>

                <h2
                  style={{
                    margin: '0 0 10px 0',
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
                    margin: '0 0 16px 0',
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: '#56657f',
                  }}
                >
                  Pour les dirigeants, coachs et staffs. Consultez les joueurs,
                  les équipes, les synthèses et les dashboards du club.
                </p>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#5f6f8d',
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  <li>Voir les équipes</li>
                  <li>Analyser les profils</li>
                  <li>Piloter le collectif</li>
                </ul>
              </div>

              <div
                style={{
                  marginTop: 26,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 18px',
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

        <section
          style={{
            background: '#ffffff',
            borderRadius: 22,
            padding: 24,
            boxShadow: '0 12px 30px rgba(31, 49, 88, 0.08)',
            border: '1px solid #dbe4f2',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              fontSize: 24,
              fontWeight: 900,
              color: '#1f3158',
            }}
          >
            Ce que permet la plateforme A4P
          </h3>

          <p
            style={{
              margin: '0 0 18px 0',
              color: '#5d6d89',
              lineHeight: 1.7,
              fontSize: 16,
            }}
          >
            La plateforme centralise les diagnostics mentaux, les lectures
            individuelles, les synthèses collectives et les dashboards club dans
            une interface simple, claire et exploitable.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <div
              style={{
                background: '#f7f9fd',
                borderRadius: 18,
                padding: 18,
                border: '1px solid #e2e8f4',
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 8,
                  color: '#1f3158',
                }}
              >
                Diagnostics
              </div>
              <div
                style={{
                  color: '#61718d',
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                CMP, PMP et lecture psycho-émotionnelle regroupés dans un
                parcours structuré.
              </div>
            </div>

            <div
              style={{
                background: '#f7f9fd',
                borderRadius: 18,
                padding: 18,
                border: '1px solid #e2e8f4',
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 8,
                  color: '#1f3158',
                }}
              >
                Lecture coach
              </div>
              <div
                style={{
                  color: '#61718d',
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                Des synthèses compréhensibles pour agir vite avec les joueurs et
                les équipes.
              </div>
            </div>

            <div
              style={{
                background: '#f7f9fd',
                borderRadius: 18,
                padding: 18,
                border: '1px solid #e2e8f4',
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 8,
                  color: '#1f3158',
                }}
              >
                Pilotage club
              </div>
              <div
                style={{
                  color: '#61718d',
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                Une vision d’ensemble pour repérer les points forts, les
                fragilités et les priorités d’accompagnement.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
