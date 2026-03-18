import { PMP_QUESTIONS } from './questions'

export type PMPAthlete = {
  name?: string
  age?: string
  sport?: string
  club?: string
}

export type PMPAnswers = Record<string, number | string>

export const PMP_DIMENSIONS = {
  activation: {
    label: 'Activation',
    description: "Capacité à mobiliser son énergie mentale avant et pendant la performance.",
    low: "Peut traduire un démarrage lent, une prudence excessive ou une difficulté à entrer pleinement dans le défi.",
    high: "Traduit souvent une bonne capacité à se mettre rapidement en action et à élever son niveau d'intensité.",
  },
  attention: {
    label: 'Attention',
    description: "Capacité à rester focalisé sur l'essentiel malgré les distractions.",
    low: "Peut indiquer une dispersion, une difficulté à revenir dans l'instant ou à tenir son repère.",
    high: 'Traduit souvent une bonne concentration et une capacité à se refocaliser rapidement.',
  },
  regulation: {
    label: 'Régulation',
    description: 'Capacité à gérer ses émotions et sa tension intérieure.',
    low: 'Peut signaler une sensibilité marquée au stress, à la frustration ou à l’erreur.',
    high: 'Traduit souvent une stabilité émotionnelle utile dans les moments exigeants.',
  },
  engagement: {
    label: 'Engagement',
    description: "Capacité à rester impliqué, volontaire et mobilisé dans l'effort.",
    low: 'Peut signaler un décrochage intérieur lorsque la difficulté augmente.',
    high: 'Traduit une forte implication et une présence mentale durable.',
  },
  confiance: {
    label: 'Confiance',
    description: 'Croyance en ses capacités à répondre présent et à progresser.',
    low: 'Peut révéler du doute, une fragilité sous pression ou une dépendance trop forte au résultat.',
    high: 'Traduit une solidité intérieure et un appui mobilisable dans les moments importants.',
  },
  resilience: {
    label: 'Résilience',
    description: "Capacité à rebondir après l'erreur, l'échec ou le contretemps.",
    low: 'Peut montrer une tendance à ruminer et à rester bloqué après un passage difficile.',
    high: 'Traduit une capacité à repartir, apprendre et se reconstruire dans l’action.',
  },
  cognition: {
    label: 'Cognition',
    description: 'Capacité à comprendre, analyser, anticiper et décider avec lucidité.',
    low: 'Peut traduire une lecture tardive de la situation ou un manque de recul stratégique.',
    high: 'Traduit une bonne clarté mentale et une lecture efficace des situations.',
  },
  motricite: {
    label: 'Motricité',
    description: 'Capacité à ressentir, organiser et ajuster le mouvement.',
    low: 'Peut signaler peu de repères corporels ou une difficulté à sentir l’ajustement juste.',
    high: 'Traduit un lien fin entre sensation, geste et efficacité.',
  },
} as const

export const MBTI_TO_MOTOR: Record<string, string> = {
  ESTP: 'D1',
  ISTP: 'D2',
  ESTJ: 'D3',
  ISTJ: 'D4',
  ESFP: 'G1',
  ISFP: 'G2',
  ESFJ: 'G3',
  ISFJ: 'G4',
  ENFP: 'R1',
  INFP: 'R2',
  ENFJ: 'R3',
  INFJ: 'R4',
  ENTP: 'C1',
  INTP: 'C2',
  ENTJ: 'C3',
  INTJ: 'C4',
}

export const PMP_PROFILES: Record<string, string[]> = {
  Compétiteur: ['activation', 'engagement', 'confiance'],
  Stratège: ['cognition', 'attention', 'regulation'],
  Créatif: ['cognition', 'activation', 'motricite'],
  Régulateur: ['regulation', 'attention', 'resilience'],
  Endurant: ['resilience', 'engagement', 'confiance'],
  Méthodique: ['attention', 'motricite', 'cognition'],
}

export function pmpScoreBand(score: number) {
  if (score >= 80) return 'force mentale'
  if (score >= 60) return 'zone solide'
  if (score >= 40) return 'zone moyenne'
  return 'zone de travail'
}

