import { useState, ReactNode, ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../api/client";

interface Agent {
  id: string;
  full_name: string;
  email: string;
}

interface Baseline {
  product_key: string;
  duration_days: number;
  baseline_monthly_rate_pct: number;
}

const PRODUCTS = [
  { key: "Student POF", desc: "Proof of funds for student visa & admissions", range: "₦500K – ₦10M", color: "var(--blue)", bg: "var(--blue-lt)" },
  { key: "Travel POF", desc: "Embassy proof of funds for international travel", range: "₦200K – ₦5M", color: "var(--teal)", bg: "var(--teal-lt)" },
  { key: "LPO financing", desc: "Short-term financing to fulfil a Local Purchase Order", range: "Up to ₦20M", color: "var(--purple)", bg: "var(--purple-lt)" },
  { key: "Soft business loan", desc: "Low-interest business financing for SMEs", range: "₦500K – ₦15M", color: "var(--red)", bg: "var(--red-lt)" },
];

const DURATIONS = [30, 60, 90];

const PRODUCT_SPECIFIC_LABEL: Record<string, string> = {
  "Student POF": "Admission letter",
  "Travel POF": "Visa application / appointment letter",
  "LPO financing": "Local Purchase Order document",
  "Soft business loan": "CAC business registration",
};

const REQUIRED_DOCS = [
  { key: "gov_id", label: "Government ID (NIN slip or passport data page)" },
  { key: "bank_statement", label: "Bank statement (last 3 months)" },
  { key: "proof_of_address", label: "Proof of address (≤ 3 months old)" },
];

interface WizardState {
  agent_id: string;
  product: string;
  amount: string;
  duration_days: number;
  purpose: string;
  int_passport_no: string;
  borrower_address: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  nok_name: string;
  nok_phone: string;
  nok_address: string;
  nok_relationship: string;
  declaration: { infant: boolean; sound: boolean; fraud: boolean; bankrupt: boolean };
  files: Record<string, File | null>;
  additionalFiles: File[];
}

const EMPTY: WizardState = {
  agent_id: "",
  product: "",
  amount: "",
  duration_days: 30,
  purpose: "",
  int_passport_no: "",
  borrower_address: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  nok_name: "",
  nok_phone: "",
  nok_address: "",
  nok_relationship: "",
  declaration: { infant: false, sound: false, fraud: false, bankrupt: false },
  files: { gov_id: null, bank_statement: null, proof_of_address: null, product_specific: null },
  additionalFiles: [],
};

const fmtMoney = (n: number | string): string => `₦${Number(n || 0).toLocaleString()}`;

interface Props {
  setActiveTab: (t: string) => void;
}

export default function ApplyWizard({ setActiveTab }: Props) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["verified-agents"],
    queryFn: () => api.get("/agents/verified").then((r) => r.data),
  });

  const { data: baselines = [] } = useQuery<Baseline[]>({
    queryKey: ["loan-baselines"],
    queryFn: () => api.get("/loan-baselines").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const baseline = baselines.find((b) => b.product_key === state.product && b.duration_days === state.duration_days);

  const validateStep = (): string | null => {
    switch (step) {
      case 0: return state.agent_id ? null : "Pick an agent to continue.";
      case 1:
        if (!state.product) return "Pick a product.";
        if (!state.amount || Number(state.amount) <= 0) return "Enter a valid amount.";
        if (!DURATIONS.includes(state.duration_days)) return "Pick a duration.";
        if (!state.purpose.trim()) return "Tell us why you need the loan.";
        return null;
      case 2:
        if (!state.int_passport_no.trim()) return "International passport number is required.";
        if (!state.borrower_address.trim() || state.borrower_address.trim().length < 5) return "Enter your residential address.";
        return null;
      case 3:
        if (!state.bank_name.trim()) return "Bank name is required.";
        if (!/^\d{10}$/.test(state.bank_account_number)) return "Account number must be 10 digits.";
        if (!state.bank_account_name.trim()) return "Account name is required.";
        return null;
      case 4:
        if (!state.nok_name.trim()) return "Next of Kin name is required.";
        if (!/^0\d{10}$/.test(state.nok_phone)) return "NOK phone must be 11 digits starting with 0.";
        if (!state.nok_address.trim()) return "NOK address is required.";
        if (!state.nok_relationship.trim()) return "Relationship is required.";
        return null;
      case 5:
        for (const d of REQUIRED_DOCS) {
          if (!state.files[d.key]) return `Upload ${d.label}.`;
        }
        if (!state.files.product_specific) return `Upload ${PRODUCT_SPECIFIC_LABEL[state.product] || "the product document"}.`;
        return null;
      case 6:
        if (!Object.values(state.declaration).every(Boolean)) return "You must accept all four declarations.";
        return null;
      default: return null;
    }
  };

  const next = () => {
    const e = validateStep();
    if (e) { setError(e); return; }
    setError(null);
    setStep((s) => s + 1);
  };

  const back = () => { setError(null); setStep((s) => Math.max(0, s - 1)); };

  const handleFile = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    update({ files: { ...state.files, [key]: f } });
  };

  const handleAdditional = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    update({ additionalFiles: list });
  };

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { data: app } = await api.post("/borrower/applications", {
        agent_id: state.agent_id,
        product: state.product,
        amount: Number(state.amount),
        duration_days: state.duration_days,
        purpose: state.purpose.trim(),
        int_passport_no: state.int_passport_no.trim(),
        borrower_address: state.borrower_address.trim(),
        bank_name: state.bank_name.trim(),
        bank_account_number: state.bank_account_number,
        bank_account_name: state.bank_account_name.trim(),
        nok_name: state.nok_name.trim(),
        nok_phone: state.nok_phone,
        nok_address: state.nok_address.trim(),
        nok_relationship: state.nok_relationship.trim(),
        declaration_accepted: true,
      });

      const appId = app.id;
      const uploads: Promise<unknown>[] = [];
      for (const key of ["gov_id", "bank_statement", "proof_of_address", "product_specific"]) {
        const f = state.files[key];
        if (!f) continue;
        const fd = new FormData();
        fd.append("file", f);
        fd.append("doc_type", key);
        uploads.push(api.post(`/applications/${appId}/documents`, fd));
      }
      for (const f of state.additionalFiles) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("doc_type", "additional");
        uploads.push(api.post(`/applications/${appId}/documents`, fd));
      }
      await Promise.all(uploads);

      queryClient.invalidateQueries({ queryKey: ["borrower-applications"] });
      setActiveTab("status");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = ["Pick agent", "Loan basics", "Personal", "Bank account", "Next of kin", "Documents", "Declaration", "Review"];

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Apply for a loan</div>
        <div className="sb-page-sub">Step {step + 1} of {stepTitles.length} — {stepTitles[step]}</div>
      </div>

      <Stepper step={step} titles={stepTitles} />

      {error && <div className="sb-alert sb-al-red" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="sb-card">
        {step === 0 && (
          <AgentStep agents={agents} agentId={state.agent_id} onPick={(id) => update({ agent_id: id })} />
        )}
        {step === 1 && (
          <BasicsStep state={state} update={update} baseline={baseline} />
        )}
        {step === 2 && (
          <PersonalStep state={state} update={update} />
        )}
        {step === 3 && (
          <BankStep state={state} update={update} />
        )}
        {step === 4 && (
          <NokStep state={state} update={update} />
        )}
        {step === 5 && (
          <DocumentsStep state={state} onFile={handleFile} onAdditional={handleAdditional} />
        )}
        {step === 6 && (
          <DeclarationStep state={state} update={update} />
        )}
        {step === 7 && (
          <ReviewStep state={state} agents={agents} baseline={baseline} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button className="sb-btn" onClick={back} disabled={step === 0 || submitting}>← Back</button>
          {step < stepTitles.length - 1 ? (
            <button className="sb-btn sb-btn-primary" onClick={next}>Next →</button>
          ) : (
            <button className="sb-btn sb-btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, titles }: { step: number; titles: string[] }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
      {titles.map((t, i) => (
        <div
          key={t}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: i <= step ? "var(--blue)" : "var(--border)",
            transition: "background .2s",
          }}
          title={t}
        />
      ))}
    </div>
  );
}

function AgentStep({ agents, agentId, onPick }: { agents: Agent[]; agentId: string; onPick: (id: string) => void }) {
  if (agents.length === 0) {
    return <div className="sb-alert sb-al-amber">No verified agents are available right now. Please contact support.</div>;
  }
  return (
    <>
      <div className="sb-card-title">Choose your agent</div>
      <div className="sb-card-sub">Your agent will quote your interest rate and shepherd your application through.</div>
      <div style={{ display: "grid", gap: 8 }}>
        {agents.map((a) => (
          <label
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              border: `1.5px solid ${agentId === a.id ? "var(--blue)" : "var(--border)"}`,
              background: agentId === a.id ? "var(--blue-lt)" : "var(--white)",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="agent"
              checked={agentId === a.id}
              onChange={() => onPick(a.id)}
              style={{ accentColor: "var(--blue)" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{a.full_name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.email}</div>
            </div>
          </label>
        ))}
      </div>
    </>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="sb-m-fg">
      <label className="sb-m-fl">{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function BasicsStep({ state, update, baseline }: { state: WizardState; update: (p: Partial<WizardState>) => void; baseline?: Baseline }) {
  return (
    <>
      <div className="sb-card-title">Loan basics</div>
      <div className="sb-card-sub">Pick a product, amount, duration, and tell us why you need the loan.</div>

      <Field label="Product">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {PRODUCTS.map((p) => (
            <div
              key={p.key}
              onClick={() => update({ product: p.key })}
              style={{
                padding: 12,
                border: `1.5px solid ${state.product === p.key ? p.color : "var(--border)"}`,
                background: state.product === p.key ? p.bg : "var(--white)",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--ink)" }}>{p.key}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.desc}</div>
              <div style={{ fontSize: 11, color: p.color, marginTop: 4 }}>{p.range}</div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Amount (₦)">
        <input
          className="sb-m-fi"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 500,000"
          value={state.amount ? Number(state.amount).toLocaleString() : ""}
          onChange={(e) => update({ amount: e.target.value.replace(/\D/g, "") })}
        />
      </Field>

      <Field label="Duration" hint={baseline ? `Indicative baseline rate: ${baseline.baseline_monthly_rate_pct}%/month (agent may quote higher).` : undefined}>
        <div style={{ display: "flex", gap: 8 }}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update({ duration_days: d })}
              className="sb-btn"
              style={{
                background: state.duration_days === d ? "var(--blue)" : "var(--white)",
                color: state.duration_days === d ? "#fff" : "var(--ink)",
              }}
            >
              {d} days
            </button>
          ))}
        </div>
      </Field>

      <Field label="Purpose">
        <textarea
          className="sb-m-fi"
          rows={3}
          placeholder="e.g. Canada work visa application"
          value={state.purpose}
          onChange={(e) => update({ purpose: e.target.value })}
          style={{ resize: "vertical", fontFamily: "inherit" }}
        />
      </Field>
    </>
  );
}

function PersonalStep({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
  return (
    <>
      <div className="sb-card-title">Personal details</div>
      <div className="sb-card-sub">We already have your NIN and BVN from KYC. These extra fields are required by the loan agreement.</div>
      <Field label="International passport number">
        <input className="sb-m-fi" value={state.int_passport_no} onChange={(e) => update({ int_passport_no: e.target.value.toUpperCase() })} placeholder="e.g. A12345678" />
      </Field>
      <Field label="Residential address">
        <textarea className="sb-m-fi" rows={2} value={state.borrower_address} onChange={(e) => update({ borrower_address: e.target.value })} placeholder="Street, city, state" style={{ resize: "vertical", fontFamily: "inherit" }} />
      </Field>
    </>
  );
}

function BankStep({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
  return (
    <>
      <div className="sb-card-title">Bank account for disbursement</div>
      <div className="sb-card-sub">This is where Suprefax will pay the loan if approved.</div>
      <Field label="Bank name">
        <input className="sb-m-fi" value={state.bank_name} onChange={(e) => update({ bank_name: e.target.value })} placeholder="e.g. UBA" />
      </Field>
      <Field label="Account number">
        <input className="sb-m-fi" inputMode="numeric" maxLength={10} value={state.bank_account_number} onChange={(e) => update({ bank_account_number: e.target.value.replace(/\D/g, "") })} placeholder="10-digit NUBAN" />
      </Field>
      <Field label="Account name">
        <input className="sb-m-fi" value={state.bank_account_name} onChange={(e) => update({ bank_account_name: e.target.value })} placeholder="As it appears on your bank record" />
      </Field>
    </>
  );
}

function NokStep({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
  return (
    <>
      <div className="sb-card-title">Next of Kin / Witness</div>
      <div className="sb-card-sub">A person who can vouch for you and act as a witness on the agreement.</div>
      <Field label="Full name">
        <input className="sb-m-fi" value={state.nok_name} onChange={(e) => update({ nok_name: e.target.value })} />
      </Field>
      <Field label="Phone">
        <input className="sb-m-fi" inputMode="numeric" maxLength={11} value={state.nok_phone} onChange={(e) => update({ nok_phone: e.target.value.replace(/\D/g, "") })} placeholder="08012345678" />
      </Field>
      <Field label="Address">
        <textarea className="sb-m-fi" rows={2} value={state.nok_address} onChange={(e) => update({ nok_address: e.target.value })} style={{ resize: "vertical", fontFamily: "inherit" }} />
      </Field>
      <Field label="Relationship">
        <input className="sb-m-fi" value={state.nok_relationship} onChange={(e) => update({ nok_relationship: e.target.value })} placeholder="e.g. Spouse, Sibling, Parent" />
      </Field>
    </>
  );
}

function DocumentsStep({ state, onFile, onAdditional }: { state: WizardState; onFile: (k: string) => (e: ChangeEvent<HTMLInputElement>) => void; onAdditional: (e: ChangeEvent<HTMLInputElement>) => void }) {
  const productSpecificLabel = state.product ? PRODUCT_SPECIFIC_LABEL[state.product] : "Product-specific document";
  return (
    <>
      <div className="sb-card-title">Required documents</div>
      <div className="sb-card-sub">All files up to 8MB. PDF, JPG or PNG.</div>
      {REQUIRED_DOCS.map((d) => (
        <DocSlot key={d.key} label={d.label} file={state.files[d.key]} onChange={onFile(d.key)} />
      ))}
      <DocSlot label={productSpecificLabel} file={state.files.product_specific} onChange={onFile("product_specific")} />
      <div className="sb-m-fg">
        <label className="sb-m-fl">Additional documents (optional)</label>
        <input type="file" multiple onChange={onAdditional} />
        {state.additionalFiles.length > 0 && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {state.additionalFiles.length} file{state.additionalFiles.length !== 1 ? "s" : ""} selected
          </div>
        )}
      </div>
    </>
  );
}

function DocSlot({ label, file, onChange }: { label: string; file: File | null; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="sb-m-fg" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      <label className="sb-m-fl">{label}</label>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onChange} />
      {file && <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)</div>}
    </div>
  );
}

function DeclarationStep({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
  const items: { key: keyof WizardState["declaration"]; text: string }[] = [
    { key: "infant", text: "I am not an infant." },
    { key: "sound", text: "I am not a person of unsound mind." },
    { key: "fraud", text: "I have not been convicted of any offence involving fraud or dishonesty within the last five years." },
    { key: "bankrupt", text: "I am not an undischarged bankrupt." },
  ];
  return (
    <>
      <div className="sb-card-title">Declaration</div>
      <div className="sb-card-sub">I solemnly and sincerely declare (in accordance with the Oaths Act, 1990) that:</div>
      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        {items.map((d) => (
          <label key={d.key} style={{ display: "flex", gap: 10, padding: 10, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={state.declaration[d.key]}
              onChange={(e) => update({ declaration: { ...state.declaration, [d.key]: e.target.checked } })}
              style={{ accentColor: "var(--blue)" }}
            />
            <span style={{ fontSize: 13, color: "var(--ink)" }}>{d.text}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function ReviewStep({ state, agents, baseline }: { state: WizardState; agents: Agent[]; baseline?: Baseline }) {
  const agent = agents.find((a) => a.id === state.agent_id);
  const principal = Number(state.amount || 0);
  const months = state.duration_days / 30;
  const indicativeRepayable = baseline ? principal * (1 + (baseline.baseline_monthly_rate_pct / 100) * months) : null;

  return (
    <>
      <div className="sb-card-title">Review & submit</div>
      <div className="sb-card-sub">Confirm everything below. Your agent will quote a final interest rate after submission.</div>
      <Row label="Agent" value={agent?.full_name || "—"} />
      <Row label="Product" value={state.product} />
      <Row label="Amount" value={fmtMoney(state.amount)} />
      <Row label="Duration" value={`${state.duration_days} days`} />
      {indicativeRepayable !== null && (
        <Row label="Indicative repayable (at baseline rate)" value={fmtMoney(Math.round(indicativeRepayable))} />
      )}
      <Row label="Purpose" value={state.purpose} />
      <Row label="Int'l passport" value={state.int_passport_no} />
      <Row label="Address" value={state.borrower_address} />
      <Row label="Bank" value={`${state.bank_name} • ${state.bank_account_number} • ${state.bank_account_name}`} />
      <Row label="NOK" value={`${state.nok_name} (${state.nok_relationship}) • ${state.nok_phone}`} />
      <Row label="Documents" value={`${Object.values(state.files).filter(Boolean).length}/4 required${state.additionalFiles.length ? ` + ${state.additionalFiles.length} additional` : ""}`} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="sb-sr">
      <span className="sb-sr-l">{label}</span>
      <span className="sb-sr-r" style={{ textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}
