export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <img src="/assets/logo-a4p.png" alt="A4P" />
          <div>
            <div className="brand-title">A4P Platform V11</div>
            <div className="small" style={{ color: 'rgba(255,255,255,.8)' }}>
              Individuel • Club • Admin • Email résultats
            </div>
          </div>
        </div>
        <nav className="nav-links">
          <a href="/">Portail</a>
          <a href="/individuel">Individuel</a>
          <a href="/club">Club</a>
          <a href="/admin">Admin</a>
          <a href="/login">Connexion</a>
        </nav>
      </div>
    </header>
  )
}
