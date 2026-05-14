import { useEffect, useRef, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../api/client";
import useStore from "../store/useStore";
import "./Login.css";

export default function AgentKyc() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const clearUser = useStore((s) => s.clearUser);
  const navigate = useNavigate();

  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [address, setAddress] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch (err) {
      setError("Could not access camera. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setSelfie(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  };

  const retakeSelfie = () => {
    setSelfie(null);
    startCamera();
  };

  const handleSignOut = () => {
    stopCamera();
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!/^\d{11}$/.test(nin)) return setError("NIN must be 11 digits.");
    if (!/^\d{11}$/.test(bvn)) return setError("BVN must be 11 digits.");
    if (!address.trim() || address.trim().length < 5) return setError("Please enter your full residential address.");
    if (!selfie) return setError("Please capture a live selfie.");

    setLoading(true);
    try {
      await api.post("/agent/kyc/submit", { nin, bvn, address: address.trim(), selfie });
      if (user) setUser({ ...user, kyc_status: "verified" });
      navigate("/agent");
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
          <div className="sx-hero-eyebrow">Agent verification</div>
          <div className="sx-hero-headline">
            Complete your
            <br />
            identity check.
          </div>
          <div className="sx-hero-sub">
            Before you can access the agent portal, we need to verify your NIN, BVN, address and a live selfie.
            All data is checked through Youverify and stored securely.
          </div>
        </div>

        <div className="sx-products-list">
          <div className="sx-pl-label">What we'll verify</div>
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#1B4FD8" }} />
            <div>
              <div className="sx-pl-name">National Identification Number</div>
              <div className="sx-pl-range">11-digit NIN, looked up via NIMC</div>
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
          <div className="sx-pl-item">
            <div className="sx-pl-dot" style={{ background: "#C2410C" }} />
            <div>
              <div className="sx-pl-name">Live selfie</div>
              <div className="sx-pl-range">Captured in-browser, face-matched to your NIN photo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sx-right">
        <form className="sx-signin-box" onSubmit={handleSubmit}>
          <div className="sx-si-title">Verify your identity</div>
          <div className="sx-si-sub">
            Signed in as {user?.email}. Complete all four steps to unlock the agent portal.
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

          <div className="sx-fg">
            <label className="sx-fl">Live selfie</label>
            <div style={{
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--r2)",
              padding: 16,
              background: "var(--white)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}>
              {!streaming && !selfie && (
                <>
                  <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                    We'll open your camera. Look straight at the lens in good lighting.
                  </div>
                  <button type="button" className="sx-submit-btn" style={{ background: "var(--blue)", width: "auto", padding: "10px 18px" }} onClick={startCamera}>
                    Start camera
                  </button>
                </>
              )}
              {streaming && (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ width: "100%", maxWidth: 320, borderRadius: "var(--r3)", background: "#000" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="sx-submit-btn" style={{ background: "var(--blue)", padding: "8px 16px" }} onClick={captureSelfie}>
                      Capture
                    </button>
                    <button type="button" className="sx-submit-btn" style={{ background: "var(--muted)", padding: "8px 16px" }} onClick={stopCamera}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {selfie && (
                <>
                  <img src={selfie} alt="Captured selfie" style={{ width: "100%", maxWidth: 320, borderRadius: "var(--r3)" }} />
                  <button type="button" className="sx-submit-btn" style={{ background: "var(--muted)", padding: "8px 16px" }} onClick={retakeSelfie}>
                    Retake
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="sx-submit-btn"
            style={{ background: "var(--purple)" }}
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
