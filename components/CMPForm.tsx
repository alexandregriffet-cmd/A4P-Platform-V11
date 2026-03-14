'use client'

import { useState } from 'react'
import { CMP_QUESTIONS } from '@/lib/cmp-questions'

type Props = {
  mode: 'individual' | 'club'
  token?: string
  clubId?: string
  teamId?: string
}

type ResultType = {
  score_global: number
  dimensions: {
    confiance: number
    regulation: number
    engagement: number
    stabilite: number
  }
  profile_code: string
  profile_name: string
  summary: string
}

export default function CMPForm({ mode, token, clubId, teamId }: Props) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultType | null>(null)

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/cmp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          token,
          clubId,
          teamId,
          firstname,
          lastname,
          email,
          answers
        })
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        alert(data.error || 'Erreur lors de la soumission.')
        return
      }

      setResult(data.result)
    } catch (error) {
      alert('Erreur réseau ou serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="split">
      <form onSubmit={handleSubmit} className="stack">
        <div className="card">
          <h2>Identification</h2>
          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="Prénom"
            required
          />
          <input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Nom"
            required
          />
          {mode === 'individual' ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          ) : null}
        </div>

        <div className="card">
          <h2>Questionnaire CMP</h2>

          {CMP_QUESTIONS.map((q) => (
            <div key={q.id} className="qcard">
              <p>{q.text}</p>
              <div className="likert">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === n}
                      onChange={() => setAnswer(q.id, n)}
                      required
                    />
                    <span>{n}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Valider le CMP'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2>Résultat</h2>
        {!result ? (
          <p className="small">Le résultat s’affichera ici après validation.</p>
        ) : (
          <>
            <p>
              <strong>Score global :</strong> {result.score_global}/100
            </p>
            <p>
              <strong>Profil :</strong> {result.profile_name}
            </p>
            <p>{result.summary}</p>
            <pre className="codebox">
              {JSON.stringify(result.dimensions, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  )
}
