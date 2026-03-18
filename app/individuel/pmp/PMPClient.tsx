'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PMP_QUESTIONS, type PMPQuestion } from '@/lib/pmp/questions'
import { PMP_DIMENSIONS } from '@/lib/pmp/config'

type Props = {
  fullName?: string
  email?: string
}

type Answers = Record<string, number | 'A' | 'B'>

export default function PMPClient({ fullName }: Props) {
  const router = useRouter()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [athlete, setAthlete] = useState({
    name: fullName || '',
    age: '',
    sport: '',
    club: '',
  })

  const currentQuestion = useMemo<PMPQuestion>(() => PMP_QUESTIONS[index], [index])
  const progress = Math.round(((index + 1) / PMP_QUESTIONS.length) * 100)

  function setAnswer(value: number | 'A' | 'B') {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function nextStep() {
    if (answers[currentQuestion.id] == null) {
      setErrorMessage('Merci de répondre avant de continuer.')
      return
    }
    setErrorMessage('')
    setIndex((prev) => Math.min(prev + 1, PMP_QUESTIONS.length - 1))
  }

  function prevStep() {
    setErrorMessage('')
    setIndex((prev) => Math.max(prev - 1, 0))
  }

  async function submitPMP() {
    if (answers[currentQuestion.id] == null) {
      setErrorMessage('Merci de répondre avant de finaliser.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/pmp-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, athlete }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setErrorMessage(data?.message || 'Impossible de finaliser le PMP.')
        setLoading(false)
        return
      }

      router.push(data.redirectTo || '/individuel/pmp/resultat')
      router.refresh()
    } catch {
      setErrorMessage('Impossible de finaliser le PMP.')
      setLoading(false)
    }
  }

  const selectedValue = answers[currentQuestion.id]

  const likertLabels = [
    '1 — Pas du tout d’accord',
    '2 — Plutôt pas d’accord',
    '3 — Mitigé',
    '4 — Plutôt d’accord',
    '5 — Tout à fait d’accord',
  ]

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '24px 18px 48px',
        color: '#1f3158',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 26,
            padding: '24px 20px 28px',
            boxShadow: '0 18px 48px rgba(31,49,88,0.14)',
            color: '#ffffff',
            marginBottom: 22,
          }}
        >
          <img
            src="/logo-a4p.png"
            alt="A4P"
            style={{
              width: 110,
              marginBottom: 12,
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
            PMP A4P sécurisé
          </div>

          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(28px, 6vw, 44px)',
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Profil Mental de Performance
          </h1>

          <p
            style={{
              margin: '0 0 14px 0',
              fontSize: 16,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            136 questions • 8 dimensions mentales • lecture cognitive et
            préférence motrice associée.
          </p>

          <div
            style={{
              height: 12,
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#ffffff',
              }}
            />
          </div>

          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700 }}>
            Question {index + 1} / {PMP_QUESTIONS.length} • {progress}%
          </div>
        </section>

        {index === 0 ? (
          <section
            style={{
              background: '#ffffff',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
              border: '1px solid #e3eaf5',
              marginBottom: 18,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 14,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              Informations du sportif
            </h2>

            <div
              style={{
                display: 'grid',
                gap: 14,
              }}
            >
              <input
                placeholder="Nom du sportif"
                value={athlete.name}
                onChange={(e) =>
                  setAthlete((prev) => ({ ...prev, name: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                placeholder="Âge"
                value={athlete.age}
                onChange={(e) =>
                  setAthlete((prev) => ({ ...prev, age: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                placeholder="Sport"
                value={athlete.sport}
                onChange={(e) =>
                  setAthlete((prev) => ({ ...prev, sport: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                placeholder="Club / structure"
                value={athlete.club}
                onChange={(e) =>
                  setAthlete((prev) => ({ ...prev, club: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
          </section>
        ) : null}

        <section
          style={{
            background: '#ffffff',
            borderRadius: 22,
            padding: 22,
            boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
            border: '1px solid #e3eaf5',
            marginBottom: 18,
          }}
        >
          {'dimension' in currentQuestion ? (
            <div
              style={{
                display: 'inline-block',
                marginBottom: 10,
                padding: '7px 11px',
                borderRadius: 999,
                background: '#eef3fb',
                color: '#1f3158',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {PMP_DIMENSIONS[currentQuestion.dimension].label}
            </div>
          ) : (
            <div
              style={{
                display: 'inline-block',
                marginBottom: 10,
                padding: '7px 11px',
                borderRadius: 999,
                background: '#eef3fb',
                color: '#1f3158',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Lecture cognitive
            </div>
          )}

          <h2
            style={{
              marginTop: 0,
              fontSize: 28,
              lineHeight: 1.35,
              fontWeight: 900,
            }}
          >
            {currentQuestion.text}
          </h2>

          {'dimension' in currentQuestion ? (
            <>
              <p style={{ color: '#5d6d89', lineHeight: 1.7, fontSize: 16 }}>
                {PMP_DIMENSIONS[currentQuestion.dimension].description}
              </p>

              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {likertLabels.map((label, i) => {
                  const value = i + 1
                  const selected = selectedValue === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswer(value)}
                      style={answerButtonStyle(selected)}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setAnswer('A')}
                style={answerButtonStyle(selectedValue === 'A')}
              >
                <strong>A</strong>
                <br />
                {currentQuestion.optionA}
              </button>

              <button
                type="button"
                onClick={() => setAnswer('B')}
                style={answerButtonStyle(selectedValue === 'B')}
              >
                <strong>B</strong>
                <br />
                {currentQuestion.optionB}
              </button>
            </div>
          )}
        </section>

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
              marginBottom: 16,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={prevStep}
            disabled={index === 0 || loading}
            style={secondaryButtonStyle(index === 0 || loading)}
          >
            Précédent
          </button>

          {index === PMP_QUESTIONS.length - 1 ? (
            <button
              type="button"
              onClick={submitPMP}
              disabled={loading}
              style={primaryButtonStyle(loading)}
            >
              {loading ? 'Finalisation...' : 'Finaliser le PMP →'}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              style={primaryButtonStyle(loading)}
            >
              Suivant →
            </button>
          )}
        </section>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px 16px',
  borderRadius: 14,
  border: '1px solid #d7e1f0',
  fontSize: 16,
  color: '#1f3158',
  background: '#f9fbff',
  boxSizing: 'border-box',
  outline: 'none',
}

function answerButtonStyle(selected: boolean): React.CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    padding: '16px 16px',
    borderRadius: 14,
    border: selected ? '2px solid #1f3158' : '1px solid #d7e1f0',
    background: selected ? '#eef3fb' : '#ffffff',
    color: '#1f3158',
    fontSize: 16,
    lineHeight: 1.6,
    cursor: 'pointer',
  }
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? '#8a96b3' : '#1f3158',
    color: '#ffffff',
    border: 'none',
    borderRadius: 14,
    padding: '16px 20px',
    fontWeight: 800,
    fontSize: 17,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 12px 28px rgba(31,49,88,0.16)',
  }
}

function secondaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: '#ffffff',
    color: disabled ? '#9aa6bf' : '#1f3158',
    border: '1px solid #d7e1f0',
    borderRadius: 14,
    padding: '16px 20px',
    fontWeight: 800,
    fontSize: 17,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}
