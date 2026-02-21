import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiPost, openGoogleLogin } from '../api/client.js'
import { ROLES, ROLE_META } from '../constants/roles.js'
import '../css/signup.css'

export default function Signup() {
  const navigate = useNavigate()

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
      await apiPost('/auth/signup', {
        email: form.email,
        password: form.password,
        role: selectedRole,
      })

      toast.success('Account created')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Signup failed')
      setUi({ loading: false })
      return
    }

    setUi({ loading: false })
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Create account</h1>
        <p className="authSubTitle">Select your role and sign up to get started.</p>

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
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Create a strong password"
              minLength={6}
              required
            />
          </label>

          <button className="primaryBtn" disabled={ui.loading || !selectedRole} type="submit">
            {ui.loading ? 'Creating…' : 'Signup'}
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
          Signup with Google
        </button>
        {!selectedRole && (
          <p className="roleHint">⬆ Select a role above to enable Google signup</p>
        )}

        <p className="authFooterText">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
