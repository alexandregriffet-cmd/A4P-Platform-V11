import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, resultData } = body

    if (!userId || !email || !resultData) {
      return NextResponse.json(
        { ok: false, message: 'Données manquantes.' },
        { status: 400 }
      )
    }

    // Vérifier les droits de passage
    const { data: access, error: accessError } = await supabase
      .from('individual_access')
      .select('pmp_allowed, pmp_max_passages, pmp_passages_used')
      .eq('id', userId)
      .single()

    if (accessError || !access) {
      return NextResponse.json(
        { ok: false, message: 'Utilisateur introuvable.' },
        { status: 404 }
      )
    }

    if (!access.pmp_allowed) {
      return NextResponse.json(
        { ok: false, message: 'Accès au test PMP non autorisé.' },
        { status: 403 }
      )
    }

    const passagesUsed = access.pmp_passages_used ?? 0
    const maxPassages = access.pmp_max_passages ?? 1

    if (passagesUsed >= maxPassages) {
      return NextResponse.json(
        { ok: false, message: `Nombre maximum de passages atteint (${maxPassages}/${maxPassages}).` },
        { status: 403 }
      )
    }

    // Enregistrer les résultats
    const { data: savedResult, error: saveError } = await supabase
      .from('pmp_results')
      .insert({
        email: email,
        athlete_name: resultData.athleteName ?? null,
        athlete_age: resultData.athleteAge ?? null,
        athlete_sport: resultData.athleteSport ?? null,
        athlete_club: resultData.athleteClub ?? null,
        profile_code: resultData.profileCode ?? null,
        profile_label: resultData.profileLabel ?? null,
        score_global: resultData.scoreGlobal ?? null,
        global_index: resultData.globalIndex ?? null,
        pressure_index: resultData.pressureIndex ?? null,
        stability_index: resultData.stabilityIndex ?? null,
        coherence_index: resultData.coherenceIndex ?? null,
        global_band: resultData.globalBand ?? null,
        mbti_type: resultData.mbtiType ?? null,
        motor: resultData.motor ?? null,
        motor_family: resultData.motorFamily ?? null,
        learning_style: resultData.learningStyle ?? null,
        decision_style: resultData.decisionStyle ?? null,
        focus_mode: resultData.focusMode ?? null,
        strengths: resultData.strengths ?? null,
        vigilance_points: resultData.vigilancePoints ?? null,
        scores: resultData.scores ?? null,
        profiles: resultData.profiles ?? null,
        low_dims: resultData.lowDims ?? null,
        high_dims: resultData.highDims ?? null,
        answers: resultData.answers ?? null,
        result_json: resultData.resultJson ?? null,
        answers_json: resultData.answersJson ?? null,
        raw_payload: resultData.rawPayload ?? null,
      })
      .select('id')
      .single()

    if (saveError) {
      return NextResponse.json(
        { ok: false, message: 'Erreur lors de la sauvegarde.' },
        { status: 500 }
      )
    }

    // Incrémenter le compteur
    await supabase
      .from('individual_access')
      .update({
        pmp_passages_used: passagesUsed + 1,
        pmp_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return NextResponse.json({
      ok: true,
      message: 'Résultats PMP enregistrés.',
      resultId: savedResult.id,
      passagesRemaining: maxPassages - (passagesUsed + 1),
    })

  } catch (err) {
    console.error('[save-pmp-result]', err)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
