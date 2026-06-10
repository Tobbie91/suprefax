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

export const initiateProve = ({ customer, redirectUrl, reference, kycLevel = "tier_2", bankAccounts = true, meta = {} }) =>
  post("/v1/prove/initiate", {
    customer,
    redirect_url: redirectUrl,
    reference,
    kyc_level: kycLevel,
    bank_accounts: bankAccounts,
    meta,
  });
