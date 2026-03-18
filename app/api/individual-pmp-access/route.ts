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

    let query = supabase
      .from('users_individual')
      .select('*')
      .eq('has_access', true)

    if (userId) {
      query = query.eq('id', userId)
    } else {
      query = query.eq('email', email)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('individual-pmp-access query error:', error)
      return NextResponse.json(
        { ok: false, message: 'Erreur technique de vérification.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, message: 'Accès individuel introuvable.' },
        { status: 404 }
      )
    }

    if (data.pmp_passed) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Le test PMP a déjà été réalisé pour ce compte.',
          user: {
            id: data.id,
            email: data.email,
            has_access: data.has_access,
            pmp_passed: data.pmp_passed,
            psycho_passed: data.psycho_passed,
            cmp_passed: data.cmp_passed,
          },
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        email: data.email,
        has_access: data.has_access,
        pmp_passed: data.pmp_passed,
        psycho_passed: data.psycho_passed,
        cmp_passed: data.cmp_passed,
      },
    })
  } catch (error) {
    console.error('individual-pmp-access fatal error:', error)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
