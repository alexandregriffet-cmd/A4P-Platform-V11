import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, accessCode } = await req.json()

    if (!email || !accessCode) {
      return NextResponse.json(
        { ok: false, message: 'Email et code d\'accès requis.' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('individual_access')
      .select(`
        id, email, full_name, access_enabled,
        pmp_allowed, psycho_allowed, cmp_allowed,
        pmp_completed, psycho_completed, cmp_completed,
        pmp_max_passages, pmp_passages_used,
        psycho_max_passages, psycho_passages_used,
        cmp_max_passages, cmp_passages_used
      `)
      .eq('email', email.trim().toLowerCase())
      .eq('access_code', accessCode.trim())
      .single()

    if (error || !user) {
      return NextResponse.json(
        { ok: false, message: 'Email ou code d\'accès incorrect.' },
        { status: 401 }
      )
    }

    if (!user.access_enabled) {
      return NextResponse.json(
        { ok: false, message: 'Votre accès est désactivé. Contactez A4P.' },
        { status: 403 }
      )
    }

    const tests = {
      pmp: {
        allowed: user.pmp_allowed,
        completed: user.pmp_completed,
        maxPassages: user.pmp_max_passages ?? 1,
        passagesUsed: user.pmp_passages_used ?? 0,
        canPass: user.pmp_allowed && (user.pmp_passages_used ?? 0) < (user.pmp_max_passages ?? 1),
      },
      psycho: {
        allowed: user.psycho_allowed,
        completed: user.psycho_completed,
        maxPassages: user.psycho_max_passages ?? 1,
        passagesUsed: user.psycho_passages_used ?? 0,
        canPass: user.psycho_allowed && (user.psycho_passages_used ?? 0) < (user.psycho_max_passages ?? 1),
      },
      cmp: {
        allowed: user.cmp_allowed,
        completed: user.cmp_completed,
        maxPassages: user.cmp_max_passages ?? 1,
        passagesUsed: user.cmp_passages_used ?? 0,
        canPass: user.cmp_allowed && (user.cmp_passages_used ?? 0) < (user.cmp_max_passages ?? 1),
      },
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        tests,
      },
    })
  } catch (err) {
    console.error('[individual-login]', err)
    return NextResponse.json(
      { ok: false, message: 'Erreur serveur. Merci de réessayer.' },
      { status: 500 }
    )
  }
}
