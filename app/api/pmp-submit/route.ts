import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computePMPResults } from '@/lib/pmp/scoring'

export async function POST(req: NextRequest) {
  try {
    const cookieEmail = req.cookies.get('a4p_individual_email')?.value || ''
    const cookieCode = req.cookies.get('a4p_individual_code')?.value || ''

    if (!cookieEmail || !cookieCode) {
      return NextResponse.json(
        { ok: false, message: 'Session individuelle introuvable.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const answers = body?.answers || {}
    const athlete = body?.athlete || {}

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, message: 'Configuration Supabase incomplète.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: access, error: accessError } = await supabase
      .from('individual_access')
      .select('*')
      .eq('email', cookieEmail)
      .eq('access_code', cookieCode)
      .single()

    if (accessError || !access) {
      return NextResponse.json(
        { ok: false, message: 'Accès individuel invalide.' },
        { status: 401 }
      )
    }

    if (!access.access_enabled) {
      return NextResponse.json(
        { ok: false, message: 'Accès désactivé.' },
        { status: 403 }
      )
    }

    if (!access.pmp_allowed) {
      return NextResponse.json(
        { ok: false, message: 'PMP non autorisé pour ce compte.' },
        { status: 403 }
      )
    }

    if (access.pmp_completed) {
      return NextResponse.json(
        { ok: false, message: 'Le PMP a déjà été réalisé.' },
        { status: 409 }
      )
    }

    const result = computePMPResults(answers)

    const { error: insertError } = await supabase.from('pmp_results').upsert(
      {
        email: cookieEmail,
        athlete_name: athlete.name || access.full_name || '',
        athlete_age: athlete.age ? Number(athlete.age) : null,
        athlete_sport: athlete.sport || '',
        athlete_club: athlete.club || '',
        answers,
        scores: result.scores,
        mbti_type: result.mbtiType,
        motor: result.motor,
        motor_family: result.motorFamily,
        global_index: result.globalIndex,
        pressure_index: result.pressureIndex,
        stability_index: result.stabilityIndex,
        learning_style: result.learningStyle,
        coherence_index: result.coherenceIndex,
        profiles: result.profiles,
        high_dims: result.highDims,
        low_dims: result.lowDims,
        global_band: result.globalBand,
      },
      { onConflict: 'email' }
    )

    if (insertError) {
      return NextResponse.json(
        { ok: false, message: insertError.message },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from('individual_access')
      .update({ pmp_completed: true })
      .eq('email', cookieEmail)
      .eq('access_code', cookieCode)

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      redirectTo: '/individuel/pmp/resultat',
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur PMP.' },
      { status: 500 }
    )
  }
}
