import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Answers = Record<string, number>

function normalizeScore(values: number[]) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(((avg - 1) / 4) * 100)
}

function computeCMP(answers: Answers) {
  const confidenceKeys = ['q1', 'q2', 'q3', 'q4']
  const regulationKeys = ['q5', 'q6', 'q7', 'q8']
  const engagementKeys = ['q9', 'q10', 'q11', 'q12']
  const stabilityKeys = ['q13', 'q14', 'q15', 'q16']

  const confiance = normalizeScore(confidenceKeys.map((k) => Number(answers[k] ?? 0)))
  const regulation = normalizeScore(regulationKeys.map((k) => Number(answers[k] ?? 0)))
  const engagement = normalizeScore(engagementKeys.map((k) => Number(answers[k] ?? 0)))
  const stabilite = normalizeScore(stabilityKeys.map((k) => Number(answers[k] ?? 0)))

  const score_global = Math.round((confiance + regulation + engagement + stabilite) / 4)

  let profile_code = 'CMP-4'
  let profile_name = 'Fonctionnement mental intermédiaire'
  let summary = 'Le profil présente un socle mental exploitable avec des axes de progression identifiables.'

  if (engagement >= 70 && regulation < 60) {
    profile_code = 'CMP-2'
    profile_name = 'Mobilisation forte mais régulation fluctuante'
    summary =
      "L’énergie mentale est présente et l’engagement est fort, mais certaines situations de pression provoquent des fluctuations émotionnelles qui perturbent la stabilité."
  } else if (score_global >= 75) {
    profile_code = 'CMP-1'
    profile_name = 'Compétences mentales solides'
    summary =
      "Le profil présente une base mentale robuste, mobilisable dans l’action et globalement stable sous pression."
  } else if (confiance < 55) {
    profile_code = 'CMP-3'
    profile_name = 'Engagement présent mais confiance fragile'
    summary =
      "Le sujet s’implique, mais le doute et la vulnérabilité de confiance limitent parfois l’expression du potentiel."
  }

  return {
    score_global,
    dimensions: {
      confiance,
      regulation,
      engagement,
      stabilite
    },
    profile_code,
    profile_name,
    summary
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const firstname = String(body.firstname ?? '').trim()
    const lastname = String(body.lastname ?? '').trim()
    const email = String(body.email ?? '').trim()
    const answers = body.answers as Answers

    if (!firstname || !lastname || !email || !answers) {
      return NextResponse.json(
        { ok: false, error: 'Données incomplètes.' },
        { status: 400 }
      )
    }

    const result = computeCMP(answers)

    const { error } = await supabase.from('tests').insert({
      module: 'CMP',
      player_firstname: firstname,
      player_lastname: lastname,
      score_global: result.score_global,
      dimensions: result.dimensions,
      profile_code: result.profile_code,
      profile_name: result.profile_name
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur serveur inconnue'
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
