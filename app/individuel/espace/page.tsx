import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default async function EspaceIndividuelPage() {
  const cookieStore = cookies()
  const email = cookieStore.get('a4p_individual_email')?.value || ''
  const accessCode = cookieStore.get('a4p_individual_code')?.value || ''

  if (!email || !accessCode) {
    redirect('/individuel/connexion')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main style={{ padding: 24 }}>
        Configuration Supabase incomplète.
      </main>
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data } = await supabase
    .from('individual_access')
    .select(
      `
        full_name,
        email,
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
    .eq('access_code', accessCode)
    .single()

  if (!data || !data.access_enabled) {
    redirect('/individuel/connexion')
  }

  const testCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 22,
    padding: 22,
    boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
    border: '1px solid #e3eaf5',
  }

  const statusStyle = (completed: boolean, allowed: boolean): React.CSSProperties => ({
    display: 'inline-block',
    padding: '8px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    background: completed ? '#e8f7ee' : allowed ? '#eef3fb' : '#fff4e5',
    color: completed ? '#137333' : allowed ? '#1f3158' : '#9a6700',
  })

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '24px 18px 48px',
        color: '#1f3158',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #223a6b 0%, #2d4d8e 100%)',
            borderRadius: 26,
            padding: '24px 20px 28px',
            boxShadow: '0 18px 48px rgba(31,49,88,0.14)',
            color: '#ffffff',
            marginBottom: 22,
          }}
        >
          <img
            src="/logo-a4p.png"
            alt="A4P"
            style={{
              width: 110,
              marginBottom: 12,
              display: 'block',
            }}
          />

          <div
            style={{
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              opacity: 0.72,
              marginBottom: 6,
            }}
          >
            Espace individuel A4P
          </div>

          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(30px, 6vw, 44px)',
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            Bonjour{data.full_name ? ` ${data.full_name}` : ''}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Votre accès a été validé. La plateforme vérifie ici vos droits de
            passation et l’état de vos tests.
          </p>
        </section>

        <section style={{ display: 'grid', gap: 18 }}>
          <article style={testCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 28, fontWeight: 900 }}>PMP</h2>
            <p style={{ color: '#5d6d89', fontSize: 16, lineHeight: 1.7 }}>
              Profil mental de performance.
            </p>
            <div style={statusStyle(data.pmp_completed, data.pmp_allowed)}>
              {data.pmp_completed
                ? 'Déjà réalisé'
                : data.pmp_allowed
                ? 'Autorisé'
                : 'Non autorisé'}
            </div>
          </article>

          <article style={testCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 28, fontWeight: 900 }}>
              Psycho-émotionnel
            </h2>
            <p style={{ color: '#5d6d89', fontSize: 16, lineHeight: 1.7 }}>
              Lecture émotionnelle sous pression.
            </p>
            <div style={statusStyle(data.psycho_completed, data.psycho_allowed)}>
              {data.psycho_completed
                ? 'Déjà réalisé'
                : data.psycho_allowed
                ? 'Autorisé'
                : 'Non autorisé'}
            </div>
          </article>

          <article style={testCardStyle}>
            <h2 style={{ marginTop: 0, fontSize: 28, fontWeight: 900 }}>CMP</h2>
            <p style={{ color: '#5d6d89', fontSize: 16, lineHeight: 1.7 }}>
              Compétences mentales de performance.
            </p>
            <div style={statusStyle(data.cmp_completed, data.cmp_allowed)}>
              {data.cmp_completed
                ? 'Déjà réalisé'
                : data.cmp_allowed
                ? 'Autorisé'
                : 'Non autorisé'}
            </div>
          </article>
        </section>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <Link
            href="/individuel"
            style={{
              color: '#5d6d89',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            ← Retour au parcours individuel
          </Link>
        </div>
      </div>
    </main>
  )
}
