'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConnexionIndividuellePage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/individual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          accessCode,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setErrorMessage(data?.message || 'Connexion impossible.')
        setLoading(false)
        return
      }

      router.push(data.redirectTo || '/individuel/espace')
      router.refresh()
    } catch {
      setErrorMessage('Connexion impossible pour le moment.')
      setLoading(false)
    }
  }

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
          maxWidth: 720,
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
              width: 120,
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
            Connexion individuelle sécurisée
          </div>

          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(28px, 6vw, 42px)',
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Accéder à mon diagnostic
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: 580,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Identifiez-vous pour accéder à votre parcours personnel et à vos
            tests autorisés.
          </p>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 12px 32px rgba(31,49,88,0.08)',
            border: '1px solid #e3eaf5',
            marginBottom: 18,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gap: 18,
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#1f3158',
                }}
              >
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                placeholder="exemple@domaine.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px',
                  borderRadius: 14,
                  border: '1px solid #d7e1f0',
                  fontSize: 16,
                  color: '#1f3158',
                  background: '#f9fbff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <label
                htmlFor="accessCode"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#1f3158',
                }}
              >
                Code d’accès personnel
              </label>

              <input
                id="accessCode"
                type="text"
                placeholder="Votre code d'accès"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px',
                  borderRadius: 14,
                  border: '1px solid #d7e1f0',
                  fontSize: 16,
                  color: '#1f3158',
                  background: '#f9fbff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                required
              />
            </div>

            {errorMessage ? (
              <div
                style={{
                  background: '#fff2f2',
                  color: '#b42318',
                  border: '1px solid #f1c0c0',
                  borderRadius: 14,
                  padding: '14px 16px',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? '#8a96b3' : '#1f3158',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '16px 20px',
                fontWeight: 800,
                fontSize: 17,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 12px 28px rgba(31,49,88,0.16)',
              }}
            >
              {loading ? 'Vérification en cours...' : 'Valider mon accès →'}
            </button>
          </form>
        </section>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/individuel"
            style={{
              color: '#5d6d89',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            ← Retour au parcours individuel
          </Link>
        </div>
      </div>
    </main>
  )
}
