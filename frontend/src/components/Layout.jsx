import { Link, Outlet, useLocation } from 'react-router-dom'
import '../css/layout.css'

export default function Layout() {
  const location = useLocation()
  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup')

  return (
    <div className="appShell">
      <header className="topNav">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <span className="brandText">Odoo Mock</span>
        </div>

        <nav className="navLinks">
          <Link className={isAuthPage ? 'active' : ''} to="/login">
            Login
          </Link>
          <Link className={location.pathname.startsWith('/signup') ? 'active' : ''} to="/signup">
            Signup
          </Link>
          <Link
            className={location.pathname.startsWith('/dashboard') ? 'active' : ''}
            to="/dashboard"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mainContent">
        <Outlet />
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Odoo Mock</span>
      </footer>
    </div>
  )
}
