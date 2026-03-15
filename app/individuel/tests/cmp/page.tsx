import Link from 'next/link'

export default function CMPIndividualSecurePage() {
  return (
    <main style={{ maxWidth: 980, margin: '40px auto', padding: 20 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          display: 'grid',
          gap: 18
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6b7a99'
            }}
          >
            CMP individuel sécurisé
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 48,
              lineHeight: 1.05,
              color: '#16233b'
            }}
          >
            Accès sécurisé au CMP
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 22,
              lineHeight: 1.4,
              color: '#24324a'
            }}
          >
            Le questionnaire CMP ne se lance plus en accès libre.
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.6,
              color: '#4b5b77'
            }}
          >
            Pour sécuriser les résultats, chaque passage doit désormais suivre ce flux :
            création du joueur, création de la passation, puis ouverture du test via un lien à token.
          </p>
        </div>

        <div
          style={{
            background: '#f6f8fc',
            border: '1px solid #e2e8f4',
            borderRadius: 16,
            padding: 18,
            display: 'grid',
            gap: 10
          }}
        >
          <div style={{ fontWeight: 700, color: '#16233b' }}>Ordre recommandé</div>
          <div style={{ color: '#4b5b77', lineHeight: 1.7 }}>
            1. Créer un joueur
            <br />
            2. Créer une passation CMP
            <br />
            3. Ouvrir le lien sécurisé de passation
            <br />
            4. Laisser le sportif compléter le questionnaire
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          <Link
            href="/players/create"
            style={{
              textDecoration: 'none',
              background: '#173A73',
              color: '#fff',
              padding: '16px 18px',
              borderRadius: 12,
              textAlign: 'center',
              fontWeight: 700
            }}
          >
            Créer un joueur
          </Link>

          <Link
            href="/passations/create"
            style={{
              textDecoration: 'none',
              background: '#173A73',
              color: '#fff',
              padding: '16px 18px',
              borderRadius: 12,
              textAlign: 'center',
              fontWeight: 700
            }}
          >
            Créer une passation CMP
          </Link>

          <Link
            href="/passations"
            style={{
              textDecoration: 'none',
              background: '#eef3fb',
              color: '#173A73',
              padding: '16px 18px',
              borderRadius: 12,
              textAlign: 'center',
              fontWeight: 700,
              border: '1px solid #cfd9ee'
            }}
          >
            Voir les passations
          </Link>

          <Link
            href="/players"
            style={{
              textDecoration: 'none',
              background: '#eef3fb',
              color: '#173A73',
              padding: '16px 18px',
              borderRadius: 12,
              textAlign: 'center',
              fontWeight: 700,
              border: '1px solid #cfd9ee'
            }}
          >
            Voir les joueurs
          </Link>
        </div>

        <div
          style={{
            background: '#fff8e8',
            border: '1px solid #f1dd9b',
            borderRadius: 14,
            padding: 16,
            color: '#6a5520',
            lineHeight: 1.6
          }}
        >
          Cette page ne contient volontairement plus le questionnaire direct.
          Le CMP doit être lancé uniquement via une passation sécurisée.
        </div>
      </div>
    </main>
  )
}
