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
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [pmpUrl, setPmpUrl] = useState('')

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

        setPmpUrl(result.pmpUrl || '')
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

  async function handleCompletePmp() {
    if (!user) return

    setLoadingComplete(true)
    setError('')

    try {
      const response = await fetch('/api/individual-pmp-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result?.ok) {
        setError(result?.message || 'Impossible de valider la fin du PMP.')
        setLoadingComplete(false)
        return
      }

      if (result?.user) {
        localStorage.setItem('a4p_individual_user', JSON.stringify(result.user))
      }

      router.push('/individuel/dashboard')
    } catch (err) {
      console.error(err)
      setError('Erreur technique. Merci de réessayer.')
      setLoadingComplete(false)
    }
  }

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
            Bonjour {user?.email}. Votre accès PMP est ouvert pour une passation contrôlée.
            Une fois le test terminé et validé, ce compte sera verrouillé pour le PMP.
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
              Règle d’accès PMP
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
              <li>Un seul passage autorisé pour ce compte</li>
              <li>Validation finale à effectuer uniquement après la vraie complétion du PMP</li>
              <li>Le dashboard sera mis à jour automatiquement après validation</li>
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
            <div
              style={{
                display: 'grid',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <a
                href={pmpUrl}
                target="_blank"
                rel="noreferrer"
                style={primaryButtonStyle}
              >
                Ouvrir le PMP
              </a>

              <button
                type="button"
                onClick={handleCompletePmp}
                disabled={loadingComplete}
                style={{
                  ...secondaryButtonStyleAsButton,
                  opacity: loadingComplete ? 0.7 : 1,
                }}
              >
                {loadingComplete
                  ? 'Validation en cours...'
                  : 'J’ai terminé mon PMP et je valide ce passage'}
              </button>
            </div>

            {error ? (
              <div
                style={{
                  borderRadius: 22,
                  background: '#fdeeee',
                  border: '2px solid #efc4c4',
                  color: '#a13328',
                  fontSize: 18,
                  fontWeight: 800,
                  padding: '18px 20px',
                  marginTop: 10,
                }}
              >
                {error}
              </div>
            ) : null}
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
                fontSize: 28,
                fontWeight: 900,
                color: '#22366c',
              }}
            >
              Aperçu intégré
            </h2>

            <p
              style={{
                margin: '16px 0 18px',
                color: '#5d6b8a',
                fontSize: 19,
                lineHeight: 1.7,
              }}
            >
              Vous pouvez ouvrir le test en plein écran via le bouton ci-dessus. L’aperçu
              ci-dessous reste pratique sur ordinateur, mais sur mobile l’ouverture externe
              est souvent plus confortable.
            </p>

            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid #dbe3f0',
                background: '#f8faff',
                minHeight: 680,
              }}
            >
              <iframe
                title="PMP A4P"
                src={pmpUrl}
                style={{
                  width: '100%',
                  height: 680,
                  border: 'none',
                  background: '#ffffff',
                }}
              />
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

const secondaryButtonStyleAsButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 72,
  borderRadius: 22,
  border: '2px solid #dbe3f0',
  background: '#f8faff',
  color: '#22366c',
  fontSize: 20,
  fontWeight: 900,
  cursor: 'pointer',
}
