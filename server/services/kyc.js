const BASE = "https://api.withmono.com";

const post = async (path, body) => {
  if (!process.env.MONO_SEC_KEY) {
    return { ok: false, status: 503, data: { message: "MONO_SEC_KEY not configured on the server" } };
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "mono-sec-key": process.env.MONO_SEC_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  const ok = res.ok && data?.status !== "failed" && !data?.message?.toLowerCase?.().includes("not found");
  return { ok, status: res.status, data };
};

export const verifyNIN = (nin) => post("/v2/lookup/nin", { nin });

export const verifyBVN = (bvn) => post("/v2/lookup/bvn", { bvn });
