import { MBTI_TO_MOTOR, MOTOR_FAMILIES, PMP_DIMENSIONS, PMP_PROFILES } from './config'
import { PMP_QUESTIONS, type PMPQuestion } from './questions'

export type PMPAnswers = Record<string, number | 'A' | 'B'>

export type PMPResult = {
  scores: Record<string, number>
  mbtiType: string
  motor: string
  motorFamily: string
  globalIndex: number
  pressureIndex: number
  stabilityIndex: number
  profiles: Array<{ name: string; value: number }>
  learningStyle: string
  coherenceIndex: number
  lowDims: Array<[string, number]>
  highDims: Array<[string, number]>
  globalBand: string
}

type PMPLikertQuestion = Extract<PMPQuestion, { type: 'likert' }>
type PMPBinaryQuestion = Extract<PMPQuestion, { type: 'binary' }>

function isLikertQuestion(question: PMPQuestion): question is PMPLikertQuestion {
  return question.type === 'likert'
}

function isBinaryQuestion(question: PMPQuestion): question is PMPBinaryQuestion {
  return question.type === 'binary'
}

export function computePMPResults(answers: PMPAnswers): PMPResult {
  const scores: Record<string, number> = {}
  const dims = Object.keys(PMP_DIMENSIONS)

  dims.forEach((key) => {
    const items = PMP_QUESTIONS.filter(
      (q): q is PMPLikertQuestion => isLikertQuestion(q) && q.dimension === key
    )

    const total = items.reduce((sum, q) => {
      let val = Number(answers[q.id] || 0)
      if (q.reverse) val = 6 - val
      return sum + val
    }, 0)

    scores[key] = Math.round((total / (items.length * 5)) * 100)
  })

  const axisScores = { ei: 0, sn: 0, tf: 0, jp: 0 }

  PMP_QUESTIONS.filter(isBinaryQuestion).forEach((q) => {
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
  const motorFamily = motor !== '—' ? MOTOR_FAMILIES[motor[0]] || '—' : '—'

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
        profileDims.reduce((s, d) => s + scores[d], 0) / profileDims.length
      ),
    }))
    .sort((a, b) => b.value - a.value)

  const learning = [
    ['Analytique', Math.round((scores.cognition + scores.attention) / 2)],
    ['Expérientiel', Math.round((scores.motricite + scores.activation) / 2)],
    ['Compétitif', Math.round((scores.engagement + scores.activation) / 2)],
    ['Méthodique', Math.round((scores.attention + scores.motricite) / 2)],
  ].sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as string

  let coherenceIndex = Math.round((scores.motricite + scores.cognition) / 2)
  if (['R', 'C'].includes(motor[0]) && scores.cognition >= 60) coherenceIndex += 8
  if (['D', 'G'].includes(motor[0]) && scores.attention >= 60) coherenceIndex += 5
  coherenceIndex = Math.max(30, Math.min(96, coherenceIndex))

  const lowDims = Object.entries(scores).sort((a, b) => a[1] - b[1]).slice(0, 3)
  const highDims = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const globalBand =
    globalIndex >= 80
      ? 'mental performant'
      : globalIndex >= 65
      ? 'mental solide'
      : globalIndex >= 50
      ? 'mental en développement'
      : 'mental fragile'

  return {
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
    globalBand,
  }
}