export function computePmpResults(athlete: PMPAthlete, answers: PMPAnswers) {
  const dims = Object.keys(PMP_DIMENSIONS) as Array<keyof typeof PMP_DIMENSIONS>
  const scores: Record<string, number> = {}

  dims.forEach((key) => {
    const items = PMP_QUESTIONS.filter(
      (q) => q.type === 'likert' && q.dimension === key
    )

    const total = items.reduce((sum, q) => {
      let val = Number(answers[q.id] || 0)
      if (q.reverse) val = 6 - val
      return sum + val
    }, 0)

    scores[key] = Math.round((total / (items.length * 5)) * 100)
  })

  const axisScores = { ei: 0, sn: 0, tf: 0, jp: 0 }

  PMP_QUESTIONS.filter((q) => q.type === 'binary').forEach((q) => {
    const ans = answers[q.id]
    if (ans === 'A') axisScores[q.axis] += 1
    if (ans === 'B') axisScores[q.axis] -= 1
  })

  const mbtiType =
    (axisScores.ei >= 0 ? 'E' : 'I') +
    (axisScores.sn >= 0 ? 'S' : 'N') +
    (axisScores.tf >= 0 ? 'T' : 'F') +
    (axisScores.jp >= 0 ? 'J' : 'P')

  const motor = MBTI_TO_MOTOR[mbtiType] || '—'
  const motorFamilies: Record<string, string> = { D: 'ST', G: 'SF', R: 'NF', C: 'NT' }
  const motorFamily = motor !== '—' ? motorFamilies[motor[0]] : '—'

  const globalIndex = Math.round(
    (scores.activation * 1 +
      scores.attention * 1.2 +
      scores.regulation * 1.3 +
      scores.engagement * 1 +
      scores.confiance * 1.2 +
      scores.resilience * 1 +
      scores.cognition * 0.9 +
      scores.motricite * 0.8) /
      8.4
  )

  const pressureIndex = Math.round(
    scores.regulation * 0.4 + scores.confiance * 0.3 + scores.resilience * 0.3
  )

  const stabilityIndex = Math.round(
    (scores.regulation + scores.attention + scores.resilience) / 3
  )

  const profiles = Object.entries(PMP_PROFILES)
    .map(([name, profileDims]) => ({
      name,
      value: Math.round(
        profileDims.reduce((sum, dim) => sum + scores[dim], 0) / profileDims.length
      ),
    }))
    .sort((a, b) => b.value - a.value)

  const learning = [
    ['Analytique', Math.round((scores.cognition + scores.attention) / 2)],
    ['Expérientiel', Math.round((scores.motricite + scores.activation) / 2)],
    ['Compétitif', Math.round((scores.engagement + scores.activation) / 2)],
    ['Méthodique', Math.round((scores.attention + scores.motricite) / 2)],
  ].sort((a, b) => b[1] - a[1])[0][0]

  let coherenceIndex = Math.round((scores.motricite + scores.cognition) / 2)
  if (['R', 'C'].includes(motor[0]) && scores.cognition >= 60) coherenceIndex += 8
  if (['D', 'G'].includes(motor[0]) && scores.attention >= 60) coherenceIndex += 5
  coherenceIndex = Math.max(30, Math.min(96, coherenceIndex))

  const lowDims = Object.entries(scores).sort((a, b) => a[1] - b[1]).slice(0, 3)
  const highDims = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return {
    athlete: {
      name: athlete.name || 'Sportif A4P',
      age: athlete.age || '',
      sport: athlete.sport || '',
      club: athlete.club || '',
    },
    scores,
    mbtiType,
    motor,
    motorFamily,
    globalIndex,
    pressureIndex,
    stabilityIndex,
    profiles,
    learningStyle: learning,
    coherenceIndex,
    lowDims,
    highDims,
    globalBand:
      globalIndex >= 80
        ? 'mental performant'
        : globalIndex >= 65
        ? 'mental solide'
        : globalIndex >= 50
        ? 'mental en développement'
        : 'mental fragile',
  }
}
