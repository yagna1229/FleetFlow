import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiPost, openGoogleLogin } from '../api/client.js'
import '../css/login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = useMemo(() => {
    return location.state?.from?.pathname || '/dashboard'
  }, [location.state])

  const [form, setForm] = useState({ email: '', password: '' })
  const [ui, setUi] = useState({ loading: false })

  async function onSubmit(e) {
    e.preventDefault()
    setUi({ loading: true })

    try {
      await apiPost('/auth/login', {
        email: form.email,
        password: form.password,
      })

      toast.success('Logged in successfully')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
      setUi({ loading: false })
      return
    }

    setUi({ loading: false })
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Welcome back</h1>
        <p className="authSubTitle">Login to continue to your dashboard.</p>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="••••••••"
              required
            />
          </label>

          <button className="primaryBtn" disabled={ui.loading} type="submit">
            {ui.loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="dividerRow">
          <div className="divider" />
          <span>or</span>
          <div className="divider" />
        </div>

        <button className="googleBtn" type="button" onClick={openGoogleLogin}>
          Continue with Google
        </button>

        <p className="authFooterText">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  )
}
