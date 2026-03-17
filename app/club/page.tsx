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

  useEffect(() => {
    const load = async () => {
      try {
        console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()

        console.log('AUTH USER:', user)
        console.log('AUTH ERROR:', userError)

        if (userError || !user) {
          console.error('Erreur user', userError)
          setLoading(false)
          return
        }

        console.log('USER UID:', user.id)

        const { data, error } = await supabase
          .from('club_users')
          .select('*')
          .eq('auth_user_id', user.id)

        console.log('PROFILE RESULT:', data)
        console.log('PROFILE ERROR:', error)

        if (error) {
          console.error('Erreur profile', error)
        }

        if (data && data.length > 0) {
          setProfile(data[0])
        }
      } catch (err) {
        console.error('Erreur globale', err)
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div>Chargement...</div>

  if (!profile) {
    return <div>Aucun profil trouvé</div>
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Portail Club A4P</h1>

      <p><strong>Connexion réelle Supabase active</strong></p>

      <p>Utilisateur : {profile.firstname} {profile.lastname}</p>
      <p>Rôle : {profile.role}</p>
      <p>Email : {profile.email}</p>
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
