import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../api/client";
import useStore from "../store/useStore";
import { useSignOut } from "../hooks/useSignOut";
import type { KycStatus } from "../types/api";
import "./Login.css";

export default function Kyc() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = useSignOut();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<number | null>(null);

  const isAgent = user?.role === "agent";
  const accent = isAgent ? "var(--purple)" : "var(--blue)";
  const successRoute = isAgent ? "/agent" : "/borrower";

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  };

  useEffect(() => {
    return stopPolling;
  }, []);

  const refreshStatus = async (): Promise<KycStatus | undefined> => {
    try {
      const { data } = await api.get<{ kyc_status: KycStatus; kyc_rejection_reason?: string }>("/kyc/status");
      if (user && data.kyc_status) setUser({ ...user, kyc_status: data.kyc_status });
      if (data.kyc_status === "verified") {
        stopPolling();
        navigate(successRoute);
      } else if (data.kyc_status === "rejected") {
        stopPolling();
        setError(data.kyc_rejection_reason || "Verification was rejected. You can try again.");
      }
      return data.kyc_status;
    } catch (err) {
      console.warn("status fetch failed", err);
      return undefined;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "mono-return") {
      setPolling(true);
      refreshStatus();
      pollRef.current = window.setInterval(refreshStatus, 4000);
    }
  }, [location.search]);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ mono_url: string; reference: string }>("/kyc/initiate");
      if (!data.mono_url) {
        setError("Could not start verification. Please try again.");
        return;
      }
      window.location.href = data.mono_url;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; details?: { message?: string } }>;
      setError(
        axiosErr.response?.data?.details?.message ||
          axiosErr.response?.data?.message ||
          "Could not start verification. Please try again."
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
          <div className="sx-hero-eyebrow">Identity verification</div>
          <div className="sx-hero-headline">
            Verify with
            <br />
            your bank.
          </div>
          <div className="sx-hero-sub">
            Suprefax uses Mono to verify your identity through your bank. We never see your bank password, and your data stays encrypted.
          </div>
        </div>

        <div className="sx-products-list">
          <div className="sx-pl-label">How it works</div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#1B4FD8" }} />
            <div>
              <div className="sx-pl-name">1. Click verify</div>
              <div className="sx-pl-range">You'll be taken to Mono's secure verification page.</div>
            </div>
          </div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#0F7B6C" }} />
            <div>
              <div className="sx-pl-name">2. Pick your bank</div>
              <div className="sx-pl-range">Log in to confirm your identity directly with your bank.</div>
            </div>
          </div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#6D28D9" }} />
            <div>
              <div className="sx-pl-name">3. Done in seconds</div>
              <div className="sx-pl-range">We'll unlock your {isAgent ? "agent portal" : "borrower dashboard"} once verified.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sx-right">
        <div className="sx-signin-box">
          <div className="sx-si-title">Verify your identity</div>
          <div className="sx-si-sub">
            Signed in as {user?.email}. Verification is a one-time step.
          </div>

          {error && <div className="sx-err-box">{error}</div>}

          {polling && (
            <div className="sx-info-box">
              Waiting for verification to complete… You can leave this page open.
            </div>
          )}

          {user?.kyc_status === "rejected" && !error && (
            <div className="sx-err-box">
              Your last verification attempt was rejected. You can try again below.
            </div>
          )}

          <button
            type="button"
            className="sx-submit-btn"
            style={{ background: accent, marginTop: 12 }}
            onClick={handleVerify}
            disabled={loading || polling}
          >
            {loading ? "Starting verification…" : polling ? "Verification in progress…" : "Verify with my bank →"}
          </button>

          <div className="sx-si-footer" style={{ marginTop: 20 }}>
            Powered by Mono · Bank-grade encryption
            <br />
            Need to come back later? <a onClick={handleSignOut} style={{ cursor: "pointer" }}>Sign out</a>
          </div>
        </div>
      </div>
    </div>
  );
}
