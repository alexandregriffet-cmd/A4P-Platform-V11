'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type IndividualUser = {
  id: string
  email: string
  has_access: boolean
  pmp_passed?: boolean
  psycho_passed?: boolean
  cmp_passed?: boolean
}

export default function IndividualPmpPage() {
  const router = useRouter()

  const [user, setUser] = useState<IndividualUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem('a4p_individual_user')
        if (!raw) {
          router.replace('/individuel/connexion')
          return
        }

        const parsed = JSON.parse(raw) as IndividualUser

        if (!parsed?.email || !parsed?.has_access) {
          router.replace('/individuel/connexion')
          return
        }

        setUser(parsed)

        const response = await fetch('/api/individual-pmp-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: parsed.id,
            email: parsed.email,
          }),
        })

        const result = await response.json()

        if (!response.ok || !result?.ok) {
          setError(result?.message || 'Accès PMP refusé.')
          setAccessDenied(true)

          if (result?.user) {
            localStorage.setItem('a4p_individual_user', JSON.stringify(result.user))
            setUser(result.user)
          }

          setChecking(false)
          return
        }

        setChecking(false)
      } catch (err) {
        console.error(err)
        setError('Erreur technique de chargement du PMP.')
        setAccessDenied(true)
        setChecking(false)
      }
    }

    init()
  }, [router])

  if (checking) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #edf3ff 0%, #f7f9ff 100%)',
          color: '#22366c',
          fontSize: 20,
          fontWeight: 700,
          padding: 24,
          textAlign: 'center',
        }}
      >
        Vérification de votre accès PMP...
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #edf3ff 0%, #f7f9ff 100%)',
          padding: '28px 18px 60px',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <section
            style={{
              background: '#ffffff',
              borderRadius: 34,
              padding: 30,
              border: '1px solid #e7edf7',
              boxShadow: '0 18px 45px rgba(19, 33, 68, 0.10)',
              textAlign: 'center',
            }}
          >
            <img
              src="/logo-a4p.png"
              alt="Académie de Performances"
              style={{
                width: 160,
                maxWidth: '70%',
                height: 'auto',
                display: 'block',
                margin: '0 auto 18px',
                borderRadius: 12,
              }}
            />

            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#22366c',
              }}
            >
              Accès PMP indisponible
            </h1>

            <p
              style={{
                margin: '22px auto 0',
                maxWidth: 620,
                fontSize: 22,
                lineHeight: 1.65,
                color: '#5d6b8a',
              }}
            >
              {error || 'Votre compte ne peut pas ouvrir le PMP pour le moment.'}
            </p>

            <div style={{ display: 'grid', gap: 14, marginTop: 28 }}>
              <Link href="/individuel/dashboard" style={primaryButtonStyle}>
                Retourner au tableau de bord
              </Link>

              <Link href="/individuel" style={secondaryButtonStyle}>
                Revenir au parcours individuel
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #edf3ff 0%, #f7f9ff 100%)',
        padding: '28px 18px 60px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #2f4a8a 0%, #37539a 100%)',
            borderRadius: 34,
            padding: '28px 22px 34px',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 18px 45px rgba(19, 33, 68, 0.16)',
          }}
        >
          <img
            src="/logo-a4p.png"
            alt="Académie de Performances"
            style={{
              width: 160,
              maxWidth: '68%',
              height: 'auto',
              display: 'block',
              margin: '0 auto 18px',
              borderRadius: 12,
            }}
          />

          <div
            style={{
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: 16,
              opacity: 0.88,
              marginBottom: 14,
            }}
          >
            Test PMP sécurisé
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Profil Mental de
            <br />
            Performance
          </h1>

          <p
            style={{
              margin: '22px auto 0',
              maxWidth: 680,
              fontSize: 22,
              lineHeight: 1.65,
              opacity: 0.96,
            }}
          >
            Bonjour {user?.email}. Votre accès PMP est bien contrôlé dans la plateforme.
            Pour éviter toute fuite de lien public, le PMP externe GitHub n’est plus ouvert
            depuis cet espace.
          </p>
        </section>

        <section
          style={{
            marginTop: 22,
            display: 'grid',
            gap: 18,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 28,
              padding: 26,
              boxShadow: '0 16px 40px rgba(31, 41, 55, 0.08)',
              border: '1px solid #e7edf7',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 900,
                color: '#22366c',
              }}
            >
              Pourquoi nous bloquons l’ouverture externe
            </h2>

            <ul
              style={{
                margin: '18px 0 0',
                paddingLeft: 24,
                color: '#5d6b8a',
                fontSize: 21,
                lineHeight: 1.9,
              }}
            >
              <li>Un lien GitHub public peut être copié et réutilisé hors plateforme</li>
              <li>Ce fonctionnement contourne le verrou “un seul passage”</li>
              <li>La vraie solution propre est l’intégration du PMP dans le SaaS</li>
            </ul>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 28,
              padding: 26,
              boxShadow: '0 16px 40px rgba(31, 41, 55, 0.08)',
              border: '1px solid #e7edf7',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 900,
                color: '#22366c',
              }}
            >
              Intégration sécurisée en cours
            </h2>

            <p
              style={{
                margin: '18px 0 0',
                color: '#5d6b8a',
                fontSize: 21,
                lineHeight: 1.75,
              }}
            >
              Le PMP va maintenant être injecté directement dans votre plateforme A4P.
              À partir de cette étape, il ne sera plus lancé via un hub GitHub public,
              mais depuis un parcours individuel sécurisé, contrôlé et relié à vos droits d’accès.
            </p>

            <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
              <button
                type="button"
                disabled
                style={{
                  ...primaryButtonStyleAsButton,
                  opacity: 0.45,
                  cursor: 'not-allowed',
                }}
              >
                PMP externe désactivé
              </button>

              <Link href="/individuel/dashboard" style={secondaryButtonStyle}>
                Retour au tableau de bord
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              href="/individuel/dashboard"
              style={{
                color: '#6c7a99',
                fontSize: 18,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ← Retour au tableau de bord
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 72,
  borderRadius: 22,
  border: 'none',
  background: '#21366f',
  color: '#ffffff',
  fontSize: 22,
  fontWeight: 900,
  textDecoration: 'none',
  boxShadow: '0 10px 24px rgba(33, 54, 111, 0.18)',
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 72,
  borderRadius: 22,
  border: '2px solid #dbe3f0',
  background: '#f8faff',
  color: '#22366c',
  fontSize: 22,
  fontWeight: 900,
  textDecoration: 'none',
}

const primaryButtonStyleAsButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 72,
  borderRadius: 22,
  border: 'none',
  background: '#21366f',
  color: '#ffffff',
  fontSize: 22,
  fontWeight: 900,
}
