'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')

    const { data, error } = await supabase
      .from('users_individual')
      .select('*')
      .eq('email', email)
      .eq('access_code', code)
      .eq('has_access', true)

    if (error) {
      console.error(error)
      setError("Erreur technique.")
      return
    }

    if (!data || data.length === 0) {
      setError("Accès introuvable.")
      return
    }

    // ✅ utilisateur trouvé
    const user = data[0]

    // stockage session simple
    localStorage.setItem('a4p_user', JSON.stringify(user))

    // redirection vers parcours
    router.push('/parcours')
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Connexion</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleLogin}>
        Valider mon accès
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
