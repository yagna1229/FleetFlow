import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiPost, openGoogleLogin } from '../api/client.js'
import { ROLES, ROLE_META } from '../constants/roles.js'
import '../css/login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = useMemo(() => {
    return location.state?.from?.pathname || '/dashboard'
  }, [location.state])

  const [form, setForm] = useState({ email: '', password: '' })
  const [selectedRole, setSelectedRole] = useState(null)
  const [ui, setUi] = useState({ loading: false })

  async function onSubmit(e) {
    e.preventDefault()
    if (!selectedRole) {
      toast.error('Please select your role first')
      return
    }
    setUi({ loading: true })

    try {
      const res = await apiPost('/auth/login', {
        email: form.email,
        password: form.password,
      })

      if (res.is_verified === false) {
        toast.warning(res.message || 'Please verify your email')
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`)
        return
      }

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
        <p className="authSubTitle">Select your role and login to continue.</p>

        {/* ── Role selector cards ── */}
        <div className="roleGrid">
          {Object.values(ROLES).map((role) => {
            const meta = ROLE_META[role]
            return (
              <button
                key={role}
                type="button"
                className={`roleCard${selectedRole === role ? ' roleCardActive' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <span className="roleCardIcon">{meta.icon}</span>
                <span className="roleCardLabel">{meta.label}</span>
              </button>
            )
          })}
        </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
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

          <button className="primaryBtn" disabled={ui.loading || !selectedRole} type="submit">
            {ui.loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="dividerRow">
          <div className="divider" />
          <span>or</span>
          <div className="divider" />
        </div>

        <button
          className="googleBtn"
          type="button"
          disabled={!selectedRole}
          onClick={() => openGoogleLogin(selectedRole)}
          title={!selectedRole ? 'Select a role first' : ''}
        >
          Continue with Google
        </button>
        {!selectedRole && (
          <p className="roleHint">⬆ Select a role above to enable Google login</p>
        )}

        <p className="authFooterText">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  )
}
