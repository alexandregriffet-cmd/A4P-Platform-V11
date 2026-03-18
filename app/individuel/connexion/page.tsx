'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IndividualConnexionPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/individual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          accessCode: accessCode.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result?.ok) {
        setError(result?.message || 'Accès refusé.')
        setLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('a4p_individual_user', JSON.stringify(result.user))
      }

      router.push('/individuel/dashboard')
    } catch (err) {
      console.error(err)
      setError('Erreur technique. Merci de réessayer.')
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #edf3ff 0%, #f7f9ff 100%)',
        padding: '28px 18px 60px',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
              width: 180,
              maxWidth: '70%',
              height: 'auto',
              display: 'block',
              margin: '0 auto 20px',
              borderRadius: 12,
            }}
          />

          <div
            style={{
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: 18,
              opacity: 0.88,
              marginBottom: 18,
            }}
          >
            Connexion individuelle sécurisée
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            Accéder à mon
            <br />
            diagnostic
          </h1>

          <p
            style={{
              margin: '26px auto 0',
              maxWidth: 580,
              fontSize: 22,
              lineHeight: 1.6,
              opacity: 0.96,
            }}
          >
            Identifiez-vous pour accéder à votre parcours personnel et à vos tests autorisés.
          </p>
        </section>

        <section
          style={{
            marginTop: 24,
            background: '#ffffff',
            borderRadius: 32,
            padding: 30,
            boxShadow: '0 16px 40px rgba(31, 41, 55, 0.08)',
            border: '1px solid #e7edf7',
          }}
        >
          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: 'block',
                fontSize: 20,
                fontWeight: 800,
                color: '#22366c',
                marginBottom: 12,
              }}
            >
              Adresse email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@domaine.fr"
              autoComplete="email"
              style={{
                width: '100%',
                height: 78,
                borderRadius: 24,
                border: '2px solid #dbe3f0',
                background: '#f8faff',
                padding: '0 24px',
                fontSize: 24,
                color: '#22366c',
                outline: 'none',
                marginBottom: 28,
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 20,
                fontWeight: 800,
                color: '#22366c',
                marginBottom: 12,
              }}
            >
              Code d'accès personnel
            </label>

            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Votre code d'accès"
              autoComplete="off"
              style={{
                width: '100%',
                height: 78,
                borderRadius: 24,
                border: '2px solid #dbe3f0',
                background: '#f8faff',
                padding: '0 24px',
                fontSize: 24,
                color: '#22366c',
                outline: 'none',
                marginBottom: 22,
              }}
            />

            {error ? (
              <div
                style={{
                  borderRadius: 24,
                  background: '#fdeeee',
                  border: '2px solid #efc4c4',
                  color: '#a13328',
                  fontSize: 20,
                  fontWeight: 800,
                  padding: '22px 24px',
                  marginBottom: 22,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 82,
                borderRadius: 24,
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                background: '#21366f',
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 900,
                boxShadow: '0 10px 24px rgba(33, 54, 111, 0.18)',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? 'Vérification en cours...' : 'Valider mon accès →'}
            </button>
          </form>
        </section>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <a
            href="/individuel"
            style={{
              color: '#6c7a99',
              fontSize: 18,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← Retour au parcours individuel
          </a>
        </div>
      </div>
    </main>
  )
}
