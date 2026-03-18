import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const accessCode = String(body?.accessCode || '').trim()

    if (!email || !accessCode) {
      return NextResponse.json(
        { ok: false, message: 'Email et code d’accès requis.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, message: 'Configuration Supabase incomplète.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('individual_access')
      .select(
        `
          id,
          email,
          access_code,
          full_name,
          access_enabled,
          pmp_allowed,
          psycho_allowed,
          cmp_allowed,
          pmp_completed,
          psycho_completed,
          cmp_completed
        `
      )
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: 'Accès introuvable.' },
        { status: 401 }
      )
    }

    if (!data.access_enabled) {
      return NextResponse.json(
        { ok: false, message: 'Accès désactivé. Contactez A4P.' },
        { status: 403 }
      )
    }

    if (data.access_code !== accessCode) {
      return NextResponse.json(
        { ok: false, message: 'Code d’accès invalide.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      ok: true,
      redirectTo: '/individuel/espace',
    })

    response.cookies.set('a4p_individual_email', data.email, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })

    response.cookies.set('a4p_individual_code', data.access_code, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
