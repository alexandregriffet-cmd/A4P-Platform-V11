'use client'
import { useState } from 'react'

const QUESTIONS = [
  { id: 'q1', text: 'Je crois en ma capacité à réussir même sous pression.', dimension: 'confiance' },
  { id: 'q2', text: 'Je reste confiant même après une erreur.', dimension: 'confiance' },
  { id: 'q3', text: 'Je me sens capable de relever les défis sportifs.', dimension: 'confiance' },
  { id: 'q4', text: 'Je doute rarement de mes capacités.', dimension: 'confiance' },
  { id: 'q5', text: 'Je sais calmer mes émotions avant une compétition.', dimension: 'regulation' },
  { id: 'q6', text: 'Je reste lucide quand la pression augmente.', dimension: 'regulation' },
  { id: 'q7', text: 'Je garde le contrôle de mes réactions.', dimension: 'regulation' },
  { id: 'q8', text: 'Je me recentre rapidement après une erreur.', dimension: 'regulation' },
  { id: 'q9', text: 'Je donne le maximum à l’entraînement.', dimension: 'engagement' },
  { id: 'q10', text: 'Je reste impliqué même quand c’est difficile.', dimension: 'engagement' },
  { id: 'q11', text: 'Je cherche constamment à progresser.', dimension: 'engagement' },
  { id: 'q12', text: 'Je suis prêt à faire des efforts pour atteindre mes objectifs.', dimension: 'engagement' },
  { id: 'q13', text: 'Ma performance est généralement constante.', dimension: 'stabilite' },
  { id: 'q14', text: 'Je reste concentré sur la durée.', dimension: 'stabilite' },
  { id: 'q15', text: 'Je garde mon niveau même dans les moments difficiles.', dimension: 'stabilite' },
  { id: 'q16', text: 'Je reste stable mentalement pendant toute la compétition.', dimension: 'stabilite' }
]

type Props = { token: string; teamId: string; clubId: string }

export default function CMPQuestionnaire({ token, teamId, clubId }: Props) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/cmp/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, teamId, clubId, firstname, lastname, answers })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return alert(data.error || 'Erreur')
    alert(`Résultat enregistré. Score : ${data.score_global}`)
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Identification joueur</h2>
      <input value={firstname} onChange={(e)=>setFirstname(e.target.value)} placeholder="Prénom" required />
      <input value={lastname} onChange={(e)=>setLastname(e.target.value)} placeholder="Nom" required />
      <h2>Questionnaire CMP</h2>
      {QUESTIONS.map((q) => (
        <div key={q.id} className="question-block">
          <p>{q.text}</p>
          <div className="likert">
            {[1,2,3,4,5].map((n) => (
              <label key={n}>
                <input type="radio" name={q.id} value={n} checked={answers[q.id] === n} onChange={() => setAnswer(q.id, n)} required />
                {n}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Valider le CMP'}</button>
    </form>
  )
}
