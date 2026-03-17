import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log('Email data:', body)

    return NextResponse.json({
      success: true,
      message: 'Email simulation OK',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur API' },
      { status: 500 }
    )
  }
}
