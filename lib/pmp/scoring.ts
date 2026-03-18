import { PMP_QUESTIONS } from './questions'

export type PMPAthlete = {
  name?: string
  age?: string
  sport?: string
  club?: string
}

export type PMPAnswers = Record<string, number | string>

// ⚠️ EXPORT IMPORTANT (c'était probablement le problème)
export function computePmpResults(
  athlete: PMPAthlete,
  answers: PMPAnswers
) {
  const dimensions = [
    'activation',
    'attention',
    'regulation',
    'engagement',
    'confiance',
    'resilience',
    'cognition',
    'motricite',
  ]

  const scores: Record<string, number> = {}

  dimensions.forEach((dim) => {
    const questions = PMP_QUESTIONS.filter(
      (q: any) => q.type === 'likert' && q.dimension === dim
    )

    const total = questions.reduce((sum: number, q: any) => {
      let val = Number(answers[q.id] || 0)

      if (q.reverse) {
        val = 6 - val
      }

      return sum + val
    }, 0)

    scores[dim] = Math.round((total / (questions.length * 5)) * 100)
  })

  // Score global simple (safe build)
  const globalIndex = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / dimensions.length
  )

  return {
    athlete,
    scores,
    globalIndex,
  }
}
