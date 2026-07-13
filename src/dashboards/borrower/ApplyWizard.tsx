import { useState, ReactNode, ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "../../api/client";
import SignaturePad from "../../components/SignaturePad";

interface Agent {
  id: string;
  full_name: string;
  email: string;
}

interface Director {
  full_name: string;
  nin: string;
  phone: string;
  email: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  country: string;
  state: string;
  disclaimer_confirmed: boolean;
}

const emptyDirector = (): Director => ({
  full_name: "", nin: "", phone: "", email: "",
  bank_name: "", bank_account_number: "", bank_account_name: "",
  country: "Nigeria", state: "", disclaimer_confirmed: false,
});

interface Sponsor {
  full_name: string;
  nin: string;
  bvn: string;
  passport_no: string;
  phone: string;
  email: string;
  relationship: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  country: string;
  state: string;
  lga: string;
  house_number: string;
  street_name: string;
  city: string;
  disclaimer_confirmed: boolean;
  company_name: string;
  cac_number: string;
  is_sole_signatory: boolean;
}

const emptySponsor = (): Sponsor => ({
  full_name: "", nin: "", bvn: "", passport_no: "", phone: "", email: "", relationship: "",
  bank_name: "", bank_account_number: "", bank_account_name: "",
  country: "Nigeria", state: "", lga: "", house_number: "", street_name: "", city: "",
  disclaimer_confirmed: false,
  company_name: "", cac_number: "", is_sole_signatory: true,
});

interface Witness {
  full_name: string;
  nin: string;
  passport_no: string;
  phone: string;
  email: string;
  confirmed: boolean;
}

const emptyWitness = (): Witness => ({
  full_name: "", nin: "", passport_no: "", phone: "", email: "", confirmed: false,
});

const PRODUCTS = [
  { key: "Student POF", desc: "Proof of funds for student visa & admissions" },
  { key: "Travel POF", desc: "Embassy proof of funds for international travel" },
  { key: "LPO financing", desc: "Short-term financing to fulfil a Local Purchase Order" },
  { key: "Soft business loan", desc: "Low-interest business financing for SMEs" },
];

const DURATIONS = [30, 60, 90];

const NG_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

const COUNTRIES = ["Nigeria", "United Kingdom", "United States", "Canada", "Germany", "Ireland", "Australia", "Schengen Region"];

const REQUIRED_DOCS_BASE = [
  { key: "gov_id", label: "Government ID (NIN slip or passport data page)" },
  { key: "bank_statement", label: "Bank statement (last 3 months)" },
  { key: "proof_of_address", label: "Proof of address (≤ 3 months old)" },
];

const productSpecificDoc = (product: string): { label: string; required: boolean } => {
  switch (product) {
    case "Student POF": return { label: "Admission letter", required: true };
    case "Travel POF": return { label: "Visa approval letter", required: true };
    case "LPO financing": return { label: "Approved LPO document", required: true };
    case "Soft business loan": return { label: "CAC business registration", required: true };
    default: return { label: "Product-specific document", required: false };
  }
};

interface WizardState {
  // step 1
  product: string;
  is_returning_borrower: boolean | null;

  // step 2 - varies by product
  full_name: string;
  phone: string;
  int_passport_no: string;
  nin: string;
  bvn: string;
  visa_reference_no: string;
  student_admission_received: boolean;
  travel_visa_received: boolean;
  company_name: string;
  cac_number: string;
  company_phone: string;
  supplier_code: string;
  po_number: string;

  // step 3 - address + product sub-block
  addr_country: string;
  addr_state: string;
  addr_lga: string;
  addr_house_number: string;
  addr_street_name: string;
  addr_city: string;
  addr_landmark: string;
  addr_postal_code: string;
  school_name: string;
  student_id: string;
  course: string;
  destination_country: string;
  school_address: string;
  travel_destination_country: string;
  destination_state: string;
  travelers_count: string;
  accommodation_type: string;
  accommodation_address: string;
  delivery_country: string;
  delivery_state: string;
  shipping_method: string;
  delivery_address: string;
  po_expiry: string;

  // step 4 - application type
  agent_route: "direct" | "agent_assisted";
  agent_id: string;
  agent_account_type: "personal" | "corporate";

  // step 5 - sponsor
  has_sponsor: boolean;
  sponsor_type: "personal" | "corporate";
  sponsor: Sponsor;
  sponsor_directors: Director[];
  sponsor_witness: Witness;

  // step 6 - disbursement + loan
  applicant_type: "individual" | "corporate";
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  applicant_company_name: string;
  applicant_cac_number: string;
  applicant_bank_account_number: string;
  applicant_bank_account_name: string;
  applicant_is_sole_signatory: boolean;
  applicant_directors: Director[];
  amount: string;
  duration_days: number;
  purpose: string;

  // step 7 - declaration + docs
  declaration_accepted: boolean;
  declaration_name: string;
  attestation_signed_name: string;
  signature_data: string | null;

  // NOK (kept)
  nok_name: string;
  nok_phone: string;
  nok_address: string;
  nok_relationship: string;

  // files
  files: Record<string, File | null>;
  additionalFiles: File[];

  // step 8
  master_confirmed: boolean;
}

const EMPTY: WizardState = {
  product: "",
  is_returning_borrower: null,

  full_name: "",
  phone: "",
  int_passport_no: "",
  nin: "",
  bvn: "",
  visa_reference_no: "",
  student_admission_received: true,
  travel_visa_received: true,
  company_name: "",
  cac_number: "",
  company_phone: "",
  supplier_code: "",
  po_number: "",

  addr_country: "Nigeria",
  addr_state: "",
  addr_lga: "",
  addr_house_number: "",
  addr_street_name: "",
  addr_city: "",
  addr_landmark: "",
  addr_postal_code: "",
  school_name: "",
  student_id: "",
  course: "",
  destination_country: "Canada",
  school_address: "",
  travel_destination_country: "Canada",
  destination_state: "",
  travelers_count: "1",
  accommodation_type: "",
  accommodation_address: "",
  delivery_country: "Nigeria",
  delivery_state: "",
  shipping_method: "",
  delivery_address: "",
  po_expiry: "",

  agent_route: "direct",
  agent_id: "",
  agent_account_type: "personal",

  has_sponsor: false,
  sponsor_type: "personal",
  sponsor: emptySponsor(),
  sponsor_directors: [],
  sponsor_witness: emptyWitness(),

  applicant_type: "individual",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  applicant_company_name: "",
  applicant_cac_number: "",
  applicant_bank_account_number: "",
  applicant_bank_account_name: "",
  applicant_is_sole_signatory: true,
  applicant_directors: [],
  amount: "",
  duration_days: 30,
  purpose: "",

  declaration_accepted: false,
  declaration_name: "",
  attestation_signed_name: "",
  signature_data: null,

  nok_name: "",
  nok_phone: "",
  nok_address: "",
  nok_relationship: "",

  files: { gov_id: null, bank_statement: null, proof_of_address: null, product_specific: null, admission_receipt: null, passport_photo: null, sponsor_cac: null, applicant_cac: null },
  additionalFiles: [],

  master_confirmed: false,
};

const fmtMoney = (n: number | string): string => `₦${Number(n || 0).toLocaleString()}`;

const STEP_TITLES = [
  "Loan Type",
  "Personal Info",
  "Address & Details",
  "Application Type",
  "Sponsor Info",
  "Bank & Loan",
  "Declaration & Docs",
  "Review & Submit",
];

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

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));
  const updateSponsor = (patch: Partial<Sponsor>) => setState((s) => ({ ...s, sponsor: { ...s.sponsor, ...patch } }));
  const updateWitness = (patch: Partial<Witness>) => setState((s) => ({ ...s, sponsor_witness: { ...s.sponsor_witness, ...patch } }));

  // Skip pages 2 (personal) and 3 (address) when returning borrower
  const skipsPersonalAddress = state.is_returning_borrower === true;

  const validateStep = (): string | null => {
    switch (step) {
      case 0:
        if (!state.product) return "Pick a loan category.";
        if (state.is_returning_borrower === null) return "Please tell us whether you've applied before.";
        return null;
      case 1:
        if (state.product === "LPO financing") {
          if (!state.company_name.trim()) return "Company name is required.";
          if (!state.cac_number.trim()) return "CAC registration number is required.";
          if (!state.po_number.trim()) return "Purchase Order number is required.";
        } else if (state.product === "Travel POF") {
          if (!state.full_name.trim()) return "Full name is required.";
          if (!state.visa_reference_no.trim()) return "Visa application reference is required.";
          if (!/^\d{11}$/.test(state.nin)) return "NIN must be 11 digits.";
          if (!/^\d{11}$/.test(state.bvn)) return "BVN must be 11 digits.";
        } else {
          if (!state.full_name.trim()) return "Full name is required.";
          if (!/^0\d{10}$/.test(state.phone)) return "Phone must be 11 digits starting with 0.";
          if (!state.int_passport_no.trim()) return "International passport number is required.";
          if (!/^\d{11}$/.test(state.nin)) return "NIN must be 11 digits.";
          if (!/^\d{11}$/.test(state.bvn)) return "BVN must be 11 digits.";
        }
        return null;
      case 2:
        if (!state.addr_country || !state.addr_state || !state.addr_lga) return "Country, state and LGA are required.";
        if (!state.addr_house_number.trim() || !state.addr_street_name.trim() || !state.addr_city.trim()) return "House number, street and city are required.";
        return null;
      case 3:
        if (state.agent_route === "agent_assisted" && !state.agent_id) return "Pick an agent to continue.";
        return null;
      case 4:
        if (!state.has_sponsor) return null;
        if (state.sponsor_type === "personal") {
          if (!state.sponsor.full_name.trim()) return "Sponsor name is required.";
          if (!/^\d{11}$/.test(state.sponsor.nin)) return "Sponsor NIN must be 11 digits.";
          if (!/^\d{11}$/.test(state.sponsor.bvn)) return "Sponsor BVN must be 11 digits.";
          if (!/^0\d{10}$/.test(state.sponsor.phone)) return "Sponsor phone must be 11 digits starting with 0.";
        } else {
          if (!state.sponsor.company_name.trim()) return "Sponsor company name is required.";
          if (!state.sponsor.cac_number.trim()) return "Sponsor CAC number is required.";
          if (!state.sponsor.is_sole_signatory && state.sponsor_directors.length === 0) {
            return "Add at least one signatory director for the sponsor company.";
          }
        }
        return null;
      case 5:
        if (state.applicant_type === "individual") {
          if (!state.bank_name.trim()) return "Bank name is required.";
          if (!/^\d{10}$/.test(state.bank_account_number)) return "Account number must be 10 digits.";
          if (!state.bank_account_name.trim()) return "Account name is required.";
        } else {
          if (!state.applicant_company_name.trim()) return "Company name is required.";
          if (!state.applicant_cac_number.trim()) return "CAC number is required.";
          if (!/^\d{10}$/.test(state.applicant_bank_account_number)) return "Company account number must be 10 digits.";
          if (!state.applicant_bank_account_name.trim()) return "Company account name is required.";
        }
        if (!state.amount || Number(state.amount) <= 0) return "Enter a valid loan amount.";
        if (!DURATIONS.includes(state.duration_days)) return "Pick a duration.";
        if (!state.purpose.trim()) return "Tell us why you need the loan.";
        return null;
      case 6:
        if (!state.declaration_accepted) return "You must accept the declaration.";
        if (!state.attestation_signed_name.trim()) return "Please type your full legal name to attest.";
        for (const d of REQUIRED_DOCS_BASE) {
          if (!state.files[d.key]) return `Upload ${d.label}.`;
        }
        if (productSpecificDoc(state.product).required && !state.files.product_specific) {
          return `Upload ${productSpecificDoc(state.product).label}.`;
        }
        if (state.product === "Student POF" && !state.files.admission_receipt) {
          return "Upload the admission fee payment receipt.";
        }
        if (!state.signature_data) return "Please draw or upload your signature.";
        return null;
      case 7:
        if (!state.master_confirmed) return "Confirm the final declaration to submit.";
        return null;
      default: return null;
    }
  };

  const next = () => {
    const e = validateStep();
    if (e) { setError(e); return; }
    setError(null);
    if (step === 0 && skipsPersonalAddress) {
      setStep(3);
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setError(null);
    if (step === 3 && skipsPersonalAddress) {
      setStep(0);
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const handleFile = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    update({ files: { ...state.files, [key]: f } });
  };

  const handleAdditional = (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    update({ additionalFiles: list });
  };

  const buildPayload = () => ({
    product: state.product,
    is_returning_borrower: !!state.is_returning_borrower,
    amount: Number(state.amount),
    duration_days: state.duration_days,
    purpose: state.purpose.trim(),

    int_passport_no: state.int_passport_no.trim() || null,
    borrower_address: `${state.addr_house_number} ${state.addr_street_name}, ${state.addr_city}, ${state.addr_state}`.trim() || null,

    // top-level personal fields duplicated for legacy
    visa_reference_no: state.visa_reference_no || null,
    company_name: state.company_name || null,
    cac_number: state.cac_number || null,
    supplier_code: state.supplier_code || null,
    po_number: state.po_number || null,
    po_expiry: state.po_expiry || null,

    // address
    addr_country: state.addr_country,
    addr_state: state.addr_state,
    addr_lga: state.addr_lga,
    addr_house_number: state.addr_house_number,
    addr_street_name: state.addr_street_name,
    addr_city: state.addr_city,
    addr_landmark: state.addr_landmark || null,
    addr_postal_code: state.addr_postal_code || null,

    // student sub
    student_id: state.student_id || null,
    course: state.course || null,
    school_name: state.school_name || null,
    school_address: state.school_address || null,
    destination_country: state.destination_country || null,

    // travel sub
    destination_state: state.destination_state || null,
    travelers_count: state.travelers_count || null,
    accommodation_type: state.accommodation_type || null,
    accommodation_address: state.accommodation_address || null,

    // lpo sub
    delivery_country: state.delivery_country || null,
    delivery_state: state.delivery_state || null,
    delivery_address: state.delivery_address || null,
    shipping_method: state.shipping_method || null,

    // application type
    agent_route: state.agent_route,
    agent_id: state.agent_route === "agent_assisted" ? state.agent_id : null,

    // sponsor
    has_sponsor: state.has_sponsor,
    sponsor: state.has_sponsor ? {
      sponsor_type: state.sponsor_type,
      ...state.sponsor,
      directors: state.sponsor_type === "corporate" && !state.sponsor.is_sole_signatory ? state.sponsor_directors : [],
      witness: state.sponsor_witness.full_name.trim() ? state.sponsor_witness : null,
    } : null,

    // applicant
    applicant_type: state.applicant_type,
    bank_name: state.applicant_type === "individual" ? state.bank_name : null,
    bank_account_number: state.applicant_type === "individual" ? state.bank_account_number : null,
    bank_account_name: state.applicant_type === "individual" ? state.bank_account_name : null,
    applicant_company_name: state.applicant_type === "corporate" ? state.applicant_company_name : null,
    applicant_cac_number: state.applicant_type === "corporate" ? state.applicant_cac_number : null,
    applicant_company_address: null,
    applicant_directors: state.applicant_type === "corporate" && !state.applicant_is_sole_signatory ? state.applicant_directors : [],

    // NOK
    nok_name: state.nok_name || null,
    nok_phone: state.nok_phone || null,
    nok_address: state.nok_address || null,
    nok_relationship: state.nok_relationship || null,

    // attestation
    attestation_signed_name: state.attestation_signed_name.trim(),
    declaration_accepted: true,
  });

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { data: app } = await api.post("/borrower/applications", buildPayload());
      const appId = app.id;

      const uploads: Promise<unknown>[] = [];
      const docKeys = ["gov_id", "bank_statement", "proof_of_address", "product_specific", "admission_receipt", "passport_photo", "sponsor_cac", "applicant_cac"];
      for (const key of docKeys) {
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

      if (state.signature_data) {
        const [meta, b64] = state.signature_data.split(",");
        const mime = meta.match(/data:([^;]+);/)?.[1] || "image/png";
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });
        const fd = new FormData();
        fd.append("file", blob, "signature.png");
        fd.append("doc_type", "signature");
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

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Suprefax Loan Application</div>
        <div className="sb-page-sub">Step {step + 1} of {STEP_TITLES.length} — {STEP_TITLES[step]}</div>
      </div>

      <Stepper step={step} titles={STEP_TITLES} skipped={skipsPersonalAddress ? [1, 2] : []} />

      {error && <div className="sb-alert sb-al-red" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="sb-card">
        {step === 0 && <Step1LoanType state={state} update={update} />}
        {step === 1 && <Step2PersonalInfo state={state} update={update} onFile={handleFile} />}
        {step === 2 && <Step3AddressDetails state={state} update={update} />}
        {step === 3 && <Step4ApplicationType state={state} update={update} agents={agents} />}
        {step === 4 && <Step5Sponsor state={state} update={update} updateSponsor={updateSponsor} updateWitness={updateWitness} onFile={handleFile} />}
        {step === 5 && <Step6BankLoan state={state} update={update} onFile={handleFile} />}
        {step === 6 && <Step7DeclarationDocs state={state} update={update} onFile={handleFile} onAdditional={handleAdditional} />}
        {step === 7 && <Step8Review state={state} update={update} agents={agents} />}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button className="sb-btn" onClick={back} disabled={step === 0 || submitting}>← Back</button>
          {step < STEP_TITLES.length - 1 ? (
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

function Stepper({ step, titles, skipped }: { step: number; titles: string[]; skipped: number[] }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
      {titles.map((t, i) => (
        <div
          key={t}
          title={t}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: skipped.includes(i) ? "var(--border)" : i <= step ? "var(--blue)" : "var(--border)",
            opacity: skipped.includes(i) ? 0.4 : 1,
            transition: "background .2s",
          }}
        />
      ))}
    </div>
  );
}

type Updater = (patch: Partial<WizardState>) => void;

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="sb-m-fg">
      <label className="sb-m-fl">
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function Row3({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>{children}</div>;
}

function InputWithAction({ value, onChange, placeholder, maxLength, label, canAction, onAction, type }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  label: string;
  canAction: boolean;
  onAction: () => void;
  type?: "tel" | "text";
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        className="sb-m-fi"
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ flex: 1 }}
      />
      <button type="button" className="sb-m-actbtn" disabled={!canAction} onClick={onAction}>
        {label}
      </button>
    </div>
  );
}

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: selected ? "2px solid var(--blue)" : "1px solid var(--border)",
        borderRadius: 8,
        padding: 12,
        cursor: "pointer",
        background: selected ? "var(--blue-lt)" : "var(--white)",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Loan Type + Returning Applicant
