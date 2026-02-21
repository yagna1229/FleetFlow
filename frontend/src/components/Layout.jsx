/**
 * Layout — top nav + sidebar + main content area.
 * Auth pages (login/signup) use full-width centered layout without sidebar.
 */
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../store/slices/authSlice'
import Sidebar from './Sidebar'
import '../css/layout.css'

export default function Layout() {
  const location = useLocation()
  const dispatch = useDispatch()
  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password')

  const handleLogout = async () => {
    await dispatch(logoutUser())
    window.location.href = '/login'
  }

  return (
    <div className="appShell">
      <header className="topNav">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <span className="brandText">FleetFlow</span>
        </div>

        <div className="navRight">
          {!isAuthPage && (
            <button className="secondaryBtn logoutBtn" onClick={handleLogout}>
              Logout
            </button>
          )}
          {isAuthPage && (
            <nav className="navLinks">
              <Link className={location.pathname === '/login' ? 'active' : ''} to="/login">
                Login
              </Link>
              <Link className={location.pathname === '/signup' ? 'active' : ''} to="/signup">
                Signup
              </Link>
            </nav>
          )}
        </div>
      </header>

      {isAuthPage ? (
        <main className="mainContent mainContentAuth">
          <Outlet />
        </main>
      ) : (
        <div className="appBody">
          <Sidebar />
          <main className="mainContent mainContentApp">
            <Outlet />
          </main>
        </div>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} FleetFlow</span>
      </footer>
    </div>
  )
}
