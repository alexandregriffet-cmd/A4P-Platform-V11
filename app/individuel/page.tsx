import Link from 'next/link'

export default function IndividuelPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '24px 18px 48px',
        color: '#1f3158',
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
        }}
      >
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 26,
            padding: '24px 20px 28px',
            boxShadow: '0 18px 48px rgba(31,49,88,0.14)',
            color: '#ffffff',
            marginBottom: 22,
            textAlign: 'center',
          }}
        >
          <img
            src="/logo-a4p.png"
            alt="A4P"
            style={{
              width: 130,
              margin: '0 auto 12px',
              display: 'block',
            }}
          />

          <div
            style={{
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              opacity: 0.72,
              marginBottom: 6,
            }}
          >
            Parcours individuel A4P
          </div>

          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(30px, 6vw, 46px)',
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Diagnostic complet
            <br />
            de performance mentale
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: 720,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            L’accès aux tests individuels est personnel, sécurisé et contrôlé.
            Une connexion est nécessaire avant toute passation.
          </p>

          <div
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            🔒 Accès personnel sécurisé
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gap: 18,
            marginBottom: 22,
          }}
        >
          <article
            style={{
              background: '#ffffff',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
              border: '1px solid #e3eaf5',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: '#6d7b95',
                marginBottom: 8,
              }}
            >
              Étape 1
            </div>

            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: 28,
                fontWeight: 900,
                color: '#1f3158',
              }}
            >
              PMP
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: '#5d6d89',
              }}
            >
              Comprendre votre mode de fonctionnement mental, votre façon de
              décider, d’anticiper et d’entrer dans l’action.
            </p>
          </article>

          <article
            style={{
              background: '#ffffff',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
              border: '1px solid #e3eaf5',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: '#6d7b95',
                marginBottom: 8,
              }}
            >
              Étape 2
            </div>

            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: 28,
                fontWeight: 900,
                color: '#1f3158',
              }}
            >
              Psycho-émotionnel
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: '#5d6d89',
              }}
            >
              Identifier votre manière de réagir sous pression, votre stabilité
              émotionnelle, vos tensions et vos points de vigilance.
            </p>
          </article>

          <article
            style={{
              background: '#ffffff',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
              border: '1px solid #e3eaf5',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: '#6d7b95',
                marginBottom: 8,
              }}
            >
              Étape 3
            </div>

            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: 28,
                fontWeight: 900,
                color: '#1f3158',
              }}
            >
              CMP
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: 17,
                lineHeight: 1.6,
                color: '#5d6d89',
              }}
            >
              Mesurer vos compétences mentales actuelles : confiance,
              régulation, engagement, stabilité et ressources de performance.
            </p>
          </article>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 22,
            padding: 22,
            boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
            border: '1px solid #e3eaf5',
            marginBottom: 22,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 24,
              fontWeight: 900,
              color: '#1f3158',
            }}
          >
            Ce que vous allez recevoir
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 16,
              lineHeight: 1.9,
              color: '#5d6d89',
            }}
          >
            <li>Une synthèse spécifique après chaque test</li>
            <li>Une lecture croisée de vos trois résultats</li>
            <li>Une synthèse globale experte A4P</li>
            <li>Des axes de progression concrets et personnalisés</li>
          </ul>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 22,
            padding: 22,
            boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
            border: '1px solid #e3eaf5',
            marginBottom: 22,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: 24,
              fontWeight: 900,
              color: '#1f3158',
            }}
          >
            Règles d’accès
          </h3>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 16,
              lineHeight: 1.9,
              color: '#5d6d89',
            }}
          >
            <li>Connexion obligatoire avant toute passation</li>
            <li>Un seul passage autorisé par test</li>
            <li>Nouvelle passation uniquement sur autorisation A4P</li>
            <li>Accès étendu possible dans le cadre d’un abonnement</li>
          </ul>
        </section>

        <section
          style={{
            display: 'grid',
            gap: 14,
          }}
        >
          <Link
            href="/individuel/connexion"
            style={{
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                background: '#1f3158',
                color: '#ffffff',
                borderRadius: 14,
                padding: '16px 20px',
                fontWeight: 800,
                fontSize: 17,
                textAlign: 'center',
                boxShadow: '0 12px 28px rgba(31,49,88,0.16)',
              }}
            >
              Me connecter pour commencer →
            </div>
          </Link>

          <div
            style={{
              background: '#ffffff',
              color: '#6d7b95',
              borderRadius: 14,
              padding: '15px 18px',
              fontWeight: 700,
              fontSize: 15,
              textAlign: 'center',
              border: '1px solid #dbe4f2',
            }}
          >
            Aucun accès direct aux tests sans validation préalable
          </div>

          <p
            style={{
              margin: '4px 0 0 0',
              textAlign: 'center',
              color: '#6d7b95',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Après connexion, la plateforme vérifiera automatiquement vos droits
            d’accès et le nombre de passations autorisées.
          </p>
        </section>
      </div>
    </main>
  )
}
