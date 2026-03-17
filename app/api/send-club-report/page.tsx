import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clubName,
      coachEmail,
      summary,
    } = body

    // 🧾 Contenu HTML du rapport
    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h1>Rapport Mental A4P</h1>
        <h2>${clubName}</h2>

        <p>${summary}</p>

        <hr />

        <p>Académie de Performances A4P</p>
      </div>
    `

    // 📧 Envoi email
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: coachEmail,
      subject: `Rapport A4P - ${clubName}`,
      html,
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
