import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computePmpResults } from '@/lib/pmp/scoring'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type JsonRecord = Record<string, unknown>

function asText(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text.length ? text : null
}

function asInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : null
}

function asJson(value: unknown): JsonRecord | unknown[] | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'object') return value as JsonRecord | unknown[]
  return null
}

function pickString(obj: any, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = obj?.[key]
    const text = asText(value)
    if (text) return text
  }
  return null
}

function pickNumber(obj: any, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = obj?.[key]
    const num = asInt(value)
    if (num !== null) return num
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, message: 'Variables Supabase manquantes.' },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => null)

    const userId = String(body?.userId || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const athlete = body?.athlete || {}
    const answers = body?.answers || {}

    if (!userId || !email) {
      return NextResponse.json(
        { ok: false, message: 'Session individuelle introuvable.' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: user, error: userError } = await supabase
      .from('users_individual')
      .select('*')
      .eq('id', userId)
      .eq('email', email)
      .eq('has_access', true)
      .maybeSingle()

    if (userError) {
      return NextResponse.json(
        { ok: false, message: 'Erreur technique de vérification.' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Accès individuel introuvable.' },
        { status: 404 }
      )
    }

    if (user.pmp_passed && !user.is_admin) {
      return NextResponse.json(
        { ok: false, message: 'Le PMP a déjà été validé pour ce compte.' },
        { status: 409 }
      )
    }

    const result: any = computePmpResults(athlete, answers)
    const now = new Date().toISOString()

    const athleteName =
      pickString(result, 'athlete_name') ||
      pickString(result?.athlete, 'name', 'fullName') ||
      pickString(athlete, 'name', 'fullName') ||
      user.email

    const athleteAge =
      pickString(result, 'athlete_age') ||
      pickString(result?.athlete, 'age') ||
      pickString(athlete, 'age')

    const athleteSport =
      pickString(result, 'athlete_sport') ||
      pickString(result?.athlete, 'sport') ||
      pickString(athlete, 'sport')

    const athleteClub =
      pickString(result, 'athlete_club') ||
      pickString(result?.athlete, 'club') ||
      pickString(athlete, 'club')

    const scoreGlobal =
      pickNumber(result, 'score_global', 'global_score', 'globalScore') ??
      pickNumber(result?.scores, 'global', 'overall')

    const decisionStyle = pickString(
      result,
      'decision_style',
      'decisionStyle'
    )

    const focusMode = pickString(result, 'focus_mode', 'focusMode')

    const strengths =
      pickString(result, 'strengths') ||
      (Array.isArray(result?.strengths) ? result.strengths.join(' • ') : null)

    const vigilancePoints =
      pickString(result, 'vigilance_points', 'vigilancePoints') ||
      (Array.isArray(result?.vigilancePoints)
        ? result.vigilancePoints.join(' • ')
        : null)

    const globalBand = pickString(result, 'global_band', 'globalBand')

    const globalIndex = pickNumber(result, 'global_index', 'globalIndex')
    const pressureIndex = pickNumber(result, 'pressure_index', 'pressureIndex')
    const stabilityIndex = pickNumber(result, 'stability_index', 'stabilityIndex')
    const coherenceIndex = pickNumber(result, 'coherence_index', 'coherenceIndex')

    const mbtiType = pickString(result, 'mbti_type', 'mbtiType')
    const motor = pickString(result, 'motor')
    const motorFamily = pickString(result, 'motor_family', 'motorFamily')
    const learningStyle = pickString(result, 'learning_style', 'learningStyle')

    const scoresJson = asJson((result as any)?.scores)
    const profilesJson = asJson((result as any)?.profiles)
    const lowDimsJson =
      asJson((result as any)?.low_dims) || asJson((result as any)?.lowDims)
    const highDimsJson =
      asJson((result as any)?.high_dims) || asJson((result as any)?.highDims)

    const insertPayload = {
      user_id: user.id,
      email: user.email,
      athlete_name: athleteName,
      athlete_age: athleteAge,
      athlete_sport: athleteSport,
      athlete_club: athleteClub,
      score_global: scoreGlobal,
      decision_style: decisionStyle,
      focus_mode: focusMode,
      strengths,
      vigilance_points: vigilancePoints,
      global_band: globalBand,
      scores: scoresJson,
      profiles: profilesJson,
      low_dims: lowDimsJson,
      high_dims: highDimsJson,
      answers: asJson(answers),
      mbti_type: mbtiType,
      motor,
      motor_family: motorFamily,
      learning_style: learningStyle,
      coherence_index: coherenceIndex,
      stability_index: stabilityIndex,
      global_index: globalIndex,
      pressure_index: pressureIndex,
      result_json: asJson(result),
      answers_json: asJson(answers),
      updated_at: now,
    }

    const { error: insertError } = await supabase
      .from('pmp_results')
      .insert(insertPayload)

    if (insertError) {
      console.error('pmp_results insert error:', insertError)
      return NextResponse.json(
        { ok: false, message: 'Impossible de sauvegarder le résultat PMP.' },
        { status: 500 }
      )
    }

    const shouldLockPmp = !user.is_admin

    const { data: updatedUser, error: updateError } = await supabase
      .from('users_individual')
      .update({
        pmp_passed: shouldLockPmp ? true : user.pmp_passed,
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('users_individual update error:', updateError)
      return NextResponse.json(
        { ok: false, message: 'Impossible de verrouiller le PMP.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        has_access: updatedUser.has_access,
        is_admin: updatedUser.is_admin,
        pmp_passed: updatedUser.pmp_passed,
        psycho_passed: updatedUser.psycho_passed,
        cmp_passed: updatedUser.cmp_passed,
      },
      result,
    })
  } catch (error) {
    console.error('individual-pmp-submit fatal error:', error)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
