'use client'

import { useState } from 'react'
import { CMP_QUESTIONS } from '@/lib/cmp'

type Props = {
  mode: 'individual' | 'club'
  token?: string
  clubId?: string
  teamId?: string
}

export default function CMPForm({ mode, token, clubId, teamId }: Props) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/cmp/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, token, clubId, teamId, firstname, lastname, email, answers })
    })

    const data = await res.json()
    setLoading(false)
    if (!res.ok) return alert(data.error || 'Erreur')
    setResult(data)
  }

  return (
    <div className="split">
      <form onSubmit={onSubmit} className="form">
        <div className="card">
          <h2>Identification</h2>
          <input value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Prénom" required />
          <input value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Nom" required />
          {mode === 'individual' ? (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          ) : null}
        </div>

        <div className="card">
          <h2>Questionnaire CMP</h2>
          {CMP_QUESTIONS.map((q) => (
            <div key={q.id} className="question-block">
              <p>{q.text}</p>
              <div className="likert">
                {[1,2,3,4,5].map((n) => (
                  <label key={n}>
                    <input type="radio" name={q.id} checked={answers[q.id] === n} onChange={() => setAnswer(q.id, n)} required /> {n}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Valider le CMP'}</button>
        </div>
      </form>

      <div className="card">
        <h2>Résultat</h2>
        {!result ? <p className="small">Le résultat s’affichera ici après validation.</p> : (
          <>
            <p><strong>Score global :</strong> {result.score_global}/100</p>
            <p><strong>Profil :</strong> {result.profile_name}</p>
            <pre className="codebox">{JSON.stringify(result.dimensions, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  )
}
