import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiPost, openGoogleLogin } from "../api/client.js";
import { ROLES, ROLE_META } from "../constants/roles.js";
import "../css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    return location.state?.from?.pathname || "/dashboard";
  }, [location.state]);

  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("");
  const [ui, setUi] = useState({ loading: false });

  async function onSubmit(e) {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select your role first");
      return;
    }
    setUi({ loading: true });

    try {
      const res = await apiPost("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (res.is_verified === false) {
        toast.warning(res.message || "Please verify your email");
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }

      toast.success("Logged in successfully");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
      setUi({ loading: false });
      return;
    }

    setUi({ loading: false });
  }

  return (
    <div className="authPage">
      <div className="authCard">
        {/* ── Logo ── */}
        <div className="authLogo">
          <img
            src="/Gemini_Generated_Image_sl6nqsl6nqsl6nqs.png"
            alt="FleetFlow Logo"
          />
        </div>

        <h1 className="authTitle">Welcome back</h1>
        <p className="authSubTitle">Select your role and login to continue.</p>

        {/* ── Role dropdown ── */}
        <div className="roleDropdownWrapper">
          <label htmlFor="roleSelect">Select Role</label>
          <select
            id="roleSelect"
            className="roleDropdown"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="" disabled>
              Choose your role…
            </option>
            {Object.values(ROLES).map((role) => {
              const meta = ROLE_META[role];
              return (
                <option key={role} value={role}>
                  {meta.icon} {meta.label}
                </option>
              );
            })}
          </select>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="field">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Password</span>
              <Link to="/forgot-password">Forgot Password?</Link>
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

          <button
            className="primaryBtn"
            disabled={ui.loading || !selectedRole}
            type="submit"
          >
            {ui.loading ? "Signing in…" : "Login"}
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
          title={!selectedRole ? "Select a role first" : ""}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
        {!selectedRole && (
          <p className="roleHint">
            ⬆ Select a role above to enable Google login
          </p>
        )}

        <p className="authFooterText">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
