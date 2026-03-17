import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type SearchParamsInput = {
  as?: string | string[]
}

type ClubUser = {
  id: string
  club_id?: string | null
  team_id?: string | null
  role?: 'a4p_admin' | 'club_admin' | 'coach' | 'player' | string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  is_active?: boolean | null
  created_at?: string | null
}

type Club = {
  id: string
  name?: string | null
  code?: string | null
  contact_email?: string | null
}

type Team = {
  id: string
  club_id?: string | null
  name?: string | null
  season?: string | null
  category?: string | null
  coach_name?: string | null
  created_at?: string | null
}

type Player = {
  id: string
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  club_id?: string | null
  team_id?: string | null
  club_user_id?: string | null
  created_at?: string | null
}

type ResultBase = {
  id?: string | null
  player_id?: string | null
  club_id?: string | null
  team_id?: string | null
  score_global?: number | string | null
  created_at?: string | null
}

type PsychoResult = {
  id?: string | null
  player_id?: string | null
  club_id?: string | null
  team_id?: string | null
  stress_level?: number | string | null
  created_at?: string | null
}

function normalizeScore(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const n = Number(value.replace(',', '.'))
    if (Number.isFinite(n)) return Math.round(n)
  }
  return null
}

function average(values: Array<number | null>) {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length)
}

function getUserName(user: ClubUser | null) {
  if (!user) return 'Utilisateur'
  const full = [user.firstname || '', user.lastname || ''].filter(Boolean).join(' ').trim()
  return full || user.email || 'Utilisateur'
}

function getPlayerName(player: Player) {
  const full = [player.firstname || '', player.lastname || ''].filter(Boolean).join(' ').trim()
  return full || 'Sportif sans nom'
}

function StatCard({
  value,
  label,
  helper
}: {
  value: string | number
  label: string
  helper?: string
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: 22,
        boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: '#1f3158',
          marginBottom: 8,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#667085' }}>{label}</div>
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 14, color: '#8a96ad', lineHeight: 1.5 }}>
          {helper}
        </div>
      ) : null}
    </div>
  )
}

function SectionCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 10px 30px rgba(20,30,60,0.08)'
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 30, color: '#182847' }}>{title}</h2>
      {children}
    </div>
  )
}

function roleButtonStyle(active: boolean) {
  return {
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: 14,
    fontWeight: 800,
    background: active ? '#35528f' : '#ffffff',
    color: active ? '#ffffff' : '#35528f',
    border: active ? '1px solid #35528f' : '1px solid #d7dfec',
    boxShadow: active ? '0 10px 24px rgba(53,82,143,0.18)' : 'none',
    display: 'inline-block'
  } as const
}

