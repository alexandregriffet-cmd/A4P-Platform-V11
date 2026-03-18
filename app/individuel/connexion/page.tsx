'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ConnexionIndividuellePage() {
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    alert(
      "Écran de connexion prêt. La validation réelle de l'accès sera branchée à l'étape suivante."
    )
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
            Identifiez-vous pour accéder à votre parcours personnel, à vos tests
            autorisés et à vos résultats.
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
            🔒 Données confidentielles • Accès contrôlé
          </div>
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
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 4,
                background: '#1f3158',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '16px 20px',
                fontWeight: 800,
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: '0 12px 28px rgba(31,49,88,0.16)',
              }}
            >
              Valider mon accès →
            </button>
          </form>
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 12px 32px rgba(31,49,88,0.08)',
            border: '1px solid #e3eaf5',
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: 24,
              fontWeight: 900,
              color: '#1f3158',
            }}
          >
            Rappel des règles d’accès
          </h2>

          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 16,
              lineHeight: 1.9,
              color: '#5d6d89',
            }}
          >
            <li>Un seul passage autorisé par test</li>
            <li>Nouvelle passation uniquement sur autorisation A4P</li>
            <li>Accès étendu possible dans le cadre d’un abonnement</li>
            <li>Les résultats sont personnels et confidentiels</li>
          </ul>
        </section>

        <div
          style={{
            textAlign: 'center',
          }}
        >
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
