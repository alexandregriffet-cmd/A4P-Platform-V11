'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ClubPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userState, setUserState] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser()

        console.log('USER:', user)

        if (!user) {
          setUserState(null)
          setLoading(false)
          return
        }

        setUserState(user)

        const { data, error: profileError } = await supabase
          .from('club_users')
          .select('*')
          .eq('auth_user_id', user.id)

        console.log('PROFILE:', data)

        if (profileError) {
          console.error(profileError)
        }

        if (data && data.length > 0) {
          setProfile(data[0])
        }
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }

    load()
  }, [])

  // LOADING
  if (loading) return <div>Chargement...</div>

  // PAS CONNECTÉ
  if (!userState) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Connexion requise</h1>

        <button
          onClick={async () => {
            const email = prompt('Entre ton email')
            if (!email) return

            await supabase.auth.signInWithOtp({
              email: email,
              options: {
                emailRedirectTo: window.location.origin + '/club'
              }
            })

            alert('Regarde tes emails pour te connecter')
          }}
        >
          Se connecter
        </button>
      </div>
    )
  }

  // PAS DE PROFIL
  if (!profile) {
    return <div>Aucun profil trouvé (user connecté mais non relié)</div>
  }

  // OK
  return (
    <div style={{ padding: 20 }}>
      <h1>Portail Club A4P</h1>

      <p><strong>Connexion Supabase ACTIVE</strong></p>

      <p>Utilisateur : {profile.firstname} {profile.lastname}</p>
      <p>Email : {profile.email}</p>
      <p>Rôle : {profile.role}</p>
      <p>Club ID : {profile.club_id}</p>
      <p>Team ID : {profile.team_id}</p>

      <button
        onClick={async () => {
          await supabase.auth.signOut()
          window.location.reload()
        }}
      >
        Déconnexion
      </button>
    </div>
  )
}
