'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('users_individual')
      .select('*')
      .eq('email', email)
      .eq('access_code', code)
      .single()

    if (error || !data) {
      setError("Accès refusé. Vérifiez vos informations.")
      setLoading(false)
      return
    }

    if (!data.has_access) {
      setError("Accès désactivé.")
      setLoading(false)
      return
    }

    // Stockage session local
    localStorage.setItem('a4p_user', JSON.stringify(data))

    // Redirection
    router.push('/individuel/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Accès sécurisé
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Code d’accès"
          className="w-full mb-4 p-3 border rounded-lg"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-900 text-white p-3 rounded-lg"
        >
          {loading ? 'Connexion...' : 'Valider mon accès'}
        </button>

      </div>
    </div>
  )
}
