import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default async function PMPResultPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get('a4p_individual_email')?.value || ''
  const accessCode = cookieStore.get('a4p_individual_code')?.value || ''

  if (!email || !accessCode) {
    redirect('/individuel/connexion')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return <main style={{ padding: 24 }}>Configuration Supabase incomplète.</main>
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: access } = await supabase
    .from('individual_access')
    .select('*')
    .eq('email', email)
    .eq('access_code', accessCode)
    .single()

  if (!access || !access.access_enabled) {
    redirect('/individuel/connexion')
  }

  const { data: result } = await supabase
    .from('pmp_results')
    .select('*')
    .eq('email', email)
    .single()

  if (!result) {
    redirect('/individuel/pmp')
  }

  const scores = result.scores as Record<string, number>
  const profiles = result.profiles as Array<{ name: string; value: number }>
  const highDims = result.high_dims as Array<[string, number]>
  const lowDims = result.low_dims as Array<[string, number]>

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eef2f8 0%, #e9eef7 100%)',
        padding: '24px 18px 48px',
        color: '#1f3158',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
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
            style={{ width: 110, marginBottom: 12, display: 'block' }}
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
            Synthèse PMP A4P
          </div>

          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: 'clamp(30px, 6vw, 44px)',
              lineHeight: 1.08,
              fontWeight: 900,
            }}
          >
            {result.athlete_name || 'Sportif A4P'}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            Votre Profil Mental de Performance a bien été enregistré.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <Card title="Indice global A4P" value={`${result.global_index}/100`} />
          <Card title="Indice pression" value={`${result.pressure_index}/100`} />
          <Card title="Indice stabilité" value={`${result.stability_index}/100`} />
          <Card title="Type cognitif" value={result.mbti_type} />
        </section>

        <section
          style={{
            display: 'grid',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <Panel title="Profils dominants">
            {profiles.slice(0, 3).map((p, i) => (
              <div key={p.name} style={rowStyle}>
                <strong>
                  {i === 0 ? 'Profil principal' : i === 1 ? 'Profil secondaire' : 'Profil tertiaire'}
                </strong>
                <span>
                  {p.name} • {p.value}/100
                </span>
              </div>
            ))}
          </Panel>

          <Panel title="Dimensions les plus fortes">
            {highDims.map(([key, value]) => (
              <div key={key} style={rowStyle}>
                <strong>{key}</strong>
                <span>{value}/100</span>
              </div>
            ))}
          </Panel>

          <Panel title="Axes de progression prioritaires">
            {lowDims.map(([key, value]) => (
              <div key={key} style={rowStyle}>
                <strong>{key}</strong>
                <span>{value}/100</span>
              </div>
            ))}
          </Panel>

          <Panel title="Lecture synthétique">
            <p style={pStyle}>
              Votre profil global ressort actuellement comme <strong>{result.global_band}</strong>,
              avec un profil dominant <strong>{profiles[0]?.name || '—'}</strong>.
            </p>
            <p style={pStyle}>
              La lecture cognitive suggère un fonctionnement de type <strong>{result.mbti_type}</strong>,
              associé à une préférence motrice <strong>{result.motor || '—'}</strong>.
            </p>
            <p style={pStyle}>
              Votre style d’apprentissage dominant ressort comme <strong>{result.learning_style || '—'}</strong>,
              avec une cohérence cognition / motricité évaluée à <strong>{result.coherence_index}/100</strong>.
            </p>
          </Panel>

          <Panel title="Scores par dimension">
            {Object.entries(scores).map(([key, value]) => (
              <div key={key} style={rowStyle}>
                <strong>{key}</strong>
                <span>{value}/100</span>
              </div>
            ))}
          </Panel>
        </section>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/individuel/espace" style={linkButtonStyle}>
            Retour à mon espace
          </Link>
          <Link href="/individuel" style={secondaryLinkButtonStyle}>
            Retour au parcours individuel
          </Link>
        </div>
      </div>
    </main>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 22,
        padding: 22,
        boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
        border: '1px solid #e3eaf5',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: '#6d7b95', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#1f3158' }}>{value}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: 22,
        padding: 22,
        boxShadow: '0 10px 28px rgba(31,49,88,0.08)',
        border: '1px solid #e3eaf5',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: 24, fontWeight: 900 }}>{title}</h2>
      {children}
    </section>
  )
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '10px 0',
  borderBottom: '1px solid #edf2f7',
}

const pStyle: React.CSSProperties = {
  color: '#5d6d89',
  fontSize: 16,
  lineHeight: 1.8,
}

const linkButtonStyle: React.CSSProperties = {
  textDecoration: 'none',
  background: '#1f3158',
  color: '#ffffff',
  borderRadius: 14,
  padding: '14px 18px',
  fontWeight: 800,
}

const secondaryLinkButtonStyle: React.CSSProperties = {
  textDecoration: 'none',
  background: '#ffffff',
  color: '#1f3158',
  borderRadius: 14,
  padding: '14px 18px',
  fontWeight: 800,
  border: '1px solid #d7e1f0',
}
