import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiGet, apiPost } from '../api/client.js'
import '../css/dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [ui, setUi] = useState({ loading: true, error: '' })
  const [message, setMessage] = useState('')

  async function load() {
    setUi({ loading: true, error: '' })
    try {
      const data = await apiGet('/dashboard/')
      setMessage(data?.message || 'Welcome')
      setUi({ loading: false, error: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard')
      setUi({ loading: false, error: err.message || 'Failed to load dashboard' })
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onLogout() {
    try {
      await apiPost('/auth/logout', {})
    } catch {
      // ignore
    }
    toast.info('Logged out')
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashWrap">
      <div className="dashHeader">
        <div>
          <h1 className="dashTitle">Dashboard</h1>
          <p className="dashSubTitle">You are successfully authenticated.</p>
        </div>
        <div className="dashActions">
          <button className="secondaryBtn" onClick={load} disabled={ui.loading}>
            Refresh
          </button>
          <button className="dangerBtn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {ui.error ? <div className="alertError">{ui.error}</div> : null}

      <div className="dashCard">
        <div className="dashCardLabel">Message from API</div>
        <div className="dashCardValue">
          {ui.loading ? 'Loading…' : message}
        </div>
      </div>

      <div className="dashHint">
        Tip: Google Login redirects directly to <code>/dashboard</code> after setting the cookie.
      </div>
    </div>
  )
}
