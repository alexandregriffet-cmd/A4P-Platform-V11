export const CMP_QUESTIONS = [
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
] as const

const DIMENSIONS = {
  confiance: ['q1', 'q2', 'q3', 'q4'],
  regulation: ['q5', 'q6', 'q7', 'q8'],
  engagement: ['q9', 'q10', 'q11', 'q12'],
  stabilite: ['q13', 'q14', 'q15', 'q16']
}

function normalizeLikert(v: number) {
  return Math.round(((v - 1) / 4) * 100)
}

function average(values: number[]) {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function computeCMP(answers: Record<string, number>) {
  const dimensions = Object.fromEntries(
    Object.entries(DIMENSIONS).map(([key, ids]) => [
      key,
      average(ids.map((id) => normalizeLikert(Number(answers[id] || 1))))
    ])
  ) as Record<string, number>

  const score_global = average(Object.values(dimensions))
  const profile = chooseCMPProfile(dimensions, score_global)

  return { dimensions, score_global, ...profile }
}

export function chooseCMPProfile(dimensions: Record<string, number>, global: number) {
  if (global >= 70 && Object.values(dimensions).every((v) => v >= 65)) {
    return { profile_code: 'CMP-1', profile_name: 'Socle mental solide et mobilisable' }
  }
  if (dimensions.engagement >= 70 && dimensions.regulation < 60) {
    return { profile_code: 'CMP-2', profile_name: 'Mobilisation forte mais régulation fluctuante' }
  }
  if (dimensions.engagement >= 60 && dimensions.confiance < 60) {
    return { profile_code: 'CMP-3', profile_name: 'Potentiel engagé mais confiance fragile' }
  }
  if (global < 50 || (dimensions.confiance < 50 && dimensions.regulation < 50)) {
    return { profile_code: 'CMP-5', profile_name: 'Base mentale en construction' }
  }
  return { profile_code: 'CMP-4', profile_name: 'Fonctionnement mental irrégulier' }
}
