async function getResults() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  if (!base) return []
  const res = await fetch(`${base}/api/results/list`, { cache: 'no-store' }).catch(() => null)
  if (!res || !res.ok) return []
  return res.json()
}

export default async function ResultsPage() {
  const data = await getResults()

  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <h1>Tous les résultats</h1>
      <pre style={{ background: "#111827", color: "#e5e7eb", padding: 16, borderRadius: 12, overflowX: "auto" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  )
}
