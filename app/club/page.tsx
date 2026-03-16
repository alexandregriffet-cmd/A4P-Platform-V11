'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type ClubRow = {
  id: string
  name?: string | null
  created_at?: string | null
}

type TeamRow = {
  id: string
  name?: string | null
  team_name?: string | null
  season?: string | null
  club_id?: string | null
  created_at?: string | null
}

type ImportedPlayer = {
  raw: string
  firstname: string
  lastname: string
  email: string | null
}

type CreatedPassation = {
  playerId: string
  firstname: string
  lastname: string
  email: string | null
  token: string
  link: string
}

function makeToken(length = 20): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

function parsePlayerLine(line: string): ImportedPlayer | null {
  const cleaned = line.trim()
  if (!cleaned) return null

  let identityPart = cleaned
  let emailPart = ''

  if (cleaned.includes(';')) {
    const parts = cleaned.split(';')
    identityPart = (parts[0] || '').trim()
    emailPart = (parts[1] || '').trim()
  } else {
    const lastComma = cleaned.lastIndexOf(',')
    if (lastComma > -1) {
      identityPart = cleaned.slice(0, lastComma).trim()
      emailPart = cleaned.slice(lastComma + 1).trim()
    }
  }

  const identityTokens = identityPart
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (!identityTokens.length) return null

  return {
    raw: cleaned,
    firstname: identityTokens[0] || '',
    lastname: identityTokens.slice(1).join(' ') || '',
    email: emailPart || null
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function clubLabel(club: ClubRow) {
  return club.name || 'Club sans nom'
}

function teamLabel(team: TeamRow) {
  return team.team_name || team.name || 'Équipe sans nom'
}

export default function AdminClubsPage() {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [clubs, setClubs] = useState<ClubRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])

  const [clubMode, setClubMode] = useState<'existing' | 'new'>('new')
  const [selectedClubId, setSelectedClubId] = useState('')
  const [newClubName, setNewClubName] = useState('')

  const [teamMode, setTeamMode] = useState<'existing' | 'new'>('new')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [season, setSeason] = useState('')

  const [moduleName, setModuleName] = useState('CMP')
  const [playersText, setPlayersText] = useState('')

  const [createdClubId, setCreatedClubId] = useState('')
  const [createdTeamId, setCreatedTeamId] = useState('')
  const [createdLinks, setCreatedLinks] = useState<CreatedPassation[]>([])

  const parsedPlayers = useMemo(() => {
    return playersText
      .split('\n')
      .map(parsePlayerLine)
      .filter((p): p is ImportedPlayer => Boolean(p))
  }, [playersText])

  const filteredTeams = useMemo(() => {
    const activeClubId =
      clubMode === 'existing' ? selectedClubId : createdClubId || selectedClubId

    if (!activeClubId) return teams

    return teams.filter((team) => team.club_id === activeClubId)
  }, [teams, clubMode, selectedClubId, createdClubId])

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoadingData(true)
    setErrorMessage('')

    try {
      const [{ data: clubsData, error: clubsError }, { data: teamsData, error: teamsError }] =
        await Promise.all([
          supabase
            .from('clubs')
            .select('id, name, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('teams')
            .select('id, name, team_name, season, club_id, created_at')
            .order('created_at', { ascending: false })
        ])

      if (clubsError) throw new Error(clubsError.message)
      if (teamsError) throw new Error(teamsError.message)

      setClubs((clubsData as ClubRow[]) || [])
      setTeams((teamsData as TeamRow[]) || [])
    } catch (error: any) {
      setErrorMessage(error?.message || 'Impossible de charger les clubs et équipes.')
    } finally {
      setLoadingData(false)
    }
  }

  async function ensureClub(): Promise<string> {
    if (clubMode === 'existing') {
      if (!selectedClubId) {
        throw new Error('Sélectionne un club existant.')
      }
      return selectedClubId
    }

    if (!newClubName.trim()) {
      throw new Error('Le nom du club est obligatoire.')
    }

    const payload = {
      name: newClubName.trim()
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert(payload)
      .select('id, name, created_at')
      .single()

    if (error || !data?.id) {
      throw new Error(error?.message || 'Impossible de créer le club.')
    }

    const club = data as ClubRow
    setClubs((prev) => [club, ...prev])
    setCreatedClubId(club.id)
    setSelectedClubId(club.id)

    return club.id
  }

  async function ensureTeam(clubId: string): Promise<string> {
    if (teamMode === 'existing') {
      if (!selectedTeamId) {
        throw new Error('Sélectionne une équipe existante.')
      }
      return selectedTeamId
    }

    if (!newTeamName.trim()) {
      throw new Error("Le nom de l'équipe est obligatoire.")
    }

    const payload = {
      club_id: clubId,
      name: newTeamName.trim(),
      team_name: newTeamName.trim(),
      season: season.trim() || null
    }

    const { data, error } = await supabase
      .from('teams')
      .insert(payload)
      .select('id, name, team_name, season, club_id, created_at')
      .single()

    if (error || !data?.id) {
      throw new Error(error?.message || "Impossible de créer l'équipe.")
    }

    const team = data as TeamRow
    setTeams((prev) => [team, ...prev])
    setCreatedTeamId(team.id)
    setSelectedTeamId(team.id)

    return team.id
  }

  async function createPlayersAndPassations(teamId: string, clubId: string) {
    if (!parsedPlayers.length) {
      throw new Error('Ajoute au moins un joueur.')
    }

    const playersPayload = parsedPlayers.map((player) => ({
      team_id: teamId,
      firstname: player.firstname,
      lastname: player.lastname,
      email: player.email,
      position: null
    }))

    const { data: playersCreated, error: playersError } = await supabase
      .from('players')
      .insert(playersPayload)
      .select('id, firstname, lastname, email')

    if (playersError || !playersCreated) {
      throw new Error(playersError?.message || 'Impossible de créer les joueurs.')
    }

    const passationsPayload = playersCreated.map((player) => ({
      player_id: player.id,
      team_id: teamId,
      club_id: clubId,
      module: moduleName,
      token: makeToken(),
      status: 'pending'
    }))

    const { data: passationsCreated, error: passationsError } = await supabase
      .from('passations')
      .insert(passationsPayload)
      .select('player_id, token, module, status')

    if (passationsError || !passationsCreated) {
      throw new Error(passationsError?.message || 'Impossible de créer les passations.')
    }

    const links: CreatedPassation[] = playersCreated.map((player) => {
      const passation = passationsCreated.find((p) => p.player_id === player.id)
      const token = passation?.token || ''

      return {
        playerId: player.id,
        firstname: player.firstname || '',
        lastname: player.lastname || '',
        email: player.email || null,
        token,
        link: `${window.location.origin}/passations/${token}`
      }
    })

    setCreatedLinks(links)

    return {
      playersCount: playersCreated.length,
      passationsCount: passationsCreated.length
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setErrorMessage('')
    setCreatedLinks([])
    setCreatedClubId('')
    setCreatedTeamId('')

    try {
      const clubId = await ensureClub()
      const teamId = await ensureTeam(clubId)
      const result = await createPlayersAndPassations(teamId, clubId)

      setMessage(
        `Opération terminée : ${result.playersCount} joueur(s) créé(s), ${result.passationsCount} passation(s) générée(s).`
      )

      await loadData()
    } catch (error: any) {
      setErrorMessage(error?.message || 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  async function copyAllLinks() {
    if (!createdLinks.length) return

    const text = createdLinks
      .map((item, index) => {
        const name =
          [item.firstname, item.lastname].filter(Boolean).join(' ') || `Joueur ${index + 1}`
        const email = item.email ? ` (${item.email})` : ''
        return `${name}${email}\n${item.link}`
      })
      .join('\n\n')

    await navigator.clipboard.writeText(text)
    setMessage('Tous les liens ont été copiés.')
  }

  async function copyOneLink(link: string) {
    await navigator.clipboard.writeText(link)
    setMessage('Lien copié.')
  }

  function resetForm() {
    setMessage('')
    setErrorMessage('')
    setClubMode('new')
    setSelectedClubId('')
    setNewClubName('')
    setTeamMode('new')
    setSelectedTeamId('')
    setNewTeamName('')
    setSeason('')
    setModuleName('CMP')
    setPlayersText('')
    setCreatedClubId('')
    setCreatedTeamId('')
    setCreatedLinks([])
  }

  return (
    <main style={pageStyle}>
      <div style={headerWrap}>
        <div>
          <div style={eyebrowStyle}>Cockpit admin A4P</div>
          <h1 style={titleStyle}>Gestion des clubs</h1>
          <p style={introStyle}>
            Cette page permet de créer un club, créer une équipe, importer des joueurs
            et générer immédiatement leurs passations sécurisées.
          </p>
        </div>

        <div style={headerButtonsStyle}>
          <Link href="/admin/passations" style={secondaryLinkStyle}>
            Passations
          </Link>
          <Link href="/admin/resultats" style={secondaryLinkStyle}>
            Résultats
          </Link>
        </div>
      </div>

      <section style={heroCardStyle}>
        <form onSubmit={handleGenerate} style={{ display: 'grid', gap: 24 }}>
          <div style={twoColsStyle}>
            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>1. Club</h2>

              <div style={switchRowStyle}>
                <button
                  type="button"
                  onClick={() => setClubMode('new')}
                  style={clubMode === 'new' ? tabActiveStyle : tabStyle}
                >
                  Nouveau club
                </button>

                <button
                  type="button"
                  onClick={() => setClubMode('existing')}
                  style={clubMode === 'existing' ? tabActiveStyle : tabStyle}
                >
                  Club existant
                </button>
              </div>

              {clubMode === 'new' ? (
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Nom du club</label>
                  <input
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="Ex. Rugby Club Asnières"
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Choisir un club</label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => {
                      setSelectedClubId(e.target.value)
                      setSelectedTeamId('')
                    }}
                    style={inputStyle}
                  >
                    <option value="">Sélectionner</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {clubLabel(club)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>2. Équipe</h2>

              <div style={switchRowStyle}>
                <button
                  type="button"
                  onClick={() => setTeamMode('new')}
                  style={teamMode === 'new' ? tabActiveStyle : tabStyle}
                >
                  Nouvelle équipe
                </button>

                <button
                  type="button"
                  onClick={() => setTeamMode('existing')}
                  style={teamMode === 'existing' ? tabActiveStyle : tabStyle}
                >
                  Équipe existante
                </button>
              </div>

              {teamMode === 'new' ? (
                <>
                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Nom de l’équipe</label>
                    <input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Ex. U17 Rugby"
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Saison</label>
                    <input
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="Ex. 2025-2026"
                      style={inputStyle}
                    />
                  </div>
                </>
              ) : (
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Choisir une équipe</label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Sélectionner</option>
                    {filteredTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {teamLabel(team)} {team.season ? `• ${team.season}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Module</label>
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  style={inputStyle}
                >
                  <option value="CMP">CMP</option>
                  <option value="PMP">PMP</option>
                  <option value="PSYCHO">PSYCHO</option>
                </select>
              </div>
            </div>
          </div>

          <div style={panelStyle}>
            <h2 style={sectionTitleStyle}>3. Import des joueurs</h2>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Liste des joueurs</label>
              <textarea
                value={playersText}
                onChange={(e) => setPlayersText(e.target.value)}
                placeholder={`Un joueur par ligne

Exemples :
Alexandre Griffet
Léa Martin ; lea@email.fr
Hugo Petit, hugo@email.fr`}
                style={textareaStyle}
              />
            </div>

            <div style={hintStyle}>
              Formats acceptés :
              <br />
              • Prénom Nom
              <br />
              • Prénom Nom ; email@domaine.fr
              <br />
              • Prénom Nom, email@domaine.fr
            </div>
          </div>

          <div style={actionRowStyle}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading
                ? 'Génération en cours…'
                : 'Créer le club / équipe / joueurs / passations'}
            </button>

            <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
              Réinitialiser
            </button>
          </div>

          {message ? <div style={successBoxStyle}>{message}</div> : null}
          {errorMessage ? <div style={errorBoxStyle}>{errorMessage}</div> : null}
        </form>
      </section>

      <section style={threeColsStyle}>
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Prévisualisation</h2>
          {parsedPlayers.length === 0 ? (
            <div style={mutedStyle}>Aucun joueur détecté.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {parsedPlayers.map((player, index) => (
                <div key={`${player.raw}-${index}`} style={previewItemStyle}>
                  <div style={{ fontWeight: 800, color: '#16233b' }}>
                    {[player.firstname, player.lastname].filter(Boolean).join(' ') || 'Sans nom'}
                  </div>
                  <div style={{ fontSize: 14, color: '#667085', marginTop: 6 }}>
                    {player.email || 'Sans email'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Résumé opération</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <StatLine
              label="Mode club"
              value={clubMode === 'new' ? 'Création nouveau club' : 'Club existant'}
            />
            <StatLine
              label="Mode équipe"
              value={teamMode === 'new' ? 'Création nouvelle équipe' : 'Équipe existante'}
            />
            <StatLine label="Module" value={moduleName} />
            <StatLine label="Joueurs détectés" value={String(parsedPlayers.length)} />
            <StatLine label="Club créé" value={createdClubId || '—'} mono />
            <StatLine label="Équipe créée" value={createdTeamId || '—'} mono />
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Base actuelle</h2>
          {loadingData ? (
            <div style={mutedStyle}>Chargement…</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <StatLine label="Clubs" value={String(clubs.length)} />
              <StatLine label="Équipes" value={String(teams.length)} />
              <StatLine
                label="Dernier club"
                value={clubs[0] ? clubLabel(clubs[0]) : '—'}
              />
              <StatLine
                label="Dernière équipe"
                value={teams[0] ? teamLabel(teams[0]) : '—'}
              />
            </div>
          )}
        </div>
      </section>

      {createdLinks.length > 0 ? (
        <section style={{ ...panelStyle, marginTop: 24 }}>
          <div style={linksHeaderStyle}>
            <h2 style={sectionTitleStyle}>Liens de passation générés</h2>

            <button type="button" onClick={copyAllLinks} style={secondaryButtonStyle}>
              Copier tous les liens
            </button>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {createdLinks.map((item, index) => (
              <div key={`${item.token}-${index}`} style={linkCardStyle}>
                <div style={linkCardTopStyle}>
                  <div>
                    <div style={{ fontWeight: 900, color: '#16233b', fontSize: 20 }}>
                      {[item.firstname, item.lastname].filter(Boolean).join(' ') ||
                        `Joueur ${index + 1}`}
                    </div>
                    <div style={{ marginTop: 6, color: '#667085' }}>
                      {item.email || 'Sans email'}
                    </div>
                  </div>

                  <div style={tokenBadgeStyle}>{item.token}</div>
                </div>

                <div style={urlBoxStyle}>{item.link}</div>

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    onClick={() => copyOneLink(item.link)}
                    style={secondaryButtonStyle}
                  >
                    Copier
                  </button>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={primaryLinkStyle}
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section style={{ ...panelStyle, marginTop: 24 }}>
        <h2 style={sectionTitleStyle}>Raccourcis cockpit</h2>

        <div style={shortcutGridStyle}>
          <Link href="/admin/passations" style={shortcutStyle}>
            Voir toutes les passations
          </Link>

          <Link href="/admin/resultats" style={shortcutStyle}>
            Voir tous les résultats
          </Link>

          <Link href="/club/import-equipe" style={shortcutStyle}>
            Ancienne page import équipe
          </Link>
        </div>
      </section>
    </main>
  )
}

function StatLine({
  label,
  value,
  mono = false
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div style={statLineStyle}>
      <div style={statLineLabelStyle}>{label}</div>
      <div
        style={{
          ...statLineValueStyle,
          fontFamily: mono ? 'monospace' : 'inherit',
          fontSize: mono ? 13 : 18
        }}
      >
        {value}
      </div>
    </div>
  )
}

const pageStyle: CSSProperties = {
  maxWidth: 1440,
  margin: '0 auto',
  padding: 24
}

const headerWrap: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 24
}

const eyebrowStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#6f7f9d',
  marginBottom: 10
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 52,
  lineHeight: 1,
  color: '#16233b'
}

const introStyle: CSSProperties = {
  marginTop: 14,
  maxWidth: 900,
  fontSize: 19,
  lineHeight: 1.75,
  color: '#5f6f8e'
}

const headerButtonsStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap'
}

const heroCardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 28,
  padding: 28,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
  marginBottom: 24
}

const panelStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: 24,
  boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
}

const twoColsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 20
}

const threeColsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 20
}

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 18,
  fontSize: 30,
  lineHeight: 1.1,
  color: '#16233b'
}

const switchRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginBottom: 18
}

const tabStyle: CSSProperties = {
  appearance: 'none',
  border: '1px solid #d7deea',
  background: '#fff',
  color: '#2f4d85',
  borderRadius: 14,
  padding: '12px 16px',
  fontWeight: 700,
  cursor: 'pointer'
}

const tabActiveStyle: CSSProperties = {
  ...tabStyle,
  background: '#eef2ff',
  border: '1px solid #cfd8ff'
}

const fieldWrapStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  marginBottom: 16
}

const labelStyle: CSSProperties = {
  fontWeight: 800,
  color: '#16233b'
}

const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d7deea',
  borderRadius: 16,
  background: '#fff',
  minHeight: 56,
  padding: '14px 16px',
  fontSize: 18,
  color: '#1e2b45',
  outline: 'none'
}

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 220,
  resize: 'vertical',
  fontFamily: 'inherit'
}

const hintStyle: CSSProperties = {
  fontSize: 14,
  color: '#667085',
  lineHeight: 1.7
}

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap'
}

const primaryButtonStyle: CSSProperties = {
  appearance: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '15px 20px',
  borderRadius: 16,
  fontWeight: 800,
  fontSize: 16,
  background: 'linear-gradient(135deg, #2f4d85 0%, #395da0 100%)',
  color: '#fff',
  boxShadow: '0 8px 22px rgba(47, 77, 133, 0.22)'
}

const secondaryButtonStyle: CSSProperties = {
  appearance: 'none',
  border: '1px solid #cfd8e6',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '15px 20px',
  borderRadius: 16,
  fontWeight: 800,
  fontSize: 16,
  background: '#fff',
  color: '#2f4d85',
  textDecoration: 'none'
}

const secondaryLinkStyle: CSSProperties = {
  ...secondaryButtonStyle
}

const primaryLinkStyle: CSSProperties = {
  ...primaryButtonStyle,
  textDecoration: 'none'
}

const successBoxStyle: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#ecfdf3',
  border: '1px solid #abefc6',
  color: '#067647',
  fontWeight: 800,
  lineHeight: 1.6
}

const errorBoxStyle: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#fef3f2',
  border: '1px solid #fecdca',
  color: '#b42318',
  fontWeight: 800,
  lineHeight: 1.6
}

const mutedStyle: CSSProperties = {
  color: '#667085',
  fontSize: 17
}

const previewItemStyle: CSSProperties = {
  border: '1px solid #e2e8f4',
  borderRadius: 16,
  padding: 14,
  background: '#f8fafd'
}

const statLineStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  padding: 12,
  borderRadius: 16,
  background: '#f8fafd',
  border: '1px solid #e2e8f4'
}

const statLineLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#6f7f9d'
}

const statLineValueStyle: CSSProperties = {
  color: '#16233b',
  fontWeight: 800,
  wordBreak: 'break-word'
}

const linksHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 18
}

const linkCardStyle: CSSProperties = {
  border: '1px solid #e2e8f4',
  background: '#f8fafd',
  borderRadius: 18,
  padding: 16
}

const linkCardTopStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 10
}

const tokenBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#34518b',
  fontWeight: 800,
  fontFamily: 'monospace',
  fontSize: 13,
  wordBreak: 'break-all'
}

const urlBoxStyle: CSSProperties = {
  background: '#0c244b',
  color: '#eef4ff',
  borderRadius: 16,
  padding: 14,
  fontFamily: 'monospace',
  fontSize: 13,
  lineHeight: 1.7,
  wordBreak: 'break-all'
}

const shortcutGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14
}

const shortcutStyle: CSSProperties = {
  textDecoration: 'none',
  padding: '18px 20px',
  borderRadius: 18,
  border: '1px solid #d5ddea',
  background: '#f8fafd',
  color: '#173A73',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