export default async function ClubPage({
  searchParams
}: {
  searchParams?: SearchParamsInput
}) {
  const rawRole = searchParams?.as
  const actingAs = Array.isArray(rawRole) ? rawRole[0] : rawRole || 'a4p_admin'

  const [
    usersRes,
    clubsRes,
    teamsRes,
    playersRes,
    cmpRes,
    pmpRes,
    psychoRes
  ] = await Promise.all([
    supabase.from('club_users').select('*').order('created_at', { ascending: false }),
    supabase.from('clubs').select('*').order('created_at', { ascending: false }),
    supabase.from('teams').select('*').order('created_at', { ascending: false }),
    supabase.from('players').select('*').order('created_at', { ascending: false }),
    supabase.from('cmp_results').select('*').order('created_at', { ascending: false }),
    supabase.from('pmp_results').select('*').order('created_at', { ascending: false }),
    supabase.from('psycho_results').select('*').order('created_at', { ascending: false })
  ])

  const users = (usersRes.data as ClubUser[] | null) ?? []
  const clubs = (clubsRes.data as Club[] | null) ?? []
  const teams = (teamsRes.data as Team[] | null) ?? []
  const players = (playersRes.data as Player[] | null) ?? []
  const cmpResults = (cmpRes.data as ResultBase[] | null) ?? []
  const pmpResults = (pmpRes.data as ResultBase[] | null) ?? []
  const psychoResults = (psychoRes.data as PsychoResult[] | null) ?? []

  const errorMessage =
    usersRes.error?.message ||
    clubsRes.error?.message ||
    teamsRes.error?.message ||
    playersRes.error?.message ||
    cmpRes.error?.message ||
    pmpRes.error?.message ||
    psychoRes.error?.message ||
    ''

  const selectedUser =
    actingAs === 'a4p_admin'
      ? users.find((u) => u.role === 'a4p_admin') || null
      : actingAs === 'club_admin'
        ? users.find((u) => u.role === 'club_admin') || null
        : actingAs === 'coach'
          ? users.find((u) => u.role === 'coach') || null
          : actingAs === 'player'
            ? users.find((u) => u.role === 'player') || null
            : null

  const visibleClubs =
    !selectedUser
      ? []
      : selectedUser.role === 'a4p_admin'
        ? clubs
        : clubs.filter((club) => club.id === selectedUser.club_id)

  const visibleTeams =
    !selectedUser
      ? []
      : selectedUser.role === 'a4p_admin'
        ? teams
        : selectedUser.role === 'club_admin'
          ? teams.filter((team) => team.club_id === selectedUser.club_id)
          : selectedUser.role === 'coach'
            ? teams.filter((team) => team.id === selectedUser.team_id)
            : (() => {
                const myPlayer = players.find((p) => p.club_user_id === selectedUser.id)
                return myPlayer?.team_id ? teams.filter((team) => team.id === myPlayer.team_id) : []
              })()

  const visiblePlayers =
    !selectedUser
      ? []
      : selectedUser.role === 'a4p_admin'
        ? players
        : selectedUser.role === 'club_admin'
          ? players.filter((player) => player.club_id === selectedUser.club_id)
          : selectedUser.role === 'coach'
            ? players.filter((player) => player.team_id === selectedUser.team_id)
            : players.filter((player) => player.club_user_id === selectedUser.id)

  const visiblePlayerIds = visiblePlayers.map((p) => p.id)

  const latestCmpByPlayer = new Map<string, ResultBase>()
  for (const item of cmpResults) {
    const pid = typeof item.player_id === 'string' ? item.player_id : null
    if (pid && visiblePlayerIds.includes(pid) && !latestCmpByPlayer.has(pid)) {
      latestCmpByPlayer.set(pid, item)
    }
  }

  const latestPmpByPlayer = new Map<string, ResultBase>()
  for (const item of pmpResults) {
    const pid = typeof item.player_id === 'string' ? item.player_id : null
    if (pid && visiblePlayerIds.includes(pid) && !latestPmpByPlayer.has(pid)) {
      latestPmpByPlayer.set(pid, item)
    }
  }

  const latestPsychoByPlayer = new Map<string, PsychoResult>()
  for (const item of psychoResults) {
    const pid = typeof item.player_id === 'string' ? item.player_id : null
    if (pid && visiblePlayerIds.includes(pid) && !latestPsychoByPlayer.has(pid)) {
      latestPsychoByPlayer.set(pid, item)
    }
  }

  const cmpAverage = average(
    visiblePlayers.map((p) => normalizeScore(latestCmpByPlayer.get(p.id)?.score_global))
  )
  const pmpAverage = average(
    visiblePlayers.map((p) => normalizeScore(latestPmpByPlayer.get(p.id)?.score_global))
  )
  const stressAverage = average(
    visiblePlayers.map((p) => normalizeScore(latestPsychoByPlayer.get(p.id)?.stress_level))
  )

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24, background: '#eef2f7' }}>
      <section
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          borderRadius: 28,
          padding: 28,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          marginBottom: 24
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 46, lineHeight: 1.02, color: '#182847' }}>
              Portail Club A4P
            </h1>
            <p style={{ margin: '14px 0 0 0', fontSize: 18, color: '#667085', lineHeight: 1.7 }}>
              Vue démo pilotée par rôle.
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: 16, color: '#35528f', fontWeight: 800 }}>
              Vue active : {selectedUser?.role || actingAs} · {getUserName(selectedUser)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/club?as=a4p_admin" style={roleButtonStyle((selectedUser?.role || actingAs) === 'a4p_admin')}>
              Admin A4P
            </Link>
            <Link href="/club?as=club_admin" style={roleButtonStyle((selectedUser?.role || actingAs) === 'club_admin')}>
              Admin club
            </Link>
            <Link href="/club?as=coach" style={roleButtonStyle((selectedUser?.role || actingAs) === 'coach')}>
              Coach
            </Link>
            <Link href="/club?as=player" style={roleButtonStyle((selectedUser?.role || actingAs) === 'player')}>
              Joueur
            </Link>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <SectionCard title="Lecture données">
          <p style={{ margin: 0, color: '#b42318', lineHeight: 1.7 }}>{errorMessage}</p>
        </SectionCard>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={visibleClubs.length} label="Clubs visibles" />
        <StatCard value={visibleTeams.length} label="Équipes visibles" />
        <StatCard value={visiblePlayers.length} label="Joueurs visibles" />
        <StatCard value={cmpAverage !== null ? `${cmpAverage}/100` : '—'} label="Moyenne CMP visible" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <StatCard value={pmpAverage !== null ? `${pmpAverage}/100` : '—'} label="Moyenne PMP visible" />
        <StatCard value={stressAverage !== null ? `${stressAverage}/100` : '—'} label="Stress moyen visible" />
        <StatCard value={selectedUser?.club_id ? 'Oui' : 'Non'} label="Club attribué" />
        <StatCard value={selectedUser?.team_id ? 'Oui' : 'Non'} label="Équipe attribuée" />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
          marginBottom: 24
        }}
      >
        <SectionCard title="Périmètre visible">
          <div style={{ display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d' }}>
              <strong>Rôle :</strong> {selectedUser?.role || actingAs}
            </p>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d' }}>
              <strong>Clubs :</strong>{' '}
              {visibleClubs.length > 0 ? visibleClubs.map((c) => c.name || 'Club').join(', ') : 'Aucun'}
            </p>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d' }}>
              <strong>Équipes :</strong>{' '}
              {visibleTeams.length > 0 ? visibleTeams.map((t) => t.name || 'Équipe').join(', ') : 'Aucune'}
            </p>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d' }}>
              <strong>Joueurs visibles :</strong> {visiblePlayers.length}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Accès attendu">
          <div style={{ display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, lineHeight: 1.8, color: '#44516d' }}>
              {(selectedUser?.role || actingAs) === 'a4p_admin' &&
                "L’administrateur A4P voit tous les clubs, toutes les équipes, tous les joueurs et toutes les données."}
              {(selectedUser?.role || actingAs) === 'club_admin' &&
                "L’administrateur club voit uniquement son club, toutes ses équipes et tous ses joueurs."}
              {(selectedUser?.role || actingAs) === 'coach' &&
                "Le coach voit uniquement son équipe, ses joueurs et la synthèse collective de son groupe."}
              {(selectedUser?.role || actingAs) === 'player' &&
                "Le joueur voit uniquement ses propres résultats et son historique individuel."}
            </p>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Équipes visibles">
        {visibleTeams.length === 0 ? (
          <p style={{ margin: 0, color: '#667085' }}>Aucune équipe visible pour ce rôle.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {visibleTeams.map((team) => (
              <div
                key={team.id}
                style={{
                  border: '1px solid #e2e8f4',
                  borderRadius: 18,
                  background: '#f8fbff',
                  padding: 18
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1f3158' }}>
                  {team.name || 'Équipe'}
                </div>
                <div style={{ fontSize: 14, color: '#667085', marginTop: 6 }}>
                  Saison : {team.season || '—'} · Catégorie : {team.category || '—'}
                </div>
                <div style={{ marginTop: 14 }}>
                  <Link
                    href={`/club/equipes/${team.id}`}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 14px',
                      borderRadius: 14,
                      color: '#ffffff',
                      background: '#35528f',
                      fontWeight: 800,
                      display: 'inline-block'
                    }}
                  >
                    Voir le dashboard équipe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div style={{ height: 24 }} />

      <SectionCard title="Joueurs visibles">
        {visiblePlayers.length === 0 ? (
          <p style={{ margin: 0, color: '#667085' }}>Aucun joueur visible pour ce rôle.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {visiblePlayers.map((player) => {
              const cmp = normalizeScore(latestCmpByPlayer.get(player.id)?.score_global)
              const pmp = normalizeScore(latestPmpByPlayer.get(player.id)?.score_global)
              const stress = normalizeScore(latestPsychoByPlayer.get(player.id)?.stress_level)

              return (
                <div
                  key={player.id}
                  style={{
                    border: '1px solid #e2e8f4',
                    borderRadius: 18,
                    background: '#f8fbff',
                    padding: 18
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginBottom: 12
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#1f3158' }}>
                        {getPlayerName(player)}
                      </div>
                      <div style={{ fontSize: 14, color: '#667085' }}>{player.email || '—'}</div>
                    </div>

                    <Link
                      href={`/club/joueurs/${player.id}`}
                      style={{
                        textDecoration: 'none',
                        padding: '10px 14px',
                        borderRadius: 14,
                        color: '#ffffff',
                        background: '#35528f',
                        fontWeight: 800
                      }}
                    >
                      Voir la fiche joueur
                    </Link>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: 12
                    }}
                  >
                    <StatCard value={cmp !== null ? `${cmp}/100` : '—'} label="CMP" />
                    <StatCard value={pmp !== null ? `${pmp}/100` : '—'} label="PMP" />
                    <StatCard value={stress !== null ? `${stress}/100` : '—'} label="Stress" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </main>
  )
}
