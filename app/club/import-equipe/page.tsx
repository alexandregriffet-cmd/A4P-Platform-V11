'use client'

import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

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

type TeamInsertRow = {
  club_id: string | null
  name: string
  team_name: string
  season: string | null
}

type PlayerInsertRow = {
  team_id: string
  firstname: string
  lastname: string
  email: string | null
  position: null
}

type PassationInsertRow = {
  player_id: string
  team_id: string
  club_id: string | null
  module: string
  token: string
  status: string
}

type TeamCreatedRow = {
  id: string
  team_name?: string | null
}

type PlayerCreatedRow = {
  id: string
  firstname: string | null
  lastname: string | null
  email: string | null
}

type PassationCreatedRow = {
  player_id: string
  token: string
  module: string | null
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
    .map((part) => part.trim())
    .filter(Boolean)

  if (!identityTokens.length) return null

  const firstname = identityTokens[0] || ''
  const lastname = identityTokens.slice(1).join(' ') || ''

  return {
    raw: cleaned,
    firstname,
    lastname,
    email: emailPart || null
  }
}

export default function ImportEquipePage() {
  const [clubId, setClubId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [season, setSeason] = useState('')
  const [moduleName, setModuleName] = useState('CMP')
  const [playersText, setPlayersText] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [createdTeamId, setCreatedTeamId] = useState('')
  const [createdLinks, setCreatedLinks] = useState<CreatedPassation[]>([])

  const parsedPlayers = useMemo(() => {
    return playersText
      .split('\n')
      .map(parsePlayerLine)
      .filter((player): player is ImportedPlayer => player !== null)
  }, [playersText])

  async function handleImport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResultMessage('')
    setErrorMessage('')
    setCreatedLinks([])
    setCreatedTeamId('')

    try {
      if (!teamName.trim()) {
        throw new Error("Le nom de l'équipe est obligatoire.")
      }

      if (!parsedPlayers.length) {
        throw new Error('Ajoute au moins un joueur dans la liste.')
      }

      const teamPayload: TeamInsertRow = {
        club_id: clubId.trim() || null,
        name: teamName.trim(),
        team_name: teamName.trim(),
        season: season.trim() || null
      }

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert(teamPayload)
        .select('id, team_name')
        .single<TeamCreatedRow>()

      if (teamError || !teamData?.id) {
        throw new Error(teamError?.message || "Impossible de créer l'équipe.")
      }

      const teamId = teamData.id
      setCreatedTeamId(teamId)

      const playersPayload: PlayerInsertRow[] = parsedPlayers.map((player) => ({
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
        .returns<PlayerCreatedRow[]>()

      if (playersError || !playersCreated || !playersCreated.length) {
        throw new Error(playersError?.message || 'Impossible de créer les joueurs.')
      }

      const passationsPayload: PassationInsertRow[] = playersCreated.map((player) => ({
        player_id: player.id,
        team_id: teamId,
        club_id: clubId.trim() || null,
        module: moduleName,
        token: makeToken(),
        status: 'pending'
      }))

      const { data: passationsCreated, error: passationsError } = await supabase
        .from('passations')
        .insert(passationsPayload)
        .select('player_id, token, module')
        .returns<PassationCreatedRow[]>()

      if (passationsError || !passationsCreated || !passationsCreated.length) {
        throw new Error(passationsError?.message || 'Impossible de créer les passations.')
      }

      const links: CreatedPassation[] = playersCreated.map((player) => {
        const passation = passationsCreated.find((item) => item.player_id === player.id)
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
      setResultMessage(
        `Import terminé : ${playersCreated.length} joueur(s) créés, ${passationsCreated.length} passation(s) générée(s).`
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue pendant l’import.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  async function copyAllLinks() {
    if (!createdLinks.length) return

    const text = createdLinks
      .map((item, index) => {
        const fullName =
          [item.firstname, item.lastname].filter(Boolean).join(' ') || `Joueur ${index + 1}`
        const email = item.email ? ` (${item.email})` : ''
        return `${fullName}${email}\n${item.link}`
      })
      .join('\n\n')

    await navigator.clipboard.writeText(text)
    setResultMessage('Tous les liens ont été copiés.')
  }

  async function copyOneLink(link: string) {
    await navigator.clipboard.writeText(link)
    setResultMessage('Lien copié.')
  }

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6f7f9d',
              marginBottom: 8
            }}
          >
            Administration club
          </div>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02, color: '#16233b' }}>
            Import équipe
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/club"
            style={{
              textDecoration: 'none',
              padding: '14px 18px',
              borderRadius: 14,
              border: '1px solid #d5ddea',
              color: '#173A73',
              background: '#fff',
              fontWeight: 700
            }}
          >
            Retour club
          </Link>

          <Link
            href="/passations"
            style={{
              textDecoration: 'none',
              padding: '14px 18px',
              borderRadius: 14,
              border: '1px solid #d5ddea',
              color: '#173A73',
              background: '#fff',
              fontWeight: 700
            }}
          >
            Voir les passations
          </Link>
        </div>
      </div>

      <section
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
          marginBottom: 22
        }}
      >
        <p style={{ marginTop: 0, fontSize: 20, lineHeight: 1.6, color: '#5f6f8e' }}>
          Crée une équipe, importe une liste de joueurs, puis génère automatiquement
          les passations individuelles. Chaque joueur obtient son lien sécurisé.
        </p>

        <form onSubmit={handleImport} style={{ display: 'grid', gap: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="clubId" style={{ fontWeight: 700, color: '#16233b' }}>
                ID club (optionnel)
              </label>
              <input
                id="clubId"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                placeholder="UUID club"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="teamName" style={{ fontWeight: 700, color: '#16233b' }}>
                Nom de l’équipe
              </label>
              <input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex. U17 Rugby"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="season" style={{ fontWeight: 700, color: '#16233b' }}>
                Saison
              </label>
              <input
                id="season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Ex. 2025-2026"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="moduleName" style={{ fontWeight: 700, color: '#16233b' }}>
                Module
              </label>
              <select
                id="moduleName"
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

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="playersText" style={{ fontWeight: 700, color: '#16233b' }}>
              Liste des joueurs
            </label>
            <textarea
              id="playersText"
              value={playersText}
              onChange={(e) => setPlayersText(e.target.value)}
              placeholder={`Un joueur par ligne

Exemples :
Alexandre Griffet
Léa Martin ; lea@email.fr
Hugo Petit, hugo@email.fr`}
              style={{
                ...inputStyle,
                minHeight: 220,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ fontSize: 14, color: '#667085', lineHeight: 1.6 }}>
              Formats acceptés :
              <br />
              • Prénom Nom
              <br />
              • Prénom Nom ; email@domaine.fr
              <br />
              • Prénom Nom, email@domaine.fr
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonPrimary,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Import en cours…' : 'Créer équipe + joueurs + passations'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPlayersText('')
                setResultMessage('')
                setErrorMessage('')
                setCreatedLinks([])
                setCreatedTeamId('')
              }}
              style={buttonSecondary}
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 22,
          alignItems: 'start'
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 30, color: '#16233b' }}>Prévisualisation import</h2>

          {parsedPlayers.length === 0 ? (
            <div style={{ color: '#667085', fontSize: 18 }}>
              Aucun joueur détecté pour le moment.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, color: '#5f6f8e', fontSize: 18 }}>
                {parsedPlayers.length} joueur(s) détecté(s)
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {parsedPlayers.map((player, index) => (
                  <div
                    key={`${player.raw}-${index}`}
                    style={{
                      border: '1px solid #e2e8f4',
                      borderRadius: 16,
                      padding: 14,
                      background: '#f8fafd'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#16233b' }}>
                      {[player.firstname, player.lastname].filter(Boolean).join(' ') || 'Nom vide'}
                    </div>
                    <div style={{ fontSize: 14, color: '#667085', marginTop: 6 }}>
                      {player.email || 'Sans email'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)'
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 26, color: '#16233b' }}>Résumé</h2>

          <div style={{ display: 'grid', gap: 14 }}>
            <StatLine label="Module" value={moduleName} />
            <StatLine label="Équipe" value={teamName || '—'} />
            <StatLine label="Saison" value={season || '—'} />
            <StatLine label="Joueurs détectés" value={String(parsedPlayers.length)} />
            <StatLine label="ID équipe créée" value={createdTeamId || '—'} mono />
          </div>

          {resultMessage ? (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 16,
                background: '#ecfdf3',
                border: '1px solid #abefc6',
                color: '#067647',
                fontWeight: 700,
                lineHeight: 1.5
              }}
            >
              {resultMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 16,
                background: '#fef3f2',
                border: '1px solid #fecdca',
                color: '#b42318',
                fontWeight: 700,
                lineHeight: 1.5
              }}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      </section>

      {createdLinks.length > 0 ? (
        <section
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 14px 40px rgba(21,37,69,0.08)',
            marginTop: 22
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18
            }}
          >
            <h2 style={{ margin: 0, fontSize: 30, color: '#16233b' }}>Liens générés</h2>

            <button type="button" onClick={copyAllLinks} style={buttonSecondary}>
              Copier tous les liens
            </button>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {createdLinks.map((item, index) => (
              <div
                key={`${item.token}-${index}`}
                style={{
                  border: '1px solid #e2e8f4',
                  background: '#f8fafd',
                  borderRadius: 18,
                  padding: 16
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 10
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#16233b' }}>
                    {[item.firstname, item.lastname].filter(Boolean).join(' ') ||
                      `Joueur ${index + 1}`}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#52607d' }}>
                    {item.token}
                  </div>
                </div>

                <div style={{ fontSize: 14, color: '#667085', marginBottom: 10 }}>
                  {item.email || 'Sans email'}
                </div>

                <div
                  style={{
                    background: '#0c244b',
                    color: '#eef4ff',
                    borderRadius: 16,
                    padding: 14,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    lineHeight: 1.7,
                    wordBreak: 'break-all'
                  }}
                >
                  {item.link}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => copyOneLink(item.link)}
                    style={buttonSecondary}
                  >
                    Copier
                  </button>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...buttonSecondary,
                      textDecoration: 'none'
                    }}
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
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
    <div
      style={{
        display: 'grid',
        gap: 6,
        padding: 12,
        borderRadius: 16,
        background: '#f8fafd',
        border: '1px solid #e2e8f4'
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: '#6f7f9d' }}>{label}</div>
      <div
        style={{
          fontSize: mono ? 13 : 18,
          color: '#16233b',
          fontWeight: 700,
          fontFamily: mono ? 'monospace' : 'inherit',
          wordBreak: 'break-all'
        }}
      >
        {value}
      </div>
    </div>
  )
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

const buttonPrimary: CSSProperties = {
  appearance: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '14px 18px',
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 16,
  background: 'linear-gradient(135deg, #2f4d85 0%, #395da0 100%)',
  color: '#fff',
  boxShadow: '0 8px 22px rgba(47, 77, 133, 0.22)'
}

const buttonSecondary: CSSProperties = {
  appearance: 'none',
  border: '1px solid #cfd8e6',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '14px 18px',
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 16,
  background: '#fff',
  color: '#2f4d85'
}
