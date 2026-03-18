'use client'

import { useEffect, useMemo, useState } from 'react'
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

export default function IndividualDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<IndividualUser | null>(null)

  useEffect(() => {
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
    } catch {
      router.replace('/individuel/connexion')
    }
  }, [router])

  const completion = useMemo(() => {
    if (!user) return 0
    const flags = [
      Boolean(user.pmp_passed),
      Boolean(user.psycho_passed),
      Boolean(user.cmp_passed),
    ]
    return flags.filter(Boolean).length
  }, [user])

  function handleLogout() {
    localStorage.removeItem('a4p_individual_user')
    router.push('/individuel/connexion')
  }

  if (!user) {
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
        }}
      >
        Chargement de votre espace personnel...
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
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            Espace individuel sécurisé
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Mon tableau de bord
          </h1>

          <p
            style={{
              margin: '20px auto 0',
              maxWidth: 620,
              fontSize: 21,
              lineHeight: 1.6,
              opacity: 0.96,
            }}
          >
            Bienvenue {user.email}. Retrouvez ici vos accès aux tests, votre progression
            et prochainement vos synthèses individuelles.
          </p>
        </section>

        <section
          style={{
            marginTop: 24,
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
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#6c7a99',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              Statut
            </div>

            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: '#22366c',
                marginBottom: 10,
              }}
            >
              {completion} / 3 tests réalisés
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 20,
                lineHeight: 1.6,
                color: '#5d6b8a',
              }}
            >
              Votre accès est actif. Chaque test est prévu pour une passation contrôlée.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 18,
            }}
          >
            <TestCard
              title="PMP"
              description="Comprendre votre mode de fonctionnement mental, votre façon de décider, d’anticiper et d’entrer dans l’action."
              status={user.pmp_passed ? 'Déjà réalisé' : 'Disponible'}
              href={user.pmp_passed ? '#' : '/individuel/tests/pmp'}
              disabled={Boolean(user.pmp_passed)}
            />

            <TestCard
              title="Psycho-émotionnel"
              description="Identifier votre manière de réagir sous pression, votre stabilité émotionnelle, vos tensions et vos points de vigilance."
              status={user.psycho_passed ? 'Déjà réalisé' : 'Disponible'}
              href={user.psycho_passed ? '#' : '/individuel/tests/psycho'}
              disabled={Boolean(user.psycho_passed)}
            />

            <TestCard
              title="CMP"
              description="Mesurer vos compétences mentales actuelles : confiance, régulation, engagement, stabilité et ressources de performance."
              status={user.cmp_passed ? 'Déjà réalisé' : 'Disponible'}
              href={user.cmp_passed ? '#' : '/individuel/tests/cmp'}
              disabled={Boolean(user.cmp_passed)}
            />
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
                fontSize: 18,
                fontWeight: 900,
                color: '#22366c',
                marginBottom: 12,
              }}
            >
              Actions
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <Link
                href="/individuel"
                style={secondaryButtonStyle}
              >
                Retour au parcours individuel
              </Link>

              <button
                onClick={handleLogout}
                style={primaryButtonStyle}
              >
                Me déconnecter
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function TestCard({
  title,
  description,
  status,
  href,
  disabled,
}: {
  title: string
  description: string
  status: string
  href: string
  disabled?: boolean
}) {
  return (
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
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'center',
          marginBottom: 14,
          flexWrap: 'wrap',
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
          {title}
        </h2>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: 999,
            background: disabled ? '#eef1f6' : '#eaf6ee',
            color: disabled ? '#6f7c96' : '#1f7a46',
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          {status}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 21,
          lineHeight: 1.65,
          color: '#5d6b8a',
        }}
      >
        {description}
      </p>

      <div style={{ marginTop: 20 }}>
        {disabled ? (
          <button
            disabled
            style={{
              ...primaryButtonStyle,
              opacity: 0.45,
              cursor: 'not-allowed',
            }}
          >
            Accès verrouillé
          </button>
        ) : (
          <Link href={href} style={primaryButtonStyle}>
            Ouvrir le test
          </Link>
        )}
      </div>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 70,
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
  minHeight: 70,
  borderRadius: 22,
  border: '2px solid #dbe3f0',
  background: '#f8faff',
  color: '#22366c',
  fontSize: 22,
  fontWeight: 900,
  textDecoration: 'none',
}
