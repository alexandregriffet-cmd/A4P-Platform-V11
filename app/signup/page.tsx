'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    alert('Compte créé. Vérifie ton email si la confirmation est activée.')
    router.push('/login')
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Créer un compte utilisateur</h1>
        <form onSubmit={handleSignup} className="form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</button>
        </form>
      </div>
    </main>
  )
}
