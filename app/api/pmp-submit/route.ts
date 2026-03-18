import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computePmpResults } from '@/lib/pmp/scoring'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

    if (user.pmp_passed) {
      return NextResponse.json(
        { ok: false, message: 'Le PMP a déjà été validé pour ce compte.' },
        { status: 409 }
      )
    }

    const result = computePmpResults(athlete, answers)

    const { error: resultError } = await supabase
      .from('pmp_results')
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          athlete_name: result.athlete.name,
          athlete_age: result.athlete.age,
          athlete_sport: result.athlete.sport,
          athlete_club: result.athlete.club,
          result_json: result,
          answers_json: answers,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (resultError) {
      return NextResponse.json(
        { ok: false, message: 'Impossible de sauvegarder le résultat PMP.' },
        { status: 500 }
      )
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users_individual')
      .update({ pmp_passed: true })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
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
        pmp_passed: updatedUser.pmp_passed,
        psycho_passed: updatedUser.psycho_passed,
        cmp_passed: updatedUser.cmp_passed,
      },
      result,
    })
  } catch (error) {
    console.error('pmp-submit fatal error:', error)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
