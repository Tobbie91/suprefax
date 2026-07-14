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
  return { ok: res.ok && data?.status !== "failed", status: res.status, data };
};

const get = async (path) => {
  if (!process.env.MONO_SEC_KEY) {
    return { ok: false, status: 503, data: { message: "MONO_SEC_KEY not configured on the server" } };
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: {
      "mono-sec-key": process.env.MONO_SEC_KEY,
      Accept: "application/json",
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data?.status !== "failed", status: res.status, data };
};

export const initiateProve = ({ customer, redirectUrl, reference, kycLevel = "tier_2", bankAccounts = true, meta = {} }) =>
  post("/v1/prove/initiate", {
    customer,
    redirect_url: redirectUrl,
    reference,
    kyc_level: kycLevel,
    bank_accounts: bankAccounts,
    meta,
  });

export const getProveStatus = async (reference) => {
  const paths = [
    `/v1/prove/verifications/${encodeURIComponent(reference)}`,
    `/v1/prove/status?reference=${encodeURIComponent(reference)}`,
    `/v1/prove/${encodeURIComponent(reference)}/status`,
  ];
  let lastResult;
  for (const p of paths) {
    lastResult = await get(p);
    if (lastResult.ok) return lastResult;
    if (lastResult.status !== 404) return lastResult;
  }
  return lastResult;
};
