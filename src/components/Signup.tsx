import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../api/client";
import useStore from "../store/useStore";
import { initSocket } from "../socket";
import type { AuthResponse } from "../types/api";
import "./Login.css";

const PRODUCTS = [
  { color: "#1B4FD8", name: "Student POF", range: "Proof of funds for student visa & admissions · ₦500K – ₦10M" },
  { color: "#0F7B6C", name: "Travel POF", range: "Embassy proof of funds for international travel · ₦200K – ₦5M" },
  { color: "#6D28D9", name: "LPO financing", range: "Fund fulfilment of Local Purchase Orders · Up to ₦20M" },
  { color: "#C2410C", name: "Soft business loan", range: "Low-interest loans for small businesses · ₦500K – ₦15M" },
];

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!email || !password || !fullName) {
      setError("Please fill in your name, email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, full_name: fullName });
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      initSocket(data.user.id);

      navigate("/borrower");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suprefax-login">
      <div className="sx-left">
        <div className="sx-left-header">
          <div className="sx-logo-mark">
            <svg viewBox="0 0 16 16">
              <path d="M2 2h4v12H2V2zm8 0h4v12h-4V2zm-4 4h4v4H6V6z" />
            </svg>
          </div>
          <span className="sx-logo-name">Suprefax</span>
        </div>

        <div className="sx-hero-text">
          <div className="sx-hero-eyebrow">Financial Services Portal</div>
          <div className="sx-hero-headline">
            Create your
            <br />
            Suprefax account.
          </div>
          <div className="sx-hero-sub">
            Borrowers can sign up directly. Agent accounts are created by your administrator.
          </div>
        </div>

        <div className="sx-products-list">
          <div className="sx-pl-label">Our products</div>
          {PRODUCTS.map((p) => (
            <div className="sx-pl-item" key={p.name}>
              <div className="sx-pl-dot" style={{ background: p.color }} />
              <div>
                <div className="sx-pl-name">{p.name}</div>
                <div className="sx-pl-range">{p.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sx-right">
        <form className="sx-signin-box" onSubmit={handleSubmit}>
          <div className="sx-si-title">Get started</div>
          <div className="sx-si-sub">
            Sign up as a borrower to apply for proof of funds, travel POF, LPO financing or soft business loans.
          </div>

          {error && <div className="sx-err-box">{error}</div>}

          <div className="sx-fg">
            <label className="sx-fl">Full name</label>
            <input
              className="sx-fi"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="sx-fg">
            <label className="sx-fl">Email address</label>
            <input
              className="sx-fi"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="sx-fg">
            <label className="sx-fl">Password</label>
            <input
              className="sx-fi"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="sx-fg">
            <label className="sx-fl">Confirm password</label>
            <input
              className="sx-fi"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="sx-submit-btn"
            style={{ background: "var(--blue)" }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create borrower account →"}
          </button>

          <div className="sx-si-footer">
            Already have an account? <Link to="/login">Sign in</Link>
            <br />
            By signing up you agree to our <a>Terms of Service</a> and{" "}
            <a>Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  );
}
