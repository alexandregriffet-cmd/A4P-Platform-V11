import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      to,
      clubName,
      teamsCount,
      playersCount,
      portalUrl,
      senderName
    } = body ?? {}

    if (!to) {
      return NextResponse.json(
        { error: 'Adresse email du destinataire manquante.' },
        { status: 400 }
      )
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!resendApiKey || !fromEmail) {
      return NextResponse.json(
        {
          error:
            'Variables RESEND_API_KEY ou RESEND_FROM_EMAIL manquantes dans Vercel.'
        },
        { status: 500 }
      )
    }

    const subject = `Rapport Club A4P disponible${clubName ? ` — ${clubName}` : ''}`

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f3158; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">Rapport Club A4P disponible</h1>

        <p>Bonjour,</p>

        <p>
          Le rapport club A4P est prêt à être consulté.
        </p>

        <div style="background:#f8fbff;border:1px solid #dbe4f0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px 0;"><strong>Club :</strong> ${clubName || '—'}</p>
          <p style="margin:0 0 8px 0;"><strong>Équipes visibles :</strong> ${teamsCount ?? '—'}</p>
          <p style="margin:0;"><strong>Joueurs visibles :</strong> ${playersCount ?? '—'}</p>
        </div>

        <p>
          Vous pouvez consulter le portail ici :
        </p>

        <p>
          <a href="${portalUrl}" style="display:inline-block;padding:12px 16px;background:#35528f;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
            Ouvrir le portail club
          </a>
        </p>

        <p>
          Depuis le portail, vous pouvez utiliser le bouton <strong>Exporter PDF club</strong>.
        </p>

        <p style="margin-top:24px;">
          Bien cordialement,<br />
          ${senderName || 'Académie de Performances A4P'}
        </p>
      </div>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html
      })
    })

    const resendJson = await resendResponse.json()

    if (!resendResponse.ok) {
      return NextResponse.json(
        { error: resendJson?.message || 'Erreur Resend.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: resendJson })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur inconnue.' },
      { status: 500 }
    )
  }
}
