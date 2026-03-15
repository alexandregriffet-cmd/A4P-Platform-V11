import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabaseServer'

const DIMENSIONS = {
  confiance: ['q1', 'q2', 'q3', 'q4'],
  regulation: ['q5', 'q6', 'q7', 'q8'],
  engagement: ['q9', 'q10', 'q11', 'q12'],
  stabilite: ['q13', 'q14', 'q15', 'q16']
}

function average(values: number[]) {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

function normalizeLikert(v: number) {
  return Math.round(((v - 1) / 4) * 100)
}

function computeScores(answers: Record<string, number>) {
  const dimensions = Object.fromEntries(
    Object.entries(DIMENSIONS).map(([key, ids]) => {
      const values = ids.map((id) => normalizeLikert(Number(answers[id] || 1)))
      return [key, average(values)]
    })
  ) as Record<string, number>

  const score_global = average(Object.values(dimensions))
  return { dimensions, score_global }
}

function chooseProfile(dimensions: Record<string, number>, global: number) {
  if (global >= 70 && dimensions.confiance >= 65 && dimensions.regulation >= 65 && dimensions.engagement >= 65 && dimensions.stabilite >= 65) {
    return { code: 'CMP-1', name: 'Socle mental solide et mobilisable' }
  }
  if (dimensions.engagement >= 70 && dimensions.regulation < 60) {
    return { code: 'CMP-2', name: 'Mobilisation forte mais régulation fluctuante' }
  }
  if (dimensions.engagement >= 60 && dimensions.confiance < 60) {
    return { code: 'CMP-3', name: 'Potentiel engagé mais confiance fragile' }
  }
  if (global < 50 || (dimensions.confiance < 50 && dimensions.regulation < 50)) {
    return { code: 'CMP-5', name: 'Base mentale en construction' }
  }
  return { code: 'CMP-4', name: 'Fonctionnement mental irrégulier' }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase()
    const body = await req.json()
    const { token, teamId, clubId, firstname, lastname, answers } = body

    if (!token || !teamId || !clubId || !firstname || !lastname || !answers) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data: passation } = await supabase.from('passations').select('*').eq('token', token).eq('status', 'active').single()
    if (!passation) {
      return NextResponse.json({ error: 'Passation invalide' }, { status: 404 })
    }

    const { dimensions, score_global } = computeScores(answers)
    const profile = chooseProfile(dimensions, score_global)

    const { error } = await supabase.from('tests').insert({
      club_id: clubId,
      team_id: teamId,
      passation_id: passation.passation_id,
      module: 'CMP',
      score_global,
      dimensions,
      profile_code: profile.code,
      profile_name: profile.name,
      player_firstname: firstname,
      player_lastname: lastname
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, score_global, dimensions, profile_code: profile.code, profile_name: profile.name })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
