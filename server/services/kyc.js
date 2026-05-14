const BASE = "https://api.youverify.co/v2/api";

const post = async (path, body) => {
  if (!process.env.YOUVERIFY_KEY) {
    return { ok: false, status: 503, data: { message: "YOUVERIFY_KEY not configured on the server" } };
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Token: process.env.YOUVERIFY_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data?.statusCode !== 400 && data?.success !== false, status: res.status, data };
};

export const verifyNIN = (nin) =>
  post("/identity/ng/nin", { id: nin, isSubjectConsent: true });

export const verifyBVN = (bvn) =>
  post("/identity/ng/bvn", { id: bvn, isSubjectConsent: true });

export const verifyLiveness = (imageBase64) =>
  post("/livenesses/photo", { image: imageBase64, isSubjectConsent: true });

export const faceMatch = (selfieBase64, referenceImageUrl) =>
  post("/identity/face_authentication", {
    image: selfieBase64,
    referenceImage: referenceImageUrl,
    isSubjectConsent: true,
  });