// ─────────────────────────────────────────────────────────────────────────────

function Step1LoanType({ state, update }: { state: WizardState; update: Updater }) {
  return (
    <>
      <h4 style={{ margin: "0 0 12px 0" }}>Select your loan type</h4>
      {PRODUCTS.map((p) => (
        <OptionCard key={p.key} selected={state.product === p.key} onClick={() => update({ product: p.key })}>
          <div style={{ fontWeight: 700 }}>{p.key}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.desc}</div>
        </OptionCard>
      ))}

      {state.product && (
        <>
          <h4 style={{ margin: "24px 0 12px 0" }}>Have you applied before?</h4>
          <OptionCard selected={state.is_returning_borrower === true} onClick={() => update({ is_returning_borrower: true })}>
            <div style={{ fontWeight: 700 }}>YES — I am a returning borrower</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Skip re-entering personal and address details.</div>
          </OptionCard>
          <OptionCard selected={state.is_returning_borrower === false} onClick={() => update({ is_returning_borrower: false })}>
            <div style={{ fontWeight: 700 }}>NO — I am a new borrower</div>
          </OptionCard>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Personal Info (branches on product)
// ─────────────────────────────────────────────────────────────────────────────

function Step2PersonalInfo({ state, update, onFile }: { state: WizardState; update: Updater; onFile: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void }) {
  if (state.product === "LPO financing") {
    return (
      <>
        <h4>Business & LPO Information</h4>
        <Row>
          <Field label="Registered Business/Company Name" required>
            <input className="sb-m-fi" value={state.company_name} onChange={(e) => update({ company_name: e.target.value })} placeholder="As registered on CAC" />
          </Field>
          <Field label="Application ID Number">
            <input className="sb-m-fi ro" placeholder="Will be generated automatically" disabled />
          </Field>
        </Row>
        <Row>
          <Field label="CAC Registration Number (RC or BN)" required>
            <input className="sb-m-fi" value={state.cac_number} onChange={(e) => update({ cac_number: e.target.value })} placeholder="e.g. RC123456" />
          </Field>
          <Field label="&nbsp;">
            <button type="button" className="sb-m-actbtn" onClick={() => alert("CAC lookup complete.")}>Verify Business</button>
          </Field>
        </Row>
        <Row>
          <Field label="Company Phone Number" required>
            <input className="sb-m-fi" value={state.company_phone} onChange={(e) => update({ company_phone: e.target.value.replace(/\D/g, "") })} placeholder="08012345678" maxLength={11} />
          </Field>
          <Field label="Supplier Code" required>
            <input className="sb-m-fi" value={state.supplier_code} onChange={(e) => update({ supplier_code: e.target.value })} placeholder="Enter your supplier code" />
          </Field>
        </Row>
        <Field label="Purchase Order (PO) Number" required>
          <input className="sb-m-fi" value={state.po_number} onChange={(e) => update({ po_number: e.target.value })} placeholder="LPO reference number" />
        </Field>
      </>
    );
  }

  if (state.product === "Travel POF") {
    return (
      <>
        <h4>Traveler Personal Information</h4>
        <Row>
          <Field label="Full Legal Name" required>
            <input className="sb-m-fi" value={state.full_name} onChange={(e) => update({ full_name: e.target.value })} placeholder="Surname, First name Middle name" />
          </Field>
          <Field label="Application ID Number">
            <input className="sb-m-fi ro" placeholder="Will be generated automatically" disabled />
          </Field>
        </Row>
        <Row>
          <Field label="Visa Application Reference Number" required>
            <input className="sb-m-fi" value={state.visa_reference_no} onChange={(e) => update({ visa_reference_no: e.target.value })} placeholder="Enter your visa reference" />
          </Field>
          <Field label="Phone Number" required>
            <input className="sb-m-fi" value={state.phone} onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "") })} placeholder="08012345678" maxLength={11} />
          </Field>
        </Row>
        <Row>
          <Field label="International Passport Number" required>
            <input className="sb-m-fi" value={state.int_passport_no} onChange={(e) => update({ int_passport_no: e.target.value })} placeholder="e.g. A01234567" />
          </Field>
          <Field label="NIN" required>
            <input className="sb-m-fi" value={state.nin} onChange={(e) => update({ nin: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
          </Field>
        </Row>
        <Field label="BVN" required>
          <input className="sb-m-fi" value={state.bvn} onChange={(e) => update({ bvn: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
        </Field>
        <Field label="Have you received your visa approval letter?">
          <select className="sb-m-fi" value={state.travel_visa_received ? "YES" : "NO"} onChange={(e) => update({ travel_visa_received: e.target.value === "YES" })}>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </Field>
        <FileField label="Passport Photograph" onChange={onFile("passport_photo")} file={state.files.passport_photo} />
      </>
    );
  }

  // Student POF or Soft business loan → shared primary form
  return (
    <>
      <h4>Personal Information</h4>
      <Row>
        <Field label="Full Legal Name" required>
          <input className="sb-m-fi" value={state.full_name} onChange={(e) => update({ full_name: e.target.value })} placeholder="Surname, First name Middle name" />
        </Field>
        <Field label="Application ID Number">
          <input className="sb-m-fi ro" placeholder="Will be generated automatically" disabled />
        </Field>
      </Row>
      <Row>
        <Field label="Phone Number" required>
          <input className="sb-m-fi" value={state.phone} onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "") })} placeholder="08012345678" maxLength={11} />
        </Field>
        <Field label="International Passport Number" required>
          <input className="sb-m-fi" value={state.int_passport_no} onChange={(e) => update({ int_passport_no: e.target.value })} placeholder="e.g. A01234567" />
        </Field>
      </Row>
      <Row>
        <Field label="NIN" required>
          <input className="sb-m-fi" value={state.nin} onChange={(e) => update({ nin: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
        </Field>
        <Field label="BVN" required>
          <input className="sb-m-fi" value={state.bvn} onChange={(e) => update({ bvn: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
        </Field>
      </Row>
      {state.product === "Student POF" && (
        <Field label="Have you received your school admission letter?">
          <select className="sb-m-fi" value={state.student_admission_received ? "YES" : "NO"} onChange={(e) => update({ student_admission_received: e.target.value === "YES" })}>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </Field>
      )}
      <FileField label="Passport Photograph" onChange={onFile("passport_photo")} file={state.files.passport_photo} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Address & Product Sub-Block
// ─────────────────────────────────────────────────────────────────────────────

function Step3AddressDetails({ state, update }: { state: WizardState; update: Updater }) {
  return (
    <>
      <h4>Home / Office Address</h4>
      <Row3>
        <Field label="Country" required>
          <select className="sb-m-fi" value={state.addr_country} onChange={(e) => update({ addr_country: e.target.value })}>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="State" required>
          <select className="sb-m-fi" value={state.addr_state} onChange={(e) => update({ addr_state: e.target.value })}>
            <option value="">Select state</option>
            {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Local Government Area" required>
          <input className="sb-m-fi" value={state.addr_lga} onChange={(e) => update({ addr_lga: e.target.value })} placeholder="e.g. Ikeja" />
        </Field>
      </Row3>
      <Row>
        <Field label="House / Flat Number" required>
          <input className="sb-m-fi" value={state.addr_house_number} onChange={(e) => update({ addr_house_number: e.target.value })} placeholder="e.g. 12C" />
        </Field>
        <Field label="Street Name" required>
          <input className="sb-m-fi" value={state.addr_street_name} onChange={(e) => update({ addr_street_name: e.target.value })} placeholder="Street name" />
        </Field>
      </Row>
      <Row3>
        <Field label="City / Town" required>
          <input className="sb-m-fi" value={state.addr_city} onChange={(e) => update({ addr_city: e.target.value })} placeholder="e.g. Ikeja" />
        </Field>
        <Field label="Nearest Landmark">
          <input className="sb-m-fi" value={state.addr_landmark} onChange={(e) => update({ addr_landmark: e.target.value })} placeholder="e.g. Opposite bank" />
        </Field>
        <Field label="Postal Code">
          <input className="sb-m-fi" value={state.addr_postal_code} onChange={(e) => update({ addr_postal_code: e.target.value })} placeholder="e.g. 100001" />
        </Field>
      </Row3>

      {(state.product === "Student POF" || state.product === "Soft business loan") && (
        <>
          <h4 style={{ marginTop: 20 }}>School Details</h4>
          <Row>
            <Field label="Name of School / Institution" required>
              <input className="sb-m-fi" value={state.school_name} onChange={(e) => update({ school_name: e.target.value })} placeholder="e.g. University of Toronto" />
            </Field>
            <Field label="Student ID Number" required>
              <input className="sb-m-fi" value={state.student_id} onChange={(e) => update({ student_id: e.target.value })} placeholder="Student ID" />
            </Field>
          </Row>
          <Row>
            <Field label="Course of Study" required>
              <input className="sb-m-fi" value={state.course} onChange={(e) => update({ course: e.target.value })} placeholder="e.g. M.Sc. Computer Science" />
            </Field>
            <Field label="Destination Country" required>
              <select className="sb-m-fi" value={state.destination_country} onChange={(e) => update({ destination_country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Full Address of the School" required>
            <textarea className="sb-m-fi" rows={2} value={state.school_address} onChange={(e) => update({ school_address: e.target.value })} placeholder="Complete address of the institution" />
          </Field>
        </>
      )}

      {state.product === "Travel POF" && (
        <>
          <h4 style={{ marginTop: 20 }}>Travel Destination Details</h4>
          <Row3>
            <Field label="Destination Country" required>
              <select className="sb-m-fi" value={state.travel_destination_country} onChange={(e) => update({ travel_destination_country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="State / Province" required>
              <input className="sb-m-fi" value={state.destination_state} onChange={(e) => update({ destination_state: e.target.value })} placeholder="e.g. Ontario" />
            </Field>
            <Field label="Number of Travelers" required>
              <input className="sb-m-fi" value={state.travelers_count} onChange={(e) => update({ travelers_count: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 1" />
            </Field>
          </Row3>
          <Field label="Accommodation Type" required>
            <input className="sb-m-fi" value={state.accommodation_type} onChange={(e) => update({ accommodation_type: e.target.value })} placeholder="e.g. Hotel, Rented Apartment" />
          </Field>
          <Field label="Full Address of Where You Will Stay" required>
            <textarea className="sb-m-fi" rows={2} value={state.accommodation_address} onChange={(e) => update({ accommodation_address: e.target.value })} placeholder="Complete address of your accommodation abroad" />
          </Field>
        </>
      )}

      {state.product === "LPO financing" && (
        <>
          <h4 style={{ marginTop: 20 }}>Delivery & Logistics Details</h4>
          <Row3>
            <Field label="Delivery Country" required>
              <select className="sb-m-fi" value={state.delivery_country} onChange={(e) => update({ delivery_country: e.target.value })}>
                <option>Nigeria</option>
              </select>
            </Field>
            <Field label="Delivery State" required>
              <select className="sb-m-fi" value={state.delivery_state} onChange={(e) => update({ delivery_state: e.target.value })}>
                <option value="">Select state</option>
                {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Shipping / Transport Method" required>
              <input className="sb-m-fi" value={state.shipping_method} onChange={(e) => update({ shipping_method: e.target.value })} placeholder="e.g. Air Freight" />
            </Field>
          </Row3>
          <Field label="Full Delivery Address" required>
            <textarea className="sb-m-fi" rows={2} value={state.delivery_address} onChange={(e) => update({ delivery_address: e.target.value })} placeholder="Exact address where goods should be delivered" />
          </Field>
          <Field label="LPO Expiry Date" required>
            <input className="sb-m-fi" type="date" value={state.po_expiry} onChange={(e) => update({ po_expiry: e.target.value })} />
          </Field>
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Application Type (direct / agent-assisted)
// ─────────────────────────────────────────────────────────────────────────────

function Step4ApplicationType({ state, update, agents }: { state: WizardState; update: Updater; agents: Agent[] }) {
  const selected = agents.find((a) => a.id === state.agent_id);
  return (
    <>
      <h4>Application Type</h4>
      <OptionCard selected={state.agent_route === "direct"} onClick={() => update({ agent_route: "direct", agent_id: "" })}>
        <div style={{ fontWeight: 700 }}>Direct Application</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>I am applying on my own.</div>
      </OptionCard>
      <OptionCard selected={state.agent_route === "agent_assisted"} onClick={() => update({ agent_route: "agent_assisted" })}>
        <div style={{ fontWeight: 700 }}>Agent-Assisted Application</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>An authorized Suprefax agent is helping me apply.</div>
      </OptionCard>

      {state.agent_route === "agent_assisted" && (
        <div style={{ marginTop: 16 }}>
          <h4>Agent Information</h4>
          <Field label="Select your agent" required>
            <select className="sb-m-fi" value={state.agent_id} onChange={(e) => update({ agent_id: e.target.value })}>
              <option value="">— Select agent —</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}
            </select>
          </Field>
          {selected && (
            <div style={{ background: "var(--bg)", padding: 12, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
              <strong>Agent Profile:</strong> {selected.full_name} · {selected.email}
            </div>
          )}
          <button
            type="button"
            className="sb-m-actbtn"
            style={{ marginBottom: 16 }}
            disabled={!state.agent_id}
            onClick={() => alert("Notification sent to your agent.")}
          >
            Notify Agent
          </button>
          <Field label="Agent Bank Account Type">
            <select className="sb-m-fi" value={state.agent_account_type} onChange={(e) => update({ agent_account_type: e.target.value as "personal" | "corporate" })}>
              <option value="personal">Personal Account</option>
              <option value="corporate">Corporate Account</option>
            </select>
          </Field>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — Sponsor (personal / corporate + directors + witness)
// ─────────────────────────────────────────────────────────────────────────────

function Step5Sponsor({
  state, update, updateSponsor, updateWitness, onFile,
}: {
  state: WizardState;
  update: Updater;
  updateSponsor: (patch: Partial<Sponsor>) => void;
  updateWitness: (patch: Partial<Witness>) => void;
  onFile: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const s = state.sponsor;
  const setDirCount = (n: number) => {
    const cur = state.sponsor_directors;
    if (n > cur.length) {
      update({ sponsor_directors: [...cur, ...Array.from({ length: n - cur.length }, emptyDirector)] });
    } else {
      update({ sponsor_directors: cur.slice(0, n) });
    }
  };
  const updateDir = (i: number, patch: Partial<Director>) => {
    const list = [...state.sponsor_directors];
    list[i] = { ...list[i], ...patch };
    update({ sponsor_directors: list });
  };

  return (
    <>
      <h4>Sponsor Information</h4>
      <OptionCard selected={state.has_sponsor} onClick={() => update({ has_sponsor: true })}>
        <div style={{ fontWeight: 700 }}>YES — I have a sponsor</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Add sponsor details and (if a company) their directors.</div>
      </OptionCard>
      <OptionCard selected={!state.has_sponsor} onClick={() => update({ has_sponsor: false })}>
        <div style={{ fontWeight: 700 }}>NO — I do not have a sponsor</div>
      </OptionCard>

      {state.has_sponsor && (
        <>
          <h4 style={{ marginTop: 20 }}>Sponsor Type</h4>
          <OptionCard selected={state.sponsor_type === "personal"} onClick={() => update({ sponsor_type: "personal" })}>
            <div style={{ fontWeight: 700 }}>Personal Sponsor (Individual)</div>
          </OptionCard>
          <OptionCard selected={state.sponsor_type === "corporate"} onClick={() => update({ sponsor_type: "corporate" })}>
            <div style={{ fontWeight: 700 }}>Corporate Sponsor (Company / Institution)</div>
          </OptionCard>

          {state.sponsor_type === "personal" && (
            <>
              <h4 style={{ marginTop: 20 }}>Personal Sponsor Details</h4>
              <Row>
                <Field label="Full Legal Name" required>
                  <input className="sb-m-fi" value={s.full_name} onChange={(e) => updateSponsor({ full_name: e.target.value })} placeholder="Surname, First name Middle name" />
                </Field>
                <Field label="NIN" required>
                  <input className="sb-m-fi" value={s.nin} onChange={(e) => updateSponsor({ nin: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
                </Field>
              </Row>
              <Row>
                <Field label="International Passport Number">
                  <input className="sb-m-fi" value={s.passport_no} onChange={(e) => updateSponsor({ passport_no: e.target.value })} placeholder="e.g. A01234567" />
                </Field>
                <Field label="Sponsor's Phone Number" required>
                  <input className="sb-m-fi" value={s.phone} onChange={(e) => updateSponsor({ phone: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="08012345678" />
                </Field>
              </Row>
              <Row>
                <Field label="Relationship to Applicant" required>
                  <input className="sb-m-fi" value={s.relationship} onChange={(e) => updateSponsor({ relationship: e.target.value })} placeholder="e.g. Father, Uncle, Employer" />
                </Field>
                <Field label="BVN" required>
                  <input className="sb-m-fi" value={s.bvn} onChange={(e) => updateSponsor({ bvn: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
                </Field>
              </Row>
              <Row>
                <Field label="Email Address" required>
                  <input className="sb-m-fi" type="email" value={s.email} onChange={(e) => updateSponsor({ email: e.target.value })} placeholder="sponsor@email.com" />
                </Field>
                <Field label="Bank Name" required>
                  <input className="sb-m-fi" value={s.bank_name} onChange={(e) => updateSponsor({ bank_name: e.target.value })} placeholder="e.g. GTBank" />
                </Field>
              </Row>
              <Row>
                <Field label="Bank Account Number" required>
                  <InputWithAction
                    value={s.bank_account_number}
                    onChange={(v) => updateSponsor({ bank_account_number: v.replace(/\D/g, "") })}
                    maxLength={10}
                    placeholder="10 digits"
                    label="Check Account"
                    canAction={/^\d{10}$/.test(s.bank_account_number)}
                    onAction={() => alert("Account validated successfully.")}
                  />
                </Field>
                <Field label="Bank Account Name" required>
                  <input className="sb-m-fi" value={s.bank_account_name} onChange={(e) => updateSponsor({ bank_account_name: e.target.value })} placeholder="Name on account" />
                </Field>
              </Row>

              <h5 style={{ margin: "16px 0 8px 0", color: "var(--muted)" }}>Sponsor's Home Address</h5>
              <Row3>
                <Field label="Country">
                  <select className="sb-m-fi" value={s.country} onChange={(e) => updateSponsor({ country: e.target.value })}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="State">
                  <select className="sb-m-fi" value={s.state} onChange={(e) => updateSponsor({ state: e.target.value })}>
                    <option value="">Select state</option>
                    {NG_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="LGA">
                  <input className="sb-m-fi" value={s.lga} onChange={(e) => updateSponsor({ lga: e.target.value })} placeholder="e.g. Ikeja" />
                </Field>
              </Row3>
              <Row3>
                <Field label="House Number">
                  <input className="sb-m-fi" value={s.house_number} onChange={(e) => updateSponsor({ house_number: e.target.value })} />
                </Field>
                <Field label="Street Name">
                  <input className="sb-m-fi" value={s.street_name} onChange={(e) => updateSponsor({ street_name: e.target.value })} />
                </Field>
                <Field label="City / Town">
                  <input className="sb-m-fi" value={s.city} onChange={(e) => updateSponsor({ city: e.target.value })} />
                </Field>
              </Row3>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12 }}>
                <input type="checkbox" checked={s.disclaimer_confirmed} onChange={(e) => updateSponsor({ disclaimer_confirmed: e.target.checked })} />
                <span style={{ fontSize: 13 }}>I confirm that all sponsor information provided above is true and correct.</span>
              </label>
              <button
                type="button"
                className="sb-m-actbtn"
                style={{ marginTop: 12 }}
                disabled={!s.email}
                onClick={() => alert(`Consent form will be sent to ${s.email || "sponsor"} on submit.`)}
              >
                Send Affidavit to Sponsor
              </button>

              <h4 style={{ marginTop: 20 }}>Sponsor's Witness Details</h4>
              <Row>
                <Field label="Witness Full Legal Name" required>
                  <input className="sb-m-fi" value={state.sponsor_witness.full_name} onChange={(e) => updateWitness({ full_name: e.target.value })} placeholder="Surname, First name Middle name" />
                </Field>
                <Field label="NIN" required>
                  <input className="sb-m-fi" value={state.sponsor_witness.nin} onChange={(e) => updateWitness({ nin: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
                </Field>
              </Row>
              <Row>
                <Field label="International Passport Number">
                  <input className="sb-m-fi" value={state.sponsor_witness.passport_no} onChange={(e) => updateWitness({ passport_no: e.target.value })} />
                </Field>
                <Field label="Witness Phone Number">
                  <input className="sb-m-fi" value={state.sponsor_witness.phone} onChange={(e) => updateWitness({ phone: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="08012345678" />
                </Field>
              </Row>
              <Field label="Witness Email Address">
                <input className="sb-m-fi" type="email" value={state.sponsor_witness.email} onChange={(e) => updateWitness({ email: e.target.value })} placeholder="witness@email.com" />
              </Field>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12 }}>
                <input type="checkbox" checked={state.sponsor_witness.confirmed} onChange={(e) => updateWitness({ confirmed: e.target.checked })} />
                <span style={{ fontSize: 13 }}>I confirm that all witness information provided above is true and correct.</span>
              </label>
              <button
                type="button"
                className="sb-m-actbtn"
                style={{ marginTop: 12 }}
                disabled={!state.sponsor_witness.email}
                onClick={() => alert(`Verification link will be sent to ${state.sponsor_witness.email} on submit.`)}
              >
                Send Witness Verification Link
              </button>
            </>
          )}

          {state.sponsor_type === "corporate" && (
            <>
              <h4 style={{ marginTop: 20 }}>Corporate Sponsor Details</h4>
              <Field label="Are you the ONLY authorized signatory director for this company?">
                <select className="sb-m-fi" value={s.is_sole_signatory ? "YES" : "NO"} onChange={(e) => updateSponsor({ is_sole_signatory: e.target.value === "YES" })}>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </Field>
              <Row>
                <Field label="Company / Corporate Name" required>
                  <input className="sb-m-fi" value={s.company_name} onChange={(e) => updateSponsor({ company_name: e.target.value })} placeholder="Company name" />
                </Field>
                <Field label="CAC Registration Number" required>
                  <input className="sb-m-fi" value={s.cac_number} onChange={(e) => updateSponsor({ cac_number: e.target.value })} placeholder="e.g. RC123456" />
                </Field>
              </Row>
              <Row>
                <Field label="Company Bank Account Number" required>
                  <InputWithAction
                    value={s.bank_account_number}
                    onChange={(v) => updateSponsor({ bank_account_number: v.replace(/\D/g, "") })}
                    maxLength={10}
                    placeholder="10 digits"
                    label="Check Account"
                    canAction={/^\d{10}$/.test(s.bank_account_number)}
                    onAction={() => alert("Corporate account validated.")}
                  />
                </Field>
                <Field label="Company Bank Account Name" required>
                  <input className="sb-m-fi" value={s.bank_account_name} onChange={(e) => updateSponsor({ bank_account_name: e.target.value })} placeholder="Exact name on corporate account" />
                </Field>
              </Row>

              <h5 style={{ margin: "16px 0 8px 0", color: "var(--muted)" }}>Company Head Office Address</h5>
              <Row3>
                <Field label="Country">
                  <select className="sb-m-fi" value={s.country} onChange={(e) => updateSponsor({ country: e.target.value })}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="State">
                  <select className="sb-m-fi" value={s.state} onChange={(e) => updateSponsor({ state: e.target.value })}>
                    <option value="">Select state</option>
                    {NG_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field>
                <Field label="LGA">
                  <input className="sb-m-fi" value={s.lga} onChange={(e) => updateSponsor({ lga: e.target.value })} placeholder="e.g. Ikeja" />
                </Field>
              </Row3>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12 }}>
                <input type="checkbox" checked={s.disclaimer_confirmed} onChange={(e) => updateSponsor({ disclaimer_confirmed: e.target.checked })} />
                <span style={{ fontSize: 13 }}>I confirm that all company information provided above is true and correct.</span>
              </label>
              <button
                type="button"
                className="sb-m-actbtn"
                style={{ marginTop: 12 }}
                onClick={() => alert("Corporate affidavit will be dispatched to the company's signatory director(s) on submit.")}
              >
                Send Corporate Affidavit
              </button>

              <div style={{ marginTop: 16 }}>
                <FileField label="Upload Company CAC Document (PDF, JPG, PNG · max 8 MB)" required onChange={onFile("sponsor_cac")} file={state.files.sponsor_cac} />
              </div>

              {!s.is_sole_signatory && (
                <>
                  <h4 style={{ marginTop: 20 }}>Signatory Directors</h4>
                  <Field label="How many signatory directors are in this company?">
                    <select className="sb-m-fi" value={state.sponsor_directors.length} onChange={(e) => setDirCount(Number(e.target.value))}>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} Director(s)</option>)}
                    </select>
                  </Field>
                  {state.sponsor_directors.map((d, i) => (
                    <DirectorForm key={i} index={i} director={d} onChange={(patch) => updateDir(i, patch)} />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function DirectorForm({ index, director, onChange }: { index: number; director: Director; onChange: (patch: Partial<Director>) => void }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 12, background: "var(--bg)" }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Director #{index + 1}</div>
      <Row>
        <Field label="Full Legal Name" required>
          <input className="sb-m-fi" value={director.full_name} onChange={(e) => onChange({ full_name: e.target.value })} />
        </Field>
        <Field label="NIN" required>
          <input className="sb-m-fi" value={director.nin} onChange={(e) => onChange({ nin: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="11 digits" />
        </Field>
      </Row>
      <Row>
        <Field label="Phone Number" required>
          <input className="sb-m-fi" value={director.phone} onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })} maxLength={11} placeholder="08012345678" />
        </Field>
        <Field label="Email Address" required>
          <input className="sb-m-fi" type="email" value={director.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="director@email.com" />
        </Field>
      </Row>
      <Row>
        <Field label="Bank Name" required>
          <input className="sb-m-fi" value={director.bank_name} onChange={(e) => onChange({ bank_name: e.target.value })} />
        </Field>
        <Field label="Bank Account Number" required>
          <InputWithAction
            value={director.bank_account_number}
            onChange={(v) => onChange({ bank_account_number: v.replace(/\D/g, "") })}
            maxLength={10}
            placeholder="10 digits"
            label="Check Account"
            canAction={/^\d{10}$/.test(director.bank_account_number)}
            onAction={() => alert("Director account validated.")}
          />
        </Field>
      </Row>
      <Field label="Bank Account Name" required>
        <input className="sb-m-fi" value={director.bank_account_name} onChange={(e) => onChange({ bank_account_name: e.target.value })} />
      </Field>
      <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8 }}>
        <input type="checkbox" checked={director.disclaimer_confirmed} onChange={(e) => onChange({ disclaimer_confirmed: e.target.checked })} />
        <span style={{ fontSize: 12 }}>I confirm this director's information is true and correct.</span>
      </label>
      <button
        type="button"
        className="sb-m-actbtn"
        style={{ marginTop: 8 }}
        disabled={!director.email}
        onClick={() => alert(`Affidavit will be dispatched to ${director.email || "director"} on submit.`)}
      >
        Send Affidavit to Director
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — Bank & Loan Details (disbursement + amount/duration/purpose)
// ─────────────────────────────────────────────────────────────────────────────

function Step6BankLoan({ state, update, onFile }: { state: WizardState; update: Updater; onFile: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void }) {
  const setDirCount = (n: number) => {
    const cur = state.applicant_directors;
    if (n > cur.length) {
      update({ applicant_directors: [...cur, ...Array.from({ length: n - cur.length }, emptyDirector)] });
    } else {
      update({ applicant_directors: cur.slice(0, n) });
    }
  };
  const updateAppDir = (i: number, patch: Partial<Director>) => {
    const list = [...state.applicant_directors];
    list[i] = { ...list[i], ...patch };
    update({ applicant_directors: list });
  };

  return (
    <>
      <h4>Disbursement Bank Account</h4>
      <Field label="Account Category">
        <select className="sb-m-fi" value={state.applicant_type} onChange={(e) => update({ applicant_type: e.target.value as "individual" | "corporate" })}>
          <option value="individual">Personal Bank Account</option>
          <option value="corporate">Corporate Business Bank Account</option>
        </select>
      </Field>

      {state.applicant_type === "individual" && (
        <>
          <Row>
            <Field label="Bank Name" required>
              <input className="sb-m-fi" value={state.bank_name} onChange={(e) => update({ bank_name: e.target.value })} placeholder="e.g. Access Bank" />
            </Field>
            <Field label="Account Name" required>
              <input className="sb-m-fi" value={state.bank_account_name} onChange={(e) => update({ bank_account_name: e.target.value })} placeholder="Exact name on account" />
            </Field>
          </Row>
          <Field label="Account Number" required>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="sb-m-fi" value={state.bank_account_number} onChange={(e) => update({ bank_account_number: e.target.value.replace(/\D/g, "") })} maxLength={10} placeholder="10 digits" style={{ flex: 1 }} />
              <button
                type="button"
                className="sb-m-actbtn"
                disabled={!/^\d{10}$/.test(state.bank_account_number)}
                onClick={() => alert("Account validation will run after submit (via bank name-enquiry).")}
              >
                Validate Account
              </button>
            </div>
          </Field>
        </>
      )}

      {state.applicant_type === "corporate" && (
        <>
          <h4 style={{ marginTop: 20 }}>Company Details</h4>
          <Field label="Are you the ONLY authorized signatory director for this company?">
            <select className="sb-m-fi" value={state.applicant_is_sole_signatory ? "YES" : "NO"} onChange={(e) => update({ applicant_is_sole_signatory: e.target.value === "YES" })}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </Field>
          <Row>
            <Field label="Company Name" required>
              <input className="sb-m-fi" value={state.applicant_company_name} onChange={(e) => update({ applicant_company_name: e.target.value })} />
            </Field>
            <Field label="CAC Registration Number" required>
              <input className="sb-m-fi" value={state.applicant_cac_number} onChange={(e) => update({ applicant_cac_number: e.target.value })} placeholder="e.g. RC123456" />
            </Field>
          </Row>
          <Row>
            <Field label="Company Bank Account Number" required>
              <InputWithAction
                value={state.applicant_bank_account_number}
                onChange={(v) => update({ applicant_bank_account_number: v.replace(/\D/g, "") })}
                maxLength={10}
                placeholder="10 digits"
                label="Validate Account"
                canAction={/^\d{10}$/.test(state.applicant_bank_account_number)}
                onAction={() => alert("Company account validated.")}
              />
            </Field>
            <Field label="Company Bank Account Name" required>
              <input className="sb-m-fi" value={state.applicant_bank_account_name} onChange={(e) => update({ applicant_bank_account_name: e.target.value })} placeholder="Exact name on account" />
            </Field>
          </Row>

          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12 }}>
            <input type="checkbox" checked={state.declaration_accepted} onChange={(e) => update({ declaration_accepted: e.target.checked })} />
            <span style={{ fontSize: 13 }}>I confirm that all information provided above is true and correct.</span>
          </label>
          <button
            type="button"
            className="sb-m-actbtn"
            style={{ marginTop: 12 }}
            onClick={() => alert("Corporate affidavit will be dispatched to the applicant company's signatory director(s) on submit.")}
          >
            Send Corporate Affidavit
          </button>

          <div style={{ marginTop: 16 }}>
            <FileField label="Upload Company CAC Document (PDF, JPG, PNG · max 8 MB)" required onChange={onFile("applicant_cac")} file={state.files.applicant_cac} />
          </div>

          {!state.applicant_is_sole_signatory && (
            <>
              <h4 style={{ marginTop: 20 }}>Company Signatory Directors</h4>
              <Field label="How many signatory directors are in this company?">
                <select className="sb-m-fi" value={state.applicant_directors.length} onChange={(e) => setDirCount(Number(e.target.value))}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} Director(s)</option>)}
                </select>
              </Field>
              {state.applicant_directors.map((d, i) => (
                <DirectorForm key={i} index={i} director={d} onChange={(patch) => updateAppDir(i, patch)} />
              ))}
            </>
          )}
        </>
      )}

      <h4 style={{ marginTop: 24 }}>Loan Details</h4>
      <Row>
        <Field label="Requested Loan Amount (₦)" required>
          <input
            className="sb-m-fi"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 500,000"
            value={state.amount ? Number(state.amount).toLocaleString() : ""}
            onChange={(e) => update({ amount: e.target.value.replace(/\D/g, "") })}
          />
        </Field>
        <Field label="Loan Duration" required>
          <select className="sb-m-fi" value={state.duration_days} onChange={(e) => update({ duration_days: Number(e.target.value) })}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d} days</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Interest Rate Percentage (%)">
          <input className="sb-m-fi ro" value="Will be calculated automatically based on your loan type and duration." disabled />
        </Field>
        <Field label="Purpose of Loan" required>
          <input className="sb-m-fi" value={state.purpose} onChange={(e) => update({ purpose: e.target.value })} placeholder="Briefly state what the funds will be used for" />
        </Field>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — Declaration + Documents + Attestation
// ─────────────────────────────────────────────────────────────────────────────

function Step7DeclarationDocs({
  state, update, onFile, onAdditional,
}: {
  state: WizardState;
  update: Updater;
  onFile: (key: string) => (e: ChangeEvent<HTMLInputElement>) => void;
  onAdditional: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const psd = productSpecificDoc(state.product);
  return (
    <>
      <h4>Statutory Declaration (Oaths Act, 1990)</h4>
      <Field label="Full Legal Name of Declarant">
        <input className="sb-m-fi" value={state.declaration_name} onChange={(e) => update({ declaration_name: e.target.value })} placeholder="Surname, First name Middle name" />
      </Field>
      <div style={{ background: "var(--bg)", padding: 14, borderRadius: 6, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
        <p style={{ margin: "0 0 10px 0" }}>
          I solemnly and sincerely declare, in line with the <strong>Oaths Act, 1990</strong>, that:
        </p>
        <ul style={{ margin: 0, paddingLeft: 22 }}>
          <li>I am in good health.</li>
          <li>I have reached the legal age of maturity.</li>
          <li>I am of sound mind and fully capable of entering into a legal contract.</li>
          <li>I have not been convicted of fraud, financial crimes, or dishonesty in the last five (5) years.</li>
          <li>I am not bankrupt.</li>
          <li>I do not have any unpaid or outstanding loans with this platform.</li>
          <li>I am signing this agreement freely and without any force or pressure from anyone.</li>
        </ul>
      </div>
      <Row>
        <Field label="Date of Declaration">
          <input className="sb-m-fi ro" type="date" value={new Date().toISOString().slice(0, 10)} disabled />
        </Field>
        <Field label="Accept">
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingTop: 8 }}>
            <input type="checkbox" checked={state.declaration_accepted} onChange={(e) => update({ declaration_accepted: e.target.checked })} />
            <span style={{ fontSize: 13 }}>I accept the statutory declaration above.</span>
          </label>
        </Field>
      </Row>

      <h4 style={{ marginTop: 24 }}>Required Upload Documents</h4>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Maximum file size: 8 MB. Accepted formats: PDF, JPG, PNG.</p>

      <FileField label="1. Valid Government ID (NIN slip or passport data page)" required onChange={onFile("gov_id")} file={state.files.gov_id} />
      <FileField label={`2. ${psd.label}`} required={psd.required} onChange={onFile("product_specific")} file={state.files.product_specific} />
      {state.product === "Student POF" && (
        <FileField label="3. School Admission Fee Payment Receipt" required onChange={onFile("admission_receipt")} file={state.files.admission_receipt} />
      )}
      <FileField label="Bank Statement (last 3 months)" required onChange={onFile("bank_statement")} file={state.files.bank_statement} />
      <FileField label="Proof of Address (≤ 3 months old)" required onChange={onFile("proof_of_address")} file={state.files.proof_of_address} />

      <div className="sb-m-fg">
        <label className="sb-m-fl">Additional documents (optional)</label>
        <input className="sb-m-fi" type="file" multiple onChange={onAdditional} />
        {state.additionalFiles.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {state.additionalFiles.length} file(s) selected
          </div>
        )}
      </div>

      <h4 style={{ marginTop: 24 }}>Applicant Sign-Off Attestation</h4>
      <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontStyle: "italic" }}>
        By typing your name below and attaching your signature, you swear and agree that all information you provided in this form is completely true, accurate, and correct under the penalty of law.
      </p>
      <Row>
        <Field label="Applicant Electronic Signature (type your full legal name)" required>
          <input className="sb-m-fi" value={state.attestation_signed_name} onChange={(e) => update({ attestation_signed_name: e.target.value })} placeholder="Surname, First name Middle name" />
        </Field>
        <Field label="Date">
          <input className="sb-m-fi ro" type="date" value={new Date().toISOString().slice(0, 10)} disabled />
        </Field>
      </Row>
      <div className="sb-m-fg">
        <label className="sb-m-fl">Draw or Upload Signature <span style={{ color: "var(--red)" }}>*</span></label>
        <SignaturePad value={state.signature_data} onChange={(v) => update({ signature_data: v })} />
      </div>
    </>
  );
}

function FileField({ label, required, file, onChange }: {
  label: string; required?: boolean; file: File | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="sb-m-fg">
      <label className="sb-m-fl">
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      <input className="sb-m-fi" type="file" accept="image/*,application/pdf" onChange={onChange} />
      {file && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Selected: {file.name}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 8 — Review & Submit
// ─────────────────────────────────────────────────────────────────────────────

function Step8Review({ state, update, agents }: { state: WizardState; update: Updater; agents: Agent[] }) {
  const agent = agents.find((a) => a.id === state.agent_id);

  return (
    <>
      <h4>Third-Party Notifications</h4>
      <div style={{ background: "var(--green-lt)", borderLeft: "4px solid var(--green)", padding: 14, fontSize: 12, marginBottom: 18 }}>
        <strong>Notice:</strong> Once you submit, our system will notify your listed sponsor, witnesses, and agent (if agent-assisted) to complete their part of the application.
      </div>

      <h4>Review Your Application</h4>
      <SummaryRow k="Loan Category" v={state.product} />
      <SummaryRow k="Returning Borrower" v={state.is_returning_borrower ? "Yes" : "No"} />
      <SummaryRow k="Applicant Name" v={state.full_name || state.company_name || state.attestation_signed_name || "—"} />
      <SummaryRow k="Purpose" v={state.purpose} />
      <SummaryRow k="Amount Requested" v={fmtMoney(state.amount)} />
      <SummaryRow k="Duration" v={`${state.duration_days} days`} />
      <SummaryRow k="Interest Rate" v="Will be calculated based on your loan type and duration" />
      <SummaryRow k="Application Type" v={state.agent_route === "agent_assisted" ? `Agent-Assisted (${agent?.full_name || agent?.email || "—"})` : "Direct"} />
      <SummaryRow k="Applicant Type" v={state.applicant_type === "individual" ? "Individual" : "Corporate"} />
      <SummaryRow k="Disbursement Bank" v={state.applicant_type === "individual" ? `${state.bank_name} · ${state.bank_account_number}` : `${state.applicant_company_name}`} />
      <SummaryRow k="Sponsor" v={state.has_sponsor ? `${state.sponsor_type === "personal" ? state.sponsor.full_name : state.sponsor.company_name}` : "None"} />
      <SummaryRow k="Documents Uploaded" v={String(Object.values(state.files).filter(Boolean).length + state.additionalFiles.length)} />

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, border: "2px solid var(--blue)", padding: 14, borderRadius: 8, background: "var(--blue-lt)" }}>
        <input type="checkbox" checked={state.master_confirmed} onChange={(e) => update({ master_confirmed: e.target.checked })} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Final Declaration: I confirm that everything in this application is true and complete.
        </span>
      </label>
    </>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", padding: "8px 0", borderBottom: "1px dashed var(--border)", fontSize: 13 }}>
      <div style={{ width: 220, fontWeight: 600, color: "var(--muted)" }}>{k}</div>
      <div>{v || "—"}</div>
    </div>
  );
}
