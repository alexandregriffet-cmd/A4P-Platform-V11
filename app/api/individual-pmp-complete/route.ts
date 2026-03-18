import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { ok: false, message: 'Variables Supabase manquantes.' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null)
    const userId = String(body?.userId || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!userId && !email) {
      return NextResponse.json(
        { ok: false, message: 'Session individuelle introuvable.' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    let lookup = supabase
      .from('users_individual')
      .select('*')
      .eq('has_access', true)

    if (userId) {
      lookup = lookup.eq('id', userId)
    } else {
      lookup = lookup.eq('email', email)
    }

    const { data: existingUser, error: lookupError } = await lookup.maybeSingle()

    if (lookupError) {
      console.error('individual-pmp-complete lookup error:', lookupError)
      return NextResponse.json(
        { ok: false, message: 'Erreur technique de vérification.' },
        { status: 500 }
      )
    }

    if (!existingUser) {
      return NextResponse.json(
        { ok: false, message: 'Accès individuel introuvable.' },
        { status: 404 }
      )
    }

    if (existingUser.pmp_passed) {
      return NextResponse.json({
        ok: true,
        alreadyDone: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          has_access: existingUser.has_access,
          pmp_passed: existingUser.pmp_passed,
          psycho_passed: existingUser.psycho_passed,
          cmp_passed: existingUser.cmp_passed,
        },
      })
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users_individual')
      .update({ pmp_passed: true })
      .eq('id', existingUser.id)
      .select('*')
      .single()

    if (updateError) {
      console.error('individual-pmp-complete update error:', updateError)
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
    })
  } catch (error) {
    console.error('individual-pmp-complete fatal error:', error)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
