import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabaseServer'
import { getResendClient } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const resend = getResendClient()
    const to = process.env.RESULTS_EMAIL_TO || 'alexandre.griffet@yahoo.fr'
    const from = process.env.RESULTS_EMAIL_FROM || 'A4P Results <results@example.com>'

    const subject = data.source === 'club'
      ? `[Nouvelle passation club] ${data.module} — ${data.player_firstname} ${data.player_lastname}`
      : `[Nouveau test individuel] ${data.module} — ${data.player_firstname} ${data.player_lastname}`

    const html = `
      <h2>Résultat A4P</h2>
      <p><strong>Type :</strong> ${data.source}</p>
      <p><strong>Module :</strong> ${data.module}</p>
      <p><strong>Nom :</strong> ${data.player_firstname} ${data.player_lastname}</p>
      <p><strong>Email :</strong> ${data.player_email || '-'}</p>
      <p><strong>Club :</strong> ${data.club_id || '-'}</p>
      <p><strong>Équipe :</strong> ${data.team_id || '-'}</p>
      <p><strong>Score global :</strong> ${data.score_global}</p>
      <p><strong>Profil :</strong> ${data.profile_name}</p>
      <pre>${JSON.stringify(data.dimensions, null, 2)}</pre>
    `

    const res = await resend.emails.send({ to, from, subject, html })

    const supabase = createServerSupabase()
    await supabase.from('email_logs').insert({
      test_id: data.test_id,
      recipient_email: to,
      subject,
      status: 'sent',
      provider_message_id: (res.data as any)?.id || null,
      payload: data
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    try {
      const supabase = createServerSupabase()
      await supabase.from('email_logs').insert({
        recipient_email: process.env.RESULTS_EMAIL_TO || 'alexandre.griffet@yahoo.fr',
        subject: 'Erreur envoi résultat',
        status: 'error',
        payload: { message: e?.message || 'Erreur inconnue' }
      })
    } catch {}

    return NextResponse.json({ error: e?.message || 'Erreur email.' }, { status: 500 })
  }
}
