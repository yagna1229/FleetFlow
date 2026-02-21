import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiPost } from "../api/client.js";
import "../css/forgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [ui, setUi] = useState({ loading: false });

  async function onRequestOtp(e) {
    e.preventDefault();
    if (!email) return;

    setUi({ loading: true });

    try {
      await apiPost("/auth/forgot-password", {
        email,
      });
      toast.success(
        "If that email matches an account, we sent a password reset code.",
      );
      setStep(2);
    } catch (err) {
      toast.error("Failed to request reset. Please try again.");
    } finally {
      setUi({ loading: false });
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    if (!email || !otp || !newPassword) return;

    setUi({ loading: true });

    try {
      await apiPost("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success("Password successfully reset! You can now login.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.message || "Failed to reset password. Please check your code.",
      );
    } finally {
      setUi({ loading: false });
    }
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authLogo">
          <img
            src="/Gemini_Generated_Image_sl6nqsl6nqsl6nqs.png"
            alt="FleetFlow Logo"
          />
        </div>
        {step === 1 ? (
          <>
            <h1 className="authTitle">Forgot Password</h1>
            <p className="authSubTitle">
              Enter your email address and we'll send you a password reset code.
            </p>

            <form className="authForm" onSubmit={onRequestOtp}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <button
                className="primaryBtn"
                disabled={ui.loading}
                type="submit"
              >
                {ui.loading ? "Sending…" : "Send Code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="authTitle">Reset Password</h1>
            <p className="authSubTitle">
              Enter the 6-digit code sent to your email, along with your new
              password.
            </p>

            <form className="authForm" onSubmit={onResetPassword}>
              <label className="field">
                <span>Verification Code</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </label>

              <label className="field">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </label>

              <button
                className="primaryBtn"
                disabled={ui.loading}
                type="submit"
              >
                {ui.loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
