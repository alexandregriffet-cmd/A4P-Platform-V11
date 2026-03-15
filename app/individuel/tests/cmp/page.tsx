import { HUB_URL, CMP_URL } from '@/lib/constants'

export default function Page() {
  const portalBase = process.env.NEXT_PUBLIC_BASE_URL || ''
  const returnUrl = portalBase
    ? `${portalBase}/integration/receive?module=CMP`
    : `/integration/receive?module=CMP`
  const launchUrl = `${CMP_URL}?return_url=${encodeURIComponent(returnUrl)}`

  const btn: React.CSSProperties = {
    display: 'inline-block',
    background: '#19386b',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 12,
    padding: '14px 22px',
    fontWeight: 700,
  }

  const secondary: React.CSSProperties = {
    display: 'inline-block',
    background: '#fff',
    color: '#19386b',
    textDecoration: 'none',
    borderRadius: 12,
    padding: '14px 22px',
    fontWeight: 700,
    border: '1px solid #19386b',
    marginLeft: 12,
  }

  return (
    <main style={{ maxWidth: 980, margin: '40px auto', padding: 20 }}>
      <h1>CMP individuel</h1>
      <p>Ce module utilise ton moteur de test existant.</p>
      <a href={launchUrl} style={btn}>Passer le test</a>
      <a href={HUB_URL} style={secondary}>Retour hub diagnostique</a>
      <p style={{ marginTop: 24 }}>
        Le moteur externe doit envoyer le résultat au portail via l'adapter fourni.
      </p>
    </main>
  )
}
