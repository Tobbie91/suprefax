import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../api/client";
import useStore from "../store/useStore";
import { useSignOut } from "../hooks/useSignOut";
import "./Login.css";

export default function Kyc() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();
  const handleSignOut = useSignOut();

  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAgent = user?.role === "agent";
  const accent = isAgent ? "var(--purple)" : "var(--blue)";
  const successRoute = isAgent ? "/agent" : "/borrower";

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!/^\d{11}$/.test(nin)) return setError("NIN must be 11 digits.");
    if (!/^\d{11}$/.test(bvn)) return setError("BVN must be 11 digits.");
    if (!address.trim() || address.trim().length < 5) return setError("Please enter your full residential address.");

    setLoading(true);
    try {
      await api.post("/kyc/submit", { nin, bvn, address: address.trim() });
      if (user) setUser({ ...user, kyc_status: "verified" });
      navigate(successRoute);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Verification failed. Please check your details and try again.");
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
          <div className="sx-hero-eyebrow">Identity verification</div>
          <div className="sx-hero-headline">
            Verify your
            <br />
            identity to continue.
          </div>
          <div className="sx-hero-sub">
            Before you can access your {isAgent ? "agent portal" : "loan products"}, we need to verify your NIN and BVN.
            All data is checked through Mono and stored securely.
          </div>
        </div>

        <div className="sx-products-list">
          <div className="sx-pl-label">What we'll verify</div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#1B4FD8" }} />
            <div>
              <div className="sx-pl-name">National Identification Number</div>
              <div className="sx-pl-range">11-digit NIN, looked up via Mono</div>
            </div>
          </div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#0F7B6C" }} />
            <div>
              <div className="sx-pl-name">Bank Verification Number</div>
              <div className="sx-pl-range">11-digit BVN, matched to your bank record</div>
            </div>
          </div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#6D28D9" }} />
            <div>
              <div className="sx-pl-name">Residential address</div>
              <div className="sx-pl-range">Street, city, state</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sx-right">
        <form className="sx-signin-box" onSubmit={handleSubmit}>
          <div className="sx-si-title">Verify your identity</div>
          <div className="sx-si-sub">
            Signed in as {user?.email}. Complete all three fields to unlock your {isAgent ? "agent" : "borrower"} dashboard.
          </div>

          {error && <div className="sx-err-box">{error}</div>}

          <div className="sx-fg">
            <label className="sx-fl">NIN</label>
            <input
              className="sx-fi"
              type="text"
              inputMode="numeric"
              maxLength={11}
              placeholder="11-digit NIN"
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="sx-fg">
            <label className="sx-fl">BVN</label>
            <input
              className="sx-fi"
              type="text"
              inputMode="numeric"
              maxLength={11}
              placeholder="11-digit BVN"
              value={bvn}
              onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div className="sx-fg">
            <label className="sx-fl">Residential address</label>
            <textarea
              className="sx-fi"
              rows={2}
              placeholder="Street, city, state"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: "vertical", fontFamily: "var(--font)" }}
            />
          </div>

          <button
            type="submit"
            className="sx-submit-btn"
            style={{ background: accent }}
            disabled={loading}
          >
            {loading ? "Verifying…" : "Submit for verification →"}
          </button>

          <div className="sx-si-footer">
            Need to come back later? <a onClick={handleSignOut} style={{ cursor: "pointer" }}>Sign out</a>
          </div>
        </form>
      </div>
    </div>
  );
}
