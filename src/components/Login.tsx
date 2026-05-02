import { useState, ReactNode, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../api/client";
import useStore from "../store/useStore";
import { initSocket } from "../socket";
import type { AuthResponse, UserRole } from "../types/api";
import "./Login.css";

interface RoleOption {
  key: UserRole;
  label: string;
  desc: string;
  accent: string;
  bg: string;
  icon: ReactNode;
}

const ROLES: RoleOption[] = [
  {
    key: "borrower",
    label: "Borrower",
    desc: "Apply & track loans",
    accent: "var(--blue)",
    bg: "var(--blue-lt)",
    icon: (
      <svg viewBox="0 0 20 20" fill="var(--blue)">
        <path d="M10 12a4 4 0 100-8 4 4 0 000 8zm-6.938 4h13.856C16.09 14.004 13.232 12 10 12s-6.09 2.004-6.938 4z" />
      </svg>
    ),
  },
  {
    key: "agent",
    label: "Agent",
    desc: "Track customers",
    accent: "var(--purple)",
    bg: "var(--purple-lt)",
    icon: (
      <svg viewBox="0 0 20 20" fill="var(--purple)">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM4.5 16a4.5 4.5 0 019 0H4.5zM14 16h5.5a4.5 4.5 0 00-9 0H14z" />
      </svg>
    ),
  },
  {
    key: "admin",
    label: "Admin",
    desc: "Full system access",
    accent: "var(--coral)",
    bg: "var(--coral-lt)",
    icon: (
      <svg viewBox="0 0 20 20" fill="var(--coral)">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2H3V4zm0 6h14v2H3v-2zm0 6h14v2H3v-2z" />
      </svg>
    ),
  },
];

const PRODUCTS = [
  { color: "#1B4FD8", name: "Student POF", range: "Proof of funds for student visa & admissions · ₦500K – ₦10M" },
  { color: "#0F7B6C", name: "Travel POF", range: "Embassy proof of funds for international travel · ₦200K – ₦5M" },
  { color: "#6D28D9", name: "LPO financing", range: "Fund fulfilment of Local Purchase Orders · Up to ₦20M" },
  { color: "#C2410C", name: "Soft business loan", range: "Low-interest loans for small businesses · ₦500K – ₦15M" },
];

const ROLE_ROUTES: Record<UserRole, string> = {
  borrower: "/borrower",
  agent: "/agent",
  admin: "/admin",
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("borrower");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();

  const activeRole = ROLES.find((r) => r.key === selectedRole)!;

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      initSocket(data.user.id);

      if (data.user.role !== selectedRole) {
        setInfo(
          `You selected ${activeRole.label} but your account role is ${data.user.role}. Routing to your dashboard.`
        );
      }

      navigate(ROLE_ROUTES[data.user.role] || "/");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          "Login failed. Check your credentials and try again."
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
            Move money
            <br />
            with confidence.
          </div>
          <div className="sx-hero-sub">
            A secure platform connecting borrowers, agents, and administrators
            for loans, proof of funds, and business financing.
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
          <div className="sx-si-title">Welcome back</div>
          <div className="sx-si-sub">
            Sign in to your Suprefax account. Choose your role to be directed to the right portal.
          </div>

          <div className="sx-role-label">I am signing in as</div>
          <div className="sx-role-grid">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className={`sx-role-btn${
                  selectedRole === r.key ? ` active r-${r.key === "borrower" ? "customer" : r.key}` : ""
                }`}
                onClick={() => setSelectedRole(r.key)}
              >
                <div className="sx-role-icon" style={{ background: r.bg }}>
                  {r.icon}
                </div>
                <div className="sx-role-text">{r.label}</div>
                <div className="sx-role-desc">{r.desc}</div>
              </div>
            ))}
          </div>

          {error && <div className="sx-err-box">{error}</div>}
          {info && <div className="sx-info-box">{info}</div>}

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
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="sx-form-row">
            <label className="sx-check-label">
              <input type="checkbox" style={{ accentColor: "var(--blue)" }} />
              Remember me
            </label>
            <button
              type="button"
              className="sx-forgot"
              onClick={() => alert("Contact Suprefax to reset your password")}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="sx-submit-btn"
            style={{ background: activeRole.accent }}
            disabled={loading}
          >
            {loading ? "Signing in…" : `Sign in as ${activeRole.label} →`}
          </button>

          <div className="sx-si-footer">
            New to Suprefax?{" "}
            <a onClick={() => alert("Contact Suprefax to register an account")}>
              Request access
            </a>
            <br />
            By signing in you agree to our <a>Terms of Service</a> and{" "}
            <a>Privacy Policy</a>
          </div>
        </form>
      </div>
    </div>
  );
}
