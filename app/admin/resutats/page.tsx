import type { CSSProperties } from 'react'
import { createClient } from '@supabase/supabase-js'

type ResultRow = {
  token?: string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  profile_code?: string | null
  profile_label?: string | null
  score_global?: number | null
  club_structure?: string | null
  created_at?: string | null
}

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Variables Supabase manquantes.')
  }

  return createClient(url, key)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function fullName(firstname?: string | null, lastname?: string | null) {
  const value = [firstname || '', lastname || ''].filter(Boolean).join(' ').trim()
  return value || '—'
}

export default async function AdminResultsPage() {
  const supabase = getServerClient()

  const { data } = await supabase
    .from('cmp_results')
    .select(
      'token, firstname, lastname, email, profile_code, profile_label, score_global, club_structure, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  const results: ResultRow[] = data ?? []

  const scores = results
    .map((r) => r.score_global)
    .filter((v): v is number => typeof v === 'number')

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length)
      : '—'

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Résultats CMP</h1>

      <div style={statBox}>
        <div style={statValue}>{results.length}</div>
        <div>résultats</div>
      </div>

      <div style={statBox}>
        <div style={statValue}>{avgScore}</div>
        <div>score moyen</div>
      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Sportif</th>
              <th style={th}>Email</th>
              <th style={th}>Club</th>
              <th style={th}>Profil</th>
              <th style={th}>Score</th>
              <th style={th}>Rapport</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={row}>
                <td style={td}>{formatDate(r.created_at)}</td>

                <td style={td}>
                  {fullName(r.firstname, r.lastname)}
                </td>

                <td style={td}>{r.email || '—'}</td>

                <td style={td}>{r.club_structure || '—'}</td>

                <td style={td}>{r.profile_label || '—'}</td>

                <td style={td}>
                  {typeof r.score_global === 'number'
                    ? `${r.score_global}/100`
                    : '—'}
                </td>

                <td style={td}>
                  {r.token ? (
                    <a
                      href={`https://alexandregriffet-cmd.github.io/CMP-A4P-ACADEMIE-DE-PERFORMANCES-/resultats.html?token=${r.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={button}
                    >
                      Voir
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 1400,
  margin: '0 auto',
  padding: 24
}

const titleStyle: CSSProperties = {
  fontSize: 48,
  fontWeight: 900,
  marginBottom: 24
}

const statBox: CSSProperties = {
  display: 'inline-block',
  marginRight: 20,
  marginBottom: 20
}

const statValue: CSSProperties = {
  fontSize: 40,
  fontWeight: 900
}

const tableWrap: CSSProperties = {
  overflowX: 'auto'
}

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: 12,
  borderBottom: '1px solid #ddd'
}

const td: CSSProperties = {
  padding: 12,
  borderBottom: '1px solid #eee'
}

const row: CSSProperties = {}

const button: CSSProperties = {
  padding: '8px 12px',
  background: '#2f4d85',
  color: '#fff',
  borderRadius: 8,
  textDecoration: 'none'
}
