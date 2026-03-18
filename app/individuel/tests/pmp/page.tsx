'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PMP_QUESTIONS } from '@/lib/pmp/questions'
import { computePmpResults, pmpScoreBand, PMP_DIMENSIONS } from '@/lib/pmp/scoring'

type IndividualUser = {
  id: string
  email: string
  has_access: boolean
  pmp_passed?: boolean
  psycho_passed?: boolean
  cmp_passed?: boolean
}

type AthleteState = {
  name: string
  age: string
  sport: string
  club: string
}

type AnswersState = Record<string, number | string>

export default function IndividualPmpPage() {
  const router = useRouter()

  const [user, setUser] = useState<IndividualUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [error, setError] = useState('')
  const [screen, setScreen] = useState<'intro' | 'test' | 'report'>('intro')
  const [submitting, setSubmitting] = useState(false)

  const [athlete, setAthlete] = useState<AthleteState>({
    name: '',
    age: '',
    sport: '',
    club: '',
  })

  const [answers, setAnswers] = useState<AnswersState>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem('a4p_individual_user')

        if (!raw) {
          router.replace('/individuel/connexion')
          return
        }

        const parsed = JSON.parse(raw) as IndividualUser

        if (!parsed?.id || !parsed?.email || !parsed?.has_access) {
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

        const payload = await response.json()

        if (!response.ok || !payload?.ok) {
          setAccessDenied(true)
          setError(payload?.message || 'Accès PMP refusé.')

          if (payload?.user) {
            localStorage.setItem('a4p_individual_user', JSON.stringify(payload.user))
            setUser(payload.user)
          }

          setChecking(false)
          return
        }

        setChecking(false)
      } catch (e) {
        console.error(e)
        setAccessDenied(true)
        setError('Erreur technique de chargement du PMP.')
        setChecking(false)
      }
    }

    init()
  }, [router])

  const currentQuestion = PMP_QUESTIONS[currentIndex]

  const progress = useMemo(() => {
    return Math.round(((currentIndex + 1) / PMP_QUESTIONS.length) * 100)
  }, [currentIndex])

  const result = useMemo(() => {
    return computePmpResults(athlete, answers)
  }, [athlete, answers])

  function answerLikert(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function answerBinary(value: 'A' | 'B') {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function nextQuestion() {
    const value = answers[currentQuestion.id]

    if (value === undefined || value === '') {
      setError('Merci de répondre avant de continuer.')
      return
    }

    setError('')

    if (currentIndex === PMP_QUESTIONS.length - 1) {
      setScreen('report')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setCurrentIndex((prev) => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevQuestion() {
    if (currentIndex === 0) return
    setError('')
    setCurrentIndex((prev) => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function validatePmp() {
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/pmp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          athlete,
          answers,
        }),
      })

      const payload = await response.json()

      if (!response.ok || !payload?.ok) {
        setError(payload?.message || 'Impossible de valider le PMP.')
        setSubmitting(false)
        return
      }

      if (payload?.user) {
        localStorage.setItem('a4p_individual_user', JSON.stringify(payload.user))
      }

      router.push('/individuel/dashboard')
    } catch (e) {
      console.error(e)
      setError('Erreur technique. Merci de réessayer.')
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <main style={loadingStyle}>
        Vérification de votre accès PMP...
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <section style={cardStyle}>
            <img src="/logo-a4p.png" alt="Académie de Performances" style={logoStyle} />
            <h1 style={titleStyle}>Accès PMP indisponible</h1>
            <p style={textStyle}>{error || 'Votre compte ne peut pas ouvrir le PMP.'}</p>
            <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
              <Link href="/individuel/dashboard" style={primaryLinkStyle}>
                Retour au tableau de bord
              </Link>
              <Link href="/individuel" style={secondaryLinkStyle}>
                Retour au parcours individuel
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (screen === 'intro') {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <section style={heroStyle}>
            <img src="/logo-a4p.png" alt="Académie de Performances" style={heroLogoStyle} />
            <div style={heroEyebrowStyle}>TEST PMP SÉCURISÉ</div>
            <h1 style={heroTitleStyle}>Profil Mental de Performance</h1>
            <p style={heroTextStyle}>
              Bonjour {user?.email}. Votre accès PMP est ouvert pour une passation contrôlée
              et unique.
            </p>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Avant de commencer</h2>

            <div style={formGridStyle}>
              <label style={labelStyle}>
                <span>Nom du sportif</span>
                <input
                  value={athlete.name}
                  onChange={(e) => setAthlete((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Prénom Nom"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                <span>Âge</span>
                <input
                  value={athlete.age}
                  onChange={(e) => setAthlete((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder="15"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                <span>Sport</span>
                <input
                  value={athlete.sport}
                  onChange={(e) => setAthlete((prev) => ({ ...prev, sport: e.target.value }))}
                  placeholder="Football, rugby, tennis..."
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                <span>Club / structure</span>
                <input
                  value={athlete.club}
                  onChange={(e) => setAthlete((prev) => ({ ...prev, club: e.target.value }))}
                  placeholder="Club, lycée, académie..."
                  style={inputStyle}
                />
              </label>
            </div>

            <div style={infoBoxStyle}>
              Le PMP comprend 136 questions et produit une première synthèse mentale A4P.
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => {
                  setScreen('test')
                  setError('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={primaryButtonStyle}
              >
                Commencer mon PMP
              </button>

              <Link href="/individuel/dashboard" style={secondaryLinkStyle}>
                Retour au tableau de bord
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (screen === 'test') {
    const selected = answers[currentQuestion.id]

    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <section style={heroStyle}>
            <img src="/logo-a4p.png" alt="Académie de Performances" style={heroLogoStyle} />
            <div style={heroEyebrowStyle}>
              QUESTION {currentIndex + 1} / {PMP_QUESTIONS.length}
            </div>
            <h1 style={heroTitleStyle}>
              {currentQuestion.type === 'likert'
                ? PMP_DIMENSIONS[currentQuestion.dimension].label
                : 'Lecture cognitive'}
            </h1>
            <p style={heroTextStyle}>{progress}% du questionnaire complété</p>
          </section>

          <section style={cardStyle}>
            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${progress}%` }} />
            </div>

            <h2 style={questionTitleStyle}>{currentQuestion.text}</h2>

            <p style={questionTextStyle}>
              {currentQuestion.type === 'likert'
                ? PMP_DIMENSIONS[currentQuestion.dimension].description
                : 'Cette partie affine la lecture cognitive inspirée MBTI.'}
            </p>

            {currentQuestion.type === 'likert' ? (
              <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const labels: Record<number, string> = {
                    1: '1 — Pas du tout d’accord',
                    2: '2 — Plutôt pas d’accord',
                    3: '3 — Mitigé',
                    4: '4 — Plutôt d’accord',
                    5: '5 — Tout à fait d’accord',
                  }

                  const isSelected = selected === value

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => answerLikert(value)}
                      style={{
                        ...answerButtonStyle,
                        ...(isSelected ? answerButtonSelectedStyle : {}),
                      }}
                    >
                      {labels[value]}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
                {(['A', 'B'] as const).map((choice) => {
                  const isSelected = selected === choice
                  const text =
                    choice === 'A' ? currentQuestion.optionA : currentQuestion.optionB

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => answerBinary(choice)}
                      style={{
                        ...answerButtonStyle,
                        ...(isSelected ? answerButtonSelectedStyle : {}),
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: 6 }}>{choice}</strong>
                      {text}
                    </button>
                  )
                })}
              </div>
            )}

            {error ? <div style={errorBoxStyle}>{error}</div> : null}

            <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
              <button type="button" onClick={nextQuestion} style={primaryButtonStyle}>
                {currentIndex === PMP_QUESTIONS.length - 1
                  ? 'Voir ma synthèse PMP'
                  : 'Question suivante'}
              </button>

              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                style={{
                  ...secondaryButtonStyle,
                  opacity: currentIndex === 0 ? 0.45 : 1,
                }}
              >
                Question précédente
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <img src="/logo-a4p.png" alt="Académie de Performances" style={heroLogoStyle} />
          <div style={heroEyebrowStyle}>SYNTHÈSE PMP</div>
          <h1 style={heroTitleStyle}>Votre lecture immédiate</h1>
          <p style={heroTextStyle}>
            Relisez votre synthèse. La validation finale enregistrera votre résultat et verrouillera
            le PMP pour ce compte.
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Indicateurs clés</h2>

          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Indice global A4P</div>
              <div style={statValueStyle}>{result.globalIndex}/100</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Indice pression</div>
              <div style={statValueStyle}>{result.pressureIndex}/100</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Indice stabilité</div>
              <div style={statValueStyle}>{result.stabilityIndex}/100</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Type cognitif probable</div>
              <div style={statValueStyle}>{result.mbtiType}</div>
            </div>
          </div>

          <div style={infoBoxStyle}>
            Profil principal : <strong>{result.profiles[0].name}</strong> — Profil secondaire :{' '}
            <strong>{result.profiles[1].name}</strong> — Préférence motrice :{' '}
            <strong>{result.motor}</strong>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Dimensions mentales</h2>

          <div style={{ display: 'grid', gap: 16 }}>
            {Object.entries(result.scores).map(([key, score]) => (
              <div key={key} style={dimensionCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ color: '#22366c', fontSize: 22 }}>
                    {PMP_DIMENSIONS[key as keyof typeof PMP_DIMENSIONS].label}
                  </strong>
                  <span style={{ color: '#22366c', fontWeight: 900, fontSize: 20 }}>
                    {score}/100
                  </span>
                </div>

                <div style={miniTrackStyle}>
                  <div style={{ ...miniFillStyle, width: `${score}%` }} />
                </div>

                <div style={{ color: '#6c7a99', fontSize: 18, fontWeight: 700 }}>
                  {pmpScoreBand(score)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Axes prioritaires</h2>
          <ul style={listStyle}>
            {result.lowDims.map(([key, score]) => (
              <li key={key}>
                <strong>{PMP_DIMENSIONS[key as keyof typeof PMP_DIMENSIONS].label}</strong> — {score}
                /100
              </li>
            ))}
          </ul>
        </section>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <div style={{ display: 'grid', gap: 14 }}>
          <button
            type="button"
            onClick={validatePmp}
            disabled={submitting}
            style={{
              ...primaryButtonStyle,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? 'Validation et enregistrement en cours...'
              : 'Valider définitivement mon PMP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setScreen('test')
              setError('')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            style={secondaryButtonStyle}
          >
            Revenir au questionnaire
          </button>
        </div>
      </div>
    </main>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #edf3ff 0%, #f7f9ff 100%)',
  padding: '28px 18px 60px',
}

const containerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 22,
}

const loadingStyle: React.CSSProperties = {
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
}

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #2f4a8a 0%, #37539a 100%)',
  borderRadius: 34,
  padding: '28px 22px 34px',
  color: '#ffffff',
  textAlign: 'center',
  boxShadow: '0 18px 45px rgba(19, 33, 68, 0.16)',
}

const heroLogoStyle: React.CSSProperties = {
  width: 160,
  maxWidth: '68%',
  height: 'auto',
  display: 'block',
  margin: '0 auto 18px',
  borderRadius: 12,
}

const heroEyebrowStyle: React.CSSProperties = {
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontSize: 16,
  opacity: 0.88,
  marginBottom: 14,
}

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 38,
  lineHeight: 1.08,
  fontWeight: 900,
}

const heroTextStyle: React.CSSProperties = {
  margin: '22px auto 0',
  maxWidth: 700,
  fontSize: 22,
  lineHeight: 1.65,
  opacity: 0.96,
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 28,
  padding: 26,
  boxShadow: '0 16px 40px rgba(31, 41, 55, 0.08)',
  border: '1px solid #e7edf7',
}

const logoStyle: React.CSSProperties = {
  width: 160,
  maxWidth: '70%',
  height: 'auto',
  display: 'block',
  margin: '0 auto 18px',
  borderRadius: 12,
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  fontWeight: 900,
  color: '#22366c',
}

const textStyle: React.CSSProperties = {
  margin: '22px auto 0',
  maxWidth: 620,
  fontSize: 22,
  lineHeight: 1.65,
  color: '#5d6b8a',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 900,
  color: '#22366c',
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 18,
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  color: '#22366c',
  fontSize: 18,
  fontWeight: 800,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 66,
  borderRadius: 20,
  border: '2px solid #dbe3f0',
  background: '#f8faff',
  padding: '0 20px',
  fontSize: 20,
  color: '#22366c',
  outline: 'none',
}

const infoBoxStyle: React.CSSProperties = {
  marginTop: 18,
  padding: '18px 20px',
  borderRadius: 22,
  background: '#f5f8ff',
  border: '1px solid #dbe3f0',
  color: '#5d6b8a',
  fontSize: 19,
  lineHeight: 1.7,
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
  cursor: 'pointer',
}

const primaryLinkStyle: React.CSSProperties = {
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
}

const secondaryLinkStyle: React.CSSProperties = {
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

const progressTrackStyle: React.CSSProperties = {
  width: '100%',
  height: 16,
  borderRadius: 999,
  background: '#e6edf8',
  overflow: 'hidden',
  marginBottom: 22,
}

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #21366f 0%, #4764b0 100%)',
}

const questionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#22366c',
  fontSize: 34,
  lineHeight: 1.2,
  fontWeight: 900,
}

const questionTextStyle: React.CSSProperties = {
  margin: '14px 0 0',
  color: '#5d6b8a',
  fontSize: 21,
  lineHeight: 1.7,
}

const answerButtonStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 22,
  border: '2px solid #dbe3f0',
  background: '#ffffff',
  padding: '18px 20px',
  textAlign: 'left',
  fontSize: 20,
  lineHeight: 1.6,
  color: '#22366c',
  cursor: 'pointer',
}

const answerButtonSelectedStyle: React.CSSProperties = {
  border: '2px solid #21366f',
  background: '#eef3ff',
  boxShadow: '0 10px 24px rgba(33, 54, 111, 0.08)',
}

const errorBoxStyle: React.CSSProperties = {
  marginTop: 18,
  borderRadius: 22,
  background: '#fdeeee',
  border: '2px solid #efc4c4',
  color: '#a13328',
  fontSize: 18,
  fontWeight: 800,
  padding: '18px 20px',
}

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 18,
}

const statCardStyle: React.CSSProperties = {
  borderRadius: 22,
  background: '#f8faff',
  border: '1px solid #dbe3f0',
  padding: 20,
}

const statLabelStyle: React.CSSProperties = {
  color: '#6c7a99',
  fontSize: 16,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const statValueStyle: React.CSSProperties = {
  marginTop: 8,
  color: '#22366c',
  fontSize: 30,
  fontWeight: 900,
}

const dimensionCardStyle: React.CSSProperties = {
  borderRadius: 22,
  background: '#f8faff',
  border: '1px solid #dbe3f0',
  padding: 18,
  display: 'grid',
  gap: 10,
}

const miniTrackStyle: React.CSSProperties = {
  width: '100%',
  height: 12,
  borderRadius: 999,
  background: '#e6edf8',
  overflow: 'hidden',
}

const miniFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #21366f 0%, #4764b0 100%)',
}

const listStyle: React.CSSProperties = {
  margin: '18px 0 0',
  paddingLeft: 24,
  color: '#5d6b8a',
  fontSize: 21,
  lineHeight: 1.9,
}
