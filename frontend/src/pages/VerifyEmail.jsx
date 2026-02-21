import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { apiPost } from "../api/client.js";
import "../css/verifyEmail.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [ui, setUi] = useState({ loading: false, resending: false });

  useEffect(() => {
    if (!email) {
      toast.error("Email parameter is missing");
    }
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email || !otp) return;

    setUi({ ...ui, loading: true });

    try {
      await apiPost("/auth/verify-email", {
        email,
        otp,
      });

      toast.success("Email verified successfully!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Verification failed");
    } finally {
      setUi({ ...ui, loading: false });
    }
  }

  async function handleResend() {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setUi({ ...ui, resending: true });
    try {
      await apiPost("/auth/resend-otp", {
        email,
      });
      toast.success("A new OTP has been sent to your email");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setUi({ ...ui, resending: false });
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
        <h1 className="authTitle">Verify Email</h1>
        <p className="authSubTitle">
          Enter the 6-digit code sent to your email address.
        </p>

        <form className="authForm" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={!!emailParam}
            />
          </label>

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

          <button className="primaryBtn" disabled={ui.loading} type="submit">
            {ui.loading ? "Verifying…" : "Verify"}
          </button>
        </form>

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            onClick={handleResend}
            disabled={ui.resending || !email}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            {ui.resending ? "Sending..." : "Didn't receive a code? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
}
