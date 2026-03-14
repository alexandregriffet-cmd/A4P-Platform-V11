/**
 * Adapter PSYCHO -> A4P Platform Master
 * À placer à l'endroit où le résultat final est calculé dans le moteur de test existant.
 */
async function sendResultToA4PMaster(resultPayload) {
  const params = new URLSearchParams(window.location.search)
  const returnUrl = params.get('return_url')
  if (!returnUrl) return

  const ingestUrl = new URL('/api/results/ingest', returnUrl).toString()

  await fetch(ingestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      module: 'PSYCHO',
      ...resultPayload
    })
  })

  window.location.href = returnUrl
}
