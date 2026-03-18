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
    const email = String(body?.email || '').trim().toLowerCase()
    const accessCode = String(body?.accessCode || '').trim()

    if (!email || !accessCode) {
      return NextResponse.json(
        { ok: false, message: 'Email et code obligatoires.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data, error } = await supabase
      .from('users_individual')
      .select('*')
      .eq('email', email)
      .eq('access_code', accessCode)
      .eq('has_access', true)
      .maybeSingle()

    if (error) {
      console.error('individual-login query error:', error)
      return NextResponse.json(
        { ok: false, message: 'Erreur technique de vérification.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, message: 'Accès introuvable.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
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

    response.cookies.set('a4p_individual_session', JSON.stringify({
      id: data.id,
      email: data.email,
    }), {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('individual-login fatal error:', error)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
