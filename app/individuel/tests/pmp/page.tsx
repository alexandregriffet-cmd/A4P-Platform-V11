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

  const [athlete, setAthlete] = useState<AthleteState>({
    name: '',
    age: '',
    sport: '',
    club: '',
  })

  const [answers, setAnswers] = useState<AnswersState>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

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
          setAccessDenied(true)
          setError(result?.message || 'Accès PMP refusé.')

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

  function setLikertAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function setBinaryAnswer(value: 'A' | 'B') {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function goNext() {
    const answer = answers[currentQuestion.id]
    if (answer === undefined || answer === '') {
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

  function goPrev() {
    if (currentIndex === 0) return
    setError('')
    setCurrentIndex((prev) => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmitFinal() {
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/individual-pmp-submit', {
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
    } catch (err) {
      console.error(err)
      setError('Erreur technique. Merci de réessayer.')
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <main style={loadingMainStyle}>
        Vérification de votre accès PMP...
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Card>
            <img src="/logo-a4p.png" alt="Académie de Performances" style={logoStyle} />
            <h1 style={deniedTitleStyle}>Accès PMP indisponible</h1>
            <p style={deniedTextStyle}>{error || 'Votre compte ne peut pas ouvrir le PMP.'}</p>
            <div style={{ display: 'grid', gap: 14, marginTop: 26 }}>
              <Link href="/individuel/dashboard" style={primaryButtonStyle}>
                Retour au tableau de bord
              </Link>
              <Link href="/individuel" style={secondaryButtonStyle}>
                Revenir au parcours individuel
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  if (screen === 'intro') {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Hero
            title={'Profil Mental de\nPerformance'}
            eyebrow="PMP intégré et sécurisé"
            text={`Bonjour ${user?.email}. Vous allez passer le PMP directement dans votre espace sécurisé A4P. Une seule passation est autorisée pour ce compte.`}
          />

          <Card>
            <h2 style={sectionTitleStyle}>Avant de commencer</h2>

            <div style={gridStyle}>
              <Field
                label="Nom du sportif"
                value={athlete.name}
                onChange={(v) => setAthlete((prev) => ({ ...prev, name: v }))}
                placeholder="Prénom Nom"
              />
              <Field
                label="Âge"
                value={athlete.age}
                onChange={(v) => setAthlete((prev) => ({ ...prev, age: v }))}
                placeholder="15"
              />
              <Field
                label="Sport"
                value={athlete.sport}
                onChange={(v) => setAthlete((prev) => ({ ...prev, sport: v }))}
                placeholder="Football, rugby, tennis..."
              />
              <Field
                label="Club / structure"
                value={athlete.club}
                onChange={(v) => setAthlete((prev) => ({ ...prev, club: v }))}
                placeholder="Club, lycée, académie..."
              />
            </div>

            <div style={noteStyle}>
              Le PMP comprend 136 questions. Il produit une lecture mentale A4P, un profil dominant,
              une équivalence cognitive inspirée MBTI et une première synthèse exploitable.
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => {
                  setScreen('test')
                  setError('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={primaryButtonStyleAsButton}
              >
                Commencer mon PMP
              </button>

              <Link href="/individuel/dashboard" style={secondaryButtonStyle}>
                Retour au tableau de bord
              </Link>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  if (screen === 'test') {
    const selected = answers[currentQuestion.id]

    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Hero
            title={`Question ${currentIndex + 1} / ${PMP_QUESTIONS.length}`}
            eyebrow={currentQuestion.type === 'likert' ? `Dimension ${currentQuestion.label}` : 'Lecture cognitive'}
            text={`${progress}% du questionnaire complété`}
          />

          <Card>
            <div style={progressWrapStyle}>
              <div style={progressTrackStyle}>
                <div style={{ ...progressFillStyle, width: `${progress}%` }} />
              </div>
            </div>

            <h2 style={questionTitleStyle}>{currentQuestion.text}</h2>

            {'label' in currentQuestion ? (
              <p style={questionDescriptionStyle}>
                {PMP_DIMENSIONS[currentQuestion.dimension].description}
              </p>
            ) : (
              <p style={questionDescriptionStyle}>
                Cette partie affine la lecture cognitive inspirée MBTI.
              </p>
            )}

            {currentQuestion.type === 'likert' ? (
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const labels = {
                    1: '1 — Pas du tout d’accord',
                    2: '2 — Plutôt pas d’accord',
                    3: '3 — Mitigé',
                    4: '4 — Plutôt d’accord',
                    5: '5 — Tout à fait d’accord',
                  } as const

                  const isSelected = selected === value

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLikertAnswer(value)}
                      style={{
                        ...answerButtonStyle,
                        ...(isSelected ? answerButtonSelectedStyle : {}),
                      }}
                    >
                      {labels[value as 1 | 2 | 3 | 4 | 5]}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                {(['A', 'B'] as const).map((choice) => {
                  const isSelected = selected === choice
                  const text =
                    choice === 'A' ? currentQuestion.optionA : currentQuestion.optionB

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setBinaryAnswer(choice)}
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
              <button type="button" onClick={goNext} style={primaryButtonStyleAsButton}>
                {currentIndex === PMP_QUESTIONS.length - 1
                  ? 'Voir ma synthèse PMP'
                  : 'Question suivante'}
              </button>

              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                style={{
                  ...secondaryButtonStyleAsButton,
                  opacity: currentIndex === 0 ? 0.45 : 1,
                }}
              >
                Question précédente
              </button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Hero
          title={'Synthèse PMP\nA4P'}
          eyebrow="Lecture immédiate avant validation"
          text="Relisez votre synthèse. La validation finale enregistrera votre résultat et verrouillera le PMP pour ce compte."
        />

        <Card>
          <h2 style={sectionTitleStyle}>Portrait global</h2>

          <div style={statsGridStyle}>
            <StatCard label="Indice global A4P" value={`${result.globalIndex}/100`} />
            <StatCard label="Indice pression" value={`${result.pressureIndex}/100`} />
            <StatCard label="Indice stabilité" value={`${result.stabilityIndex}/100`} />
            <StatCard label="Type cognitif probable" value={result.mbtiType} />
          </div>

          <div style={{ marginTop: 18, ...noteStyle }}>
            Profil principal : <strong>{result.profiles[0].name}</strong> — Profil secondaire :{' '}
            <strong>{result.profiles[1].name}</strong> — Préférence motrice associée :{' '}
            <strong>{result.motor}</strong>
          </div>
        </Card>

        <Card>
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
        </Card>

        <Card>
          <h2 style={sectionTitleStyle}>Axes prioritaires de progression</h2>

          <ul style={reportListStyle}>
            {result.lowDims.map(([key, score]) => (
              <li key={key}>
                <strong>{PMP_DIMENSIONS[key as keyof typeof PMP_DIMENSIONS].label}</strong> — {score}
                /100
              </li>
            ))}
          </ul>
        </Card>

        {error ? <div style={errorBoxStyle}>{error}</div> : null}

        <div style={{ display: 'grid', gap: 14 }}>
          <button
            type="button"
            onClick={handleSubmitFinal}
            disabled={submitting}
            style={{
              ...primaryButtonStyleAsButton,
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
            style={secondaryButtonStyleAsButton}
          >
            Revenir au questionnaire
          </button>
        </div>
      </div>
    </main>
  )
}

function Hero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}) {
  return (
    <section style={heroStyle}>
      <img src="/logo-a4p.png" alt="Académie de Performances" style={heroLogoStyle} />
      <div style={heroEyebrowStyle}>{eyebrow}</div>
      <h1 style={heroTitleStyle}>
        {title.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            {index < title.split('\n').length - 1 ? <br /> : null}
          </span>
        ))}
      </h1>
      <p style={heroTextStyle}>{text}</p>
    </section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <section style={cardStyle}>{children}</section>
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label style={{ display: 'grid', gap: 10 }}>
      <span style={{ color: '#22366c', fontSize: 18, fontWeight: 800 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
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

const deniedTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.1,
  fontWeight: 900,
  color: '#22366c',
}

const deniedTextStyle: React.CSSProperties = {
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

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 18,
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

const noteStyle: React.CSSProperties = {
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
  cursor: 'pointer',
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
  fontSize: 22,
  fontWeight: 900,
  cursor: 'pointer',
}

const loadingMainStyle: React.CSSProperties = {
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

const progressWrapStyle: React.CSSProperties = {
  marginBottom: 20,
}

const progressTrackStyle: React.CSSProperties = {
  width: '100%',
  height: 16,
  borderRadius: 999,
  background: '#e6edf8',
  overflow: 'hidden',
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

const questionDescriptionStyle: React.CSSProperties = {
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

const reportListStyle: React.CSSProperties = {
  margin: '18px 0 0',
  paddingLeft: 24,
  color: '#5d6b8a',
  fontSize: 21,
  lineHeight: 1.9,
}
