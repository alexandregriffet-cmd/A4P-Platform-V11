'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PlayerPage() {
  const params = useParams()
  const playerId = params?.playerId as string

  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [club, setClub] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      if (!playerId) return

      try {
        // joueur
        const { data: playerData } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single()

        setPlayer(playerData)

        // équipe
        if (playerData?.team_id) {
          const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', playerData.team_id)
            .single()

          setTeam(teamData)

          // club
          if (teamData?.club_id) {
            const { data: clubData } = await supabase
              .from('clubs')
              .select('*')
              .eq('id', teamData.club_id)
              .single()

            setClub(clubData)
          }
        }

        // résultats CMP
        const { data: passations } = await supabase
          .from('passations')
          .select('*')
          .eq('player_id', playerId)

        if (passations && passations.length > 0) {
          const tokens = passations.map(p => p.token)

          const { data: cmp } = await supabase
            .from('cmp_results')
            .select('*')
            .in('token', tokens)

          setResults(cmp || [])
        }
      } catch (e) {
        console.error(e)
      }

      setLoading(false)
    }

    load()
  }, [playerId])

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>

  if (!player) return <div style={{ padding: 20 }}>Joueur introuvable</div>

  const latest = results?.[0]

  return (
    <div style={{ padding: 20 }}>
      <h1>
        {player.firstname} {player.lastname}
      </h1>

      <p>Club : {club?.name || club?.club_name || '—'}</p>
      <p>Équipe : {team?.name || team?.team_name || '—'}</p>
      <p>Email : {player.email || '—'}</p>

      <hr />

      <h2>Profil mental</h2>

      {latest ? (
        <>
          <p>Score global : {latest.score_global}/100</p>
          <p>Profil : {latest.profile_label || latest.profile_code}</p>

          <h3>Axes de progression</h3>
          <ul>
            <li>Renforcer la confiance</li>
            <li>Améliorer la régulation émotionnelle</li>
            <li>Stabiliser la performance</li>
          </ul>
        </>
      ) : (
        <p>Aucun résultat CMP pour ce joueur</p>
      )}
    </div>
  )
}
