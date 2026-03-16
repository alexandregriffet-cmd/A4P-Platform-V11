import Link from 'next/link'
import type { CSSProperties } from 'react'

export default function ConnexionPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={eyebrowStyle}>Connexion A4P</div>

        <h1 style={titleStyle}>Choisir votre accès</h1>

        <p style={textStyle}>
          Cette page centralise les différents points d’entrée de la plateforme A4P.
          Choisissez l’espace correspondant à votre rôle.
        </p>

        <div style={gridStyle}>
          <Link href="/admin" style={primaryCardStyle}>
            <div style={cardTitleStyle}>Admin A4P</div>
            <div style={cardTextStyle}>
              Accès complet à la supervision, aux clubs, aux passations et aux résultats.
            </div>
          </Link>

          <Link href="/club" style={cardLinkStyle}>
            <div style={cardTitleStyle}>Portail club</div>
            <div style={cardTextStyle}>
              Accès sécurisé au club, aux équipes, aux joueurs et aux résultats autorisés.
            </div>
          </Link>

          <Link href="/" style={cardLinkStyle}>
            <div style={cardTitleStyle}>Accueil plateforme</div>
            <div style={cardTextStyle}>
              Retour vers la page d’entrée générale de la plateforme A4P.
            </div>
          </Link>
        </div>

        <div style={actionsStyle}>
          <Link href="/" style={secondaryButtonStyle}>
            Retour accueil
          </Link>
          <Link href="/admin/clubs" style={secondaryButtonStyle}>
            Gérer les clubs
          </Link>
        </div>
      </section>
    </main>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: 24,
  background: '#eef2f7',
  minHeight: '100vh'
}

const cardStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
  borderRadius: 30,
  padding: 32,
  boxShadow: '0 18px 48px rgba(18, 35, 66, 0.08)'
}

const eyebrowStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#7180a0',
  marginBottom: 12
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 52,
  lineHeight: 1.05,
  color: '#182847'
}

const textStyle: CSSProperties = {
  margin: '18px 0 0 0',
  fontSize: 22,
  lineHeight: 1.7,
  color: '#5f6f8e',
  maxWidth: 900
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 18,
  marginTop: 28
}

const cardLinkStyle: CSSProperties = {
  textDecoration: 'none',
  background: '#ffffff',
  border: '1px solid #dde5f0',
  borderRadius: 22,
  padding: 22,
  boxShadow: '0 10px 24px rgba(21,37,69,0.05)'
}

const primaryCardStyle: CSSProperties = {
  ...cardLinkStyle,
  background: 'linear-gradient(135deg, #2f4d85 0%, #4168b0 100%)',
  color: '#ffffff',
  border: 'none',
  boxShadow: '0 16px 34px rgba(47,77,133,0.24)'
}

const cardTitleStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 10,
  color: 'inherit'
}

const cardTextStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.65,
  color: 'inherit',
  opacity: 0.95
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 28
}

const secondaryButtonStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '14px 20px',
  borderRadius: 16,
  border: '1px solid #d8e1ef',
  color: '#284378',
  background: '#ffffff',
  fontWeight: 800,
  fontSize: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
}
