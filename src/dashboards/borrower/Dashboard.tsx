import { useState, useEffect, useRef, useMemo, ReactNode, Dispatch, SetStateAction } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { api } from "../../api/client";
import useStore from "../../store/useStore";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { getSocket, initSocket, disconnectSocket } from "../../socket";
import type {
  Application,
  Repayment,
  Extension,
  Signature,
  Notification,
  DocumentInfo,
  ChatMessage,
} from "../../types/api";
import "./Borrower.css";

type TabKey = "home" | "apply" | "status" | "docs" | "msgs" | "notifs";
type BadgeKey = "msgs" | "notifs";

interface TabDef {
  key: TabKey;
  label: string;
  badgeKey?: BadgeKey;
}

const TABS: TabDef[] = [
  { key: "home", label: "Home" },
  { key: "apply", label: "Apply" },
  { key: "status", label: "My application" },
  { key: "docs", label: "Documents" },
  { key: "msgs", label: "Messages", badgeKey: "msgs" },
  { key: "notifs", label: "Notifications", badgeKey: "notifs" },
];

interface SidebarItem {
  key: TabKey;
  label: string;
  icon: ReactNode;
  badgeKey?: BadgeKey;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "home", label: "Home", icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> },
  { key: "apply", label: "Apply", icon: <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /> },
  { key: "status", label: "My application", icon: <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /> },
  { key: "docs", label: "Documents", icon: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /> },
  { key: "msgs", label: "Messages", badgeKey: "msgs", icon: <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" /> },
  { key: "notifs", label: "Notifications", badgeKey: "notifs", icon: <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /> },
];

interface ProductDef {
  key: string;
  desc: string;
  range: string;
  color: string;
  bg: string;
  icon: ReactNode;
}

const PRODUCTS: ProductDef[] = [
  { key: "Student POF", desc: "Proof of funds for student visa or university admission. With or without a sponsor.", range: "₦500K – ₦10M", color: "var(--blue)", bg: "var(--blue-lt)", icon: <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5 8.13V11a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2A1 1 0 0015 11V8.13l2-.857V13a1 1 0 102 0V7a1 1 0 00-.606-.92l-8-3.44z" /> },
  { key: "Travel POF", desc: "Embassy proof of funds for international travel visas and immigration requirements.", range: "₦200K – ₦5M", color: "var(--teal)", bg: "var(--teal-lt)", icon: <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.57V11a1 1 0 112 0v4.57a1 1 0 00.725.963l5 1.428a1 1 0 001.17-1.408l-7-14z" /> },
  { key: "LPO financing", desc: "Short-term financing to fulfil a Local Purchase Order from a reputable buyer.", range: "Up to ₦20M", color: "var(--purple)", bg: "var(--purple-lt)", icon: <><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" /></> },
  { key: "Soft business loan", desc: "Low-interest business financing for small and growing enterprises at competitive rates.", range: "₦500K – ₦15M", color: "var(--red)", bg: "var(--red-lt)", icon: <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" /> },
];

const initials = (name = ""): string =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";

const fmtMoney = (n: string | number | null | undefined): string =>
  n == null ? "—" : `₦${Number(n).toLocaleString()}`;

const fmtDate = (d: string | null | undefined): string =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const fmtDateTime = (d: string | null | undefined): string =>
  d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Icon = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 20 20">{children}</svg>;

interface BorrowerApplication extends Application {
  agent_name?: string;
  due_date?: string;
  repayment_status?: string;
  repayment_amount?: string | number;
}

type ChatHistory = Record<string, ChatMessage[]>;

export default function BorrowerDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [showExtModal, setShowExtModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [activeContact, setActiveContact] = useState("agent");

  const user = useStore((s) => s.user);
  const clearUser = useStore((s) => s.clearUser);
  const navigate = useNavigate();
  useRealtimeNotifications();

  useEffect(() => {
    if (user?.id && !getSocket()) initSocket(user.id);
  }, [user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg: ChatMessage) => {
      const room = msg.roomId || activeContact;
      setChatHistory((h) => ({ ...h, [room]: [...(h[room] || []), msg] }));
    };
    socket.on("message", handler);
    return () => { socket.off("message", handler); };
  }, [activeContact]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    clearUser();
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const queryClient = useQueryClient();
  const { data: applications = [] } = useQuery<BorrowerApplication[]>({
    queryKey: ["borrower-applications"],
    queryFn: () => api.get("/borrower/applications").then((r) => r.data),
  });
  const { data: repayments = [] } = useQuery<Repayment[]>({
    queryKey: ["borrower-repayments"],
    queryFn: () => api.get("/borrower/repayments").then((r) => r.data),
  });
  const { data: extensionsList = [] } = useQuery<Extension[]>({
    queryKey: ["borrower-extensions"],
    queryFn: () => api.get("/borrower/extensions").then((r) => r.data),
  });
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["borrower-notifications"],
    queryFn: () => api.get("/notifications?role=borrower").then((r) => r.data),
  });

  const primaryApp = applications[0];
  const primaryRepayment = repayments[0];
  const pendingExtension = extensionsList.find((e) => e.status === "pending");

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = (user?.name || user?.email || "").split(" ")[0] || "";

  const badgeCounts: Record<BadgeKey, number> = { msgs: 0, notifs: notifications.length };

  return (
    <div className="suprefax-borrower">
      <div className="sb-sign-bar">
        <span className="sb-sb-logo">Suprefax</span>
        <div className="sb-sb-sep" />
        <span className="sb-sb-portal">Customer portal</span>
        <span>Secure session · All data encrypted in transit</span>
        <div className="sb-sb-right">
          <span className="sb-sb-date">{today}</span>
          <button className="sb-sb-back" onClick={handleSignOut}>← Sign out</button>
        </div>
      </div>

      <div className="sb-topbar">
        <div className="sb-tb-brand">
          <div className="sb-tb-mark">
            <svg viewBox="0 0 16 16"><path d="M2 2h4v12H2V2zm8 0h4v12h-4V2zm-4 4h4v4H6V6z" /></svg>
          </div>
          <div>
            <div className="sb-tb-name">Suprefax</div>
            <div className="sb-tb-tag">Customer portal</div>
          </div>
        </div>
        <nav className="sb-tb-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`sb-tab ${activeTab === t.key ? "on" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.badgeKey && badgeCounts[t.badgeKey] > 0 && (
                <span className="sb-nb">{badgeCounts[t.badgeKey]}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sb-tb-right">
          <button className="sb-tb-notif" onClick={() => setActiveTab("notifs")}>
            <svg viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            {notifications.length > 0 && <div className="sb-tb-pip" />}
          </button>
          <div className="sb-tb-av">{initials(user?.name || user?.email)}</div>
          <div>
            <div className="sb-tb-uname">{user?.name || "Customer"}</div>
            <div className="sb-tb-urole">Borrower</div>
          </div>
          <button className="sb-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="sb-layout">
        <div className="sb-sidebar">
          <div className="sb-sec">
            <div className="sb-sec-lbl">Main</div>
            {SIDEBAR_ITEMS.map((it) => (
              <button
                key={it.key}
                className={`sb-item ${activeTab === it.key ? "on" : ""}`}
                onClick={() => setActiveTab(it.key)}
              >
                <Icon>{it.icon}</Icon>
                {it.label}
                {it.badgeKey && badgeCounts[it.badgeKey] > 0 && (
                  <span className="sb-badge sb-b-red">{badgeCounts[it.badgeKey]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="sb-divider" />
          <div className="sb-footer">
            <div className="sb-user-card">
              <div className="sb-u-av">{initials(user?.name || user?.email)}</div>
              <div>
                <div className="sb-u-name">{user?.name || "Customer"}</div>
                <div className="sb-u-role">Borrower</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sb-main">
          {activeTab === "home" && (
            <HomePage
              greeting={greeting}
              firstName={firstName}
              app={primaryApp}
              repayment={primaryRepayment}
              pendingExtension={pendingExtension}
              onExtensionRequest={() => setShowExtModal(true)}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "apply" && <ApplyPage queryClient={queryClient} setActiveTab={setActiveTab} />}
          {activeTab === "status" && (
            <StatusPage
              app={primaryApp}
              extensions={extensionsList}
              onExtensionRequest={() => setShowExtModal(true)}
            />
          )}
          {activeTab === "docs" && <DocsPage app={primaryApp} />}
          {activeTab === "msgs" && (
            <MessagesPage
              activeContact={activeContact}
              setActiveContact={setActiveContact}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              currentUserId={user?.id || ""}
              app={primaryApp}
            />
          )}
          {activeTab === "notifs" && <NotificationsPage notifications={notifications} />}
        </div>
      </div>

      {showExtModal && primaryApp && (
        <ExtensionModal
          app={primaryApp}
          repayment={primaryRepayment}
          onClose={() => setShowExtModal(false)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

interface HomePageProps {
  greeting: string;
  firstName: string;
  app: BorrowerApplication | undefined;
  repayment: Repayment | undefined;
  pendingExtension: Extension | undefined;
  onExtensionRequest: () => void;
  setActiveTab: (t: TabKey) => void;
}

function HomePage({ greeting, firstName, app, repayment, pendingExtension, onExtensionRequest, setActiveTab }: HomePageProps) {
  const dueAlert = useMemo(() => {
    if (!repayment) return null;
    const days = Math.ceil((new Date(repayment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (repayment.status === "paid") return null;
    if (days < 0) return { color: "red" as const, text: `Your repayment of ${fmtMoney(repayment.amount)} is overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}.` };
    if (days <= 2) return { color: "red" as const, text: `Your repayment of ${fmtMoney(repayment.amount)} is due in ${days} day${days !== 1 ? "s" : ""}.` };
    if (days <= 7) return { color: "amber" as const, text: `Your repayment of ${fmtMoney(repayment.amount)} is due in ${days} days.` };
    return null;
  }, [repayment]);

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">{greeting}{firstName && `, ${firstName}`}</div>
        <div className="sb-page-sub">Here's your loan overview and quick actions for today</div>
      </div>

      <div className="sb-stat-grid sb-s3">
        <div className="sb-stat">
          <div className="sb-s-lbl">Active loan</div>
          <div className="sb-s-val">{app ? fmtMoney(app.amount) : "—"}</div>
          <div className="sb-s-sub">{app ? app.id.slice(0, 8) : "No active loan"}</div>
        </div>
        <div className="sb-stat">
          <div className="sb-s-lbl">Status</div>
          <div className="sb-s-val" style={{ fontSize: 16, color: app?.status === "active" ? "var(--green)" : "var(--amber)" }}>
            {app?.status || "—"}
          </div>
          <div className="sb-s-sub">{app?.admin_approved ? "Admin approved" : "Awaiting approval"}</div>
        </div>
        <div className="sb-stat">
          <div className="sb-s-lbl">Due date</div>
          <div className="sb-s-val" style={{ fontSize: 16 }}>{fmtDate(repayment?.due_date)}</div>
          <div className="sb-s-sub">{repayment ? `${fmtMoney(repayment.amount)} due` : "No upcoming payments"}</div>
        </div>
      </div>

      {dueAlert && (
        <div className={`sb-alert sb-al-${dueAlert.color}`}>
          ⚡ {dueAlert.text}
          {pendingExtension && " Your extension request is under admin review."}
        </div>
      )}

      {!app ? (
        <div className="sb-card sb-empty">
          You don't have an active loan yet. <button className="sb-btn sb-btn-primary sb-btn-sm" style={{ marginLeft: 8 }} onClick={() => setActiveTab("apply")}>Apply now →</button>
        </div>
      ) : (
        <div className="sb-two-col">
          <div>
            <div className="sb-card">
              <div className="sb-card-hdr">
                <div>
                  <div className="sb-card-title">Loan summary</div>
                  <div className="sb-card-sub" style={{ marginBottom: 0 }}>{app.id.slice(0, 8)} · {app.product}</div>
                </div>
                <span className={`sb-badge2 ${app.admin_approved ? "sb-b-green" : "sb-b-amber"}`}>
                  {app.admin_approved ? "Approved" : "Pending approval"}
                </span>
              </div>
              <div className="sb-sr"><span className="sb-sr-l">Lender</span><span className="sb-sr-r">Suprefax Limited</span></div>
              <div className="sb-sr"><span className="sb-sr-l">Principal</span><span className="sb-sr-r">{fmtMoney(app.amount)}</span></div>
              <div className="sb-sr"><span className="sb-sr-l">Interest (3% p.a.)</span><span className="sb-sr-r">{fmtMoney(Number(app.amount) * 0.03)}</span></div>
              <div className="sb-sr"><span className="sb-sr-l">Total repayable</span><span className="sb-sr-r" style={{ color: "var(--amber)" }}>{fmtMoney(Number(app.amount) * 1.03)}</span></div>
              <div className="sb-sr"><span className="sb-sr-l">Due date</span><span className="sb-sr-r" style={{ color: "var(--amber)" }}>{fmtDate(repayment?.due_date)}</span></div>
              <div className="sb-sr"><span className="sb-sr-l">My agent</span><span className="sb-sr-r">{app.agent_name || "Unassigned"}</span></div>
            </div>
          </div>
          <div>
            <div className="sb-card">
              <div className="sb-card-title" style={{ marginBottom: 12 }}>Quick actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="sb-btn sb-btn-full" onClick={() => setActiveTab("msgs")}>💬 Message my agent</button>
                <button className="sb-btn sb-btn-full" onClick={() => setActiveTab("status")}>📋 View application status</button>
                <button className="sb-btn sb-btn-amber sb-btn-full" onClick={onExtensionRequest}>⏱ Request payment extension</button>
                <button className="sb-btn sb-btn-full" onClick={() => setActiveTab("docs")}>📄 View documents</button>
              </div>
            </div>
            {pendingExtension && (
              <div className="sb-card" style={{ background: "var(--amber-lt)", borderColor: "rgba(180,83,9,.2)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--amber)", marginBottom: 5 }}>
                  Extension request pending
                </div>
                <div style={{ fontSize: 12, color: "var(--amber)", opacity: .85, lineHeight: 1.5 }}>
                  EXT-{pendingExtension.id.slice(0, 8)} — extension to {fmtDate(pendingExtension.new_date)}. Awaiting admin decision.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ApplyPageProps {
  queryClient: QueryClient;
  setActiveTab: (t: TabKey) => void;
}

function ApplyPage({ queryClient, setActiveTab }: ApplyPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductDef | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createApp = useMutation({
    mutationFn: (payload: { product: string; amount: number }) =>
      api.post("/borrower/applications", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrower-applications"] });
      setSelectedProduct(null);
      setAmount("");
      setActiveTab("status");
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || "Failed to apply"),
  });

  const handleApply = () => {
    setError(null);
    if (!selectedProduct) return;
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    createApp.mutate({ product: selectedProduct.key, amount: Number(amount) });
  };

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Apply for a product</div>
        <div className="sb-page-sub">Select a product and submit — your application is sent to an agent for review</div>
      </div>

      <div className="sb-alert sb-al-blue">
        The lender on all applications is <strong>Suprefax Limited</strong> (IDA Training Hub, 23/24 NTC Leaf Road, Iyaganku GRA, Ibadan, Oyo State).
      </div>

      <div className="sb-prod-grid">
        {PRODUCTS.map((p) => (
          <div
            key={p.key}
            className="sb-prod-card"
            onClick={() => setSelectedProduct(p)}
            style={selectedProduct?.key === p.key ? { borderColor: p.color, background: p.bg } : {}}
          >
            <div className="sb-prod-bar" style={{ background: p.color }} />
            <div className="sb-prod-icon" style={{ background: p.bg }}>
              <svg viewBox="0 0 20 20" fill={p.color}>{p.icon}</svg>
            </div>
            <div className="sb-prod-name">{p.key}</div>
            <div className="sb-prod-desc">{p.desc}</div>
            <div className="sb-prod-foot">
              <span className="sb-prod-range">{p.range}</span>
              <span style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>
                {selectedProduct?.key === p.key ? "Selected ✓" : "Select →"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="sb-card" style={{ marginTop: 16 }}>
          <div className="sb-card-title">Apply for {selectedProduct.key}</div>
          <div className="sb-card-sub">Enter the amount you want to borrow</div>

          {error && <div className="sb-alert sb-al-red">{error}</div>}

          <div className="sb-m-fg">
            <label className="sb-m-fl">Amount (₦)</label>
            <input
              type="number"
              className="sb-m-fi"
              placeholder="e.g. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="sb-btn sb-btn-primary"
            onClick={handleApply}
            disabled={createApp.isPending}
          >
            {createApp.isPending ? "Submitting…" : "Submit application"}
          </button>
        </div>
      )}
    </div>
  );
}

interface StatusPageProps {
  app: BorrowerApplication | undefined;
  extensions: Extension[];
  onExtensionRequest: () => void;
}

function StatusPage({ app, extensions, onExtensionRequest }: StatusPageProps) {
  const { data: signatures = [] } = useQuery<Signature[]>({
    queryKey: ["signatures", app?.id],
    queryFn: () => api.get(`/signatures/${app!.id}`).then((r) => r.data),
    enabled: !!app?.id,
  });

  if (!app) {
    return (
      <div className="sb-page">
        <div className="sb-page-hdr">
          <div className="sb-page-title">My application</div>
        </div>
        <div className="sb-card sb-empty">No application yet.</div>
      </div>
    );
  }

  const allSigned = signatures.length > 0 && signatures.every((s) => s.signed);
  const pendingSignatures = signatures.filter((s) => !s.signed);
  const adminApproved = app.admin_approved;

  type StepState = "done" | "now" | "warn" | "wait";
  interface Step { state: StepState; title: string; desc: string; time: string; }

  const timelineSteps: Step[] = [
    { state: "done", title: "Application submitted", desc: `${app.id.slice(0, 8)} · ${app.product} · Lender: Suprefax Limited`, time: fmtDateTime(app.created_at) },
    { state: signatures.length > 0 ? "done" : "wait", title: "Signature workflow initialised", desc: `${signatures.length} parties added to the contract`, time: signatures.length ? "Done" : "Pending" },
    { state: allSigned ? "done" : (signatures.some((s) => s.signed) ? "warn" : "wait"), title: allSigned ? "All parties signed" : "Signatures pending", desc: pendingSignatures.length ? `Awaiting: ${pendingSignatures.map((s) => s.party).join(", ")}` : "All signatures collected", time: allSigned ? "Complete" : "In progress" },
    { state: adminApproved ? "done" : (allSigned ? "now" : "wait"), title: "Admin review", desc: adminApproved ? "Approved by Suprefax admin" : "Suprefax team reviewing your application", time: adminApproved ? "Approved" : "Pending" },
    { state: app.status === "active" ? "done" : "wait", title: "Disbursement", desc: app.status === "active" ? "Funds released" : "Funds will be released after admin approval", time: app.status === "active" ? "Complete" : "Pending" },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">My application</div>
        <div className="sb-page-sub">{app.id.slice(0, 8)} · {app.product} · {fmtMoney(app.amount)}</div>
      </div>

      {!adminApproved && (
        <div className="sb-alert sb-al-amber">
          Application is pending admin approval{pendingSignatures.length > 0 && `. Outstanding signatures: ${pendingSignatures.map((s) => s.party).join(", ")}`}.
        </div>
      )}
      {adminApproved && app.status === "active" && (
        <div className="sb-alert sb-al-green">Your loan has been approved and is active. Be sure to make your repayments on time.</div>
      )}

      <div className="sb-two-col">
        <div>
          <div className="sb-card">
            <div className="sb-card-hdr"><div className="sb-card-title">Application timeline</div></div>
            {timelineSteps.map((step, i) => (
              <div className="sb-tl-item" key={i}>
                <div className="sb-tl-col">
                  <div className={`sb-tl-dot sb-tl-${step.state}`} />
                  {i < timelineSteps.length - 1 && <div className="sb-tl-line" />}
                </div>
                <div className="sb-tl-body">
                  <div className="sb-tl-title" style={step.state === "wait" ? { color: "var(--dim)" } : step.state === "warn" ? { color: "var(--amber)" } : step.state === "now" ? { color: "var(--teal)" } : {}}>
                    {step.title}
                  </div>
                  <div className="sb-tl-desc">{step.desc}</div>
                  <div className="sb-tl-time">{step.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sb-card">
            <div className="sb-card-hdr">
              <div className="sb-card-title">Signature status</div>
              <span className={`sb-badge2 ${pendingSignatures.length === 0 ? "sb-b-green" : "sb-b-amber"}`}>
                {pendingSignatures.length === 0 ? "Complete" : `${pendingSignatures.length} pending`}
              </span>
            </div>
            {signatures.length === 0 ? (
              <div className="sb-empty">No signature workflow yet.</div>
            ) : signatures.map((s) => (
              <div key={s.id} className="sb-sig-row">
                <div className="sb-sig-av" style={{ background: "var(--blue-lt)", color: "var(--blue)" }}>
                  {s.party.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", textTransform: "capitalize" }}>{s.party}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.signed ? `Signed ${fmtDate(s.signed_at)}` : "Not signed"}</div>
                </div>
                <span className={`sb-badge2 ${s.signed ? "sb-b-teal" : "sb-b-amber"}`}>
                  {s.signed ? "Signed" : "Awaiting"}
                </span>
              </div>
            ))}
          </div>

          <div className="sb-card">
            <div className="sb-card-hdr">
              <div className="sb-card-title">Extension requests</div>
              <button className="sb-btn sb-btn-sm sb-btn-amber" onClick={onExtensionRequest}>New request</button>
            </div>
            {extensions.length === 0 ? (
              <div className="sb-empty">No extension requests yet.</div>
            ) : extensions.map((e) => (
              <div key={e.id} className="sb-ext-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>EXT-{e.id.slice(0, 8)}</span>
                  <span className={`sb-badge2 ${e.status === "approved" ? "sb-b-green" : e.status === "declined" ? "sb-b-red2" : "sb-b-amber"}`}>
                    {e.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--amber)", lineHeight: 1.5, marginBottom: 5 }}>
                  Extension to {fmtDate(e.new_date)}
                </div>
                <div style={{ fontSize: 11, color: "var(--dim)" }}>{e.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocsPage({ app }: { app: BorrowerApplication | undefined }) {
  const { data: docInfo } = useQuery<DocumentInfo>({
    queryKey: ["documents", app?.id],
    queryFn: () => api.get(`/documents/${app!.id}`).then((r) => r.data),
    enabled: !!app?.id,
  });

  if (!app) {
    return (
      <div className="sb-page">
        <div className="sb-page-hdr"><div className="sb-page-title">Documents</div></div>
        <div className="sb-card sb-empty">No application yet — apply to get started.</div>
      </div>
    );
  }

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Documents</div>
        <div className="sb-page-sub">Loan agreement files for {app.id.slice(0, 8)}</div>
      </div>

      <div className="sb-card">
        <div className="sb-card-hdr">
          <div className="sb-card-title">Agreement files</div>
          <span className={`sb-badge2 ${docInfo?.status === "available" ? "sb-b-green" : "sb-b-amber"}`}>
            {docInfo?.status === "available" ? "Available" : "Locked"}
          </span>
        </div>

        <div className="sb-doc-row">
          <div className="sb-doc-ico" style={{ background: "var(--blue-lt)", border: "1px solid rgba(27,79,216,.2)" }}>
            <svg viewBox="0 0 16 16" fill="var(--blue)"><path d="M3 1h7l3 3v11H3V1zm7 0v3h3" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="sb-doc-name">Loan agreement</div>
            <div className="sb-doc-meta">
              {docInfo?.status === "available" ? (
                <span style={{ color: "var(--green)" }}>Ready to download</span>
              ) : (
                <span style={{ color: "var(--amber)" }}>{docInfo?.reason || "Pending signatures or admin approval"}</span>
              )}
            </div>
          </div>
          {docInfo?.status === "available" && docInfo.url ? (
            <a href={docInfo.url} className="sb-btn sb-btn-primary sb-btn-sm">Download PDF</a>
          ) : (
            <button className="sb-btn sb-btn-sm" disabled>Locked</button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MessagesPageProps {
  activeContact: string;
  setActiveContact: (c: string) => void;
  chatHistory: ChatHistory;
  setChatHistory: Dispatch<SetStateAction<ChatHistory>>;
  currentUserId: string;
  app: BorrowerApplication | undefined;
}

function MessagesPage({ activeContact, setActiveContact, chatHistory, setChatHistory, currentUserId, app }: MessagesPageProps) {
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const contacts = [
    { key: "agent", name: app?.agent_name || "My Agent", role: "Agent", roomId: `chat-${app?.id || "default"}` },
    { key: "admin", name: "Suprefax Admin", role: "Administrator", roomId: `admin-${app?.id || "default"}` },
  ];
  const active = contacts.find((c) => c.key === activeContact) || contacts[0];
  const messages = chatHistory[active.key] || [];

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !active.roomId) return;
    socket.emit("joinRoom", { roomId: active.roomId });
  }, [active.roomId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!input.trim()) return;
    const socket = getSocket();
    if (!socket) return;
    const msg: ChatMessage = { roomId: active.roomId, senderId: currentUserId, text: input };
    socket.emit("sendMessage", msg);
    setChatHistory((h) => ({ ...h, [active.key]: [...(h[active.key] || []), msg] }));
    setInput("");
  };

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Messages</div>
        <div className="sb-page-sub">In-app messaging with your agent and Suprefax admin</div>
      </div>

      <div className="sb-chat-wrap">
        <div className="sb-chat-list-panel">
          <div className="sb-clp-hdr">Conversations</div>
          {contacts.map((c) => (
            <div
              key={c.key}
              className={`sb-cl-item ${active.key === c.key ? "on" : ""}`}
              onClick={() => setActiveContact(c.key)}
            >
              <div className="sb-cli-name">{c.name}</div>
              <div className="sb-cli-prev">{c.role}</div>
            </div>
          ))}
        </div>

        <div className="sb-chat-main-panel">
          <div className="sb-chat-hdr">
            <div className="sb-chat-av" style={{ background: "var(--blue-lt)", color: "var(--blue)" }}>
              {initials(active.name)}
            </div>
            <div>
              <div className="sb-chat-uname">{active.name}</div>
              <div className="sb-chat-urole">{active.role}</div>
            </div>
            <div className="sb-chat-online" />
          </div>

          <div className="sb-chat-body" ref={bodyRef}>
            <div className="sb-msg-sys">Today</div>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 40 }}>
                No messages yet. Send the first one below.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`sb-msg ${m.senderId === currentUserId ? "mine" : "theirs"}`}>
                <div className="sb-msg-b">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="sb-chat-input-row">
            <input
              className="sb-chat-inp"
              placeholder={`Message ${active.name.split(" ")[0]}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="sb-chat-send" onClick={send}>
              <svg viewBox="0 0 16 16"><path d="M1 1l14 7-14 7V9.5l10-1.5-10-1.5V1z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsPage({ notifications }: { notifications: Notification[] }) {
  const dotColor = (type: string | undefined): string => {
    if (type === "overdue" || type === "24hr") return "var(--red)";
    if (type === "48hr") return "var(--amber)";
    if (type === "approval") return "var(--green)";
    return "var(--blue)";
  };

  return (
    <div className="sb-page">
      <div className="sb-page-hdr">
        <div className="sb-page-title">Notifications</div>
        <div className="sb-page-sub">All alerts related to your loan, application and payments</div>
      </div>

      <div className="sb-card">
        <div className="sb-card-hdr"><div className="sb-card-title">Recent alerts</div></div>
        {notifications.length === 0 ? (
          <div className="sb-empty">No notifications right now.</div>
        ) : notifications.map((n, i) => (
          <div key={n.id || i} className="sb-notif-row">
            <div className="sb-ndot" style={{ background: dotColor(n.type) }} />
            <div>
              <div className="sb-ntitle">{n.message}</div>
              <div className="sb-ndesc">
                {n.type ? `Type: ${n.type}` : ""} {n.channel ? `· Channel: ${n.channel}` : ""}
              </div>
              <div className="sb-ntime">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ExtensionModalProps {
  app: BorrowerApplication;
  repayment: Repayment | undefined;
  onClose: () => void;
  queryClient: QueryClient;
}

function ExtensionModal({ app, repayment, onClose, queryClient }: ExtensionModalProps) {
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: (payload: { application_id: string; new_date: string; reason: string }) =>
      api.post("/extensions", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrower-extensions"] });
      onClose();
    },
    onError: (err: AxiosError<{ message?: string }>) =>
      setError(err.response?.data?.message || "Failed to submit"),
  });

  const handleSubmit = () => {
    setError(null);
    if (!newDate || !reason) {
      setError("Please fill in all required fields.");
      return;
    }
    submit.mutate({ application_id: app.id, new_date: newDate, reason });
  };

  return (
    <div className="sb-modal-bg" onClick={onClose}>
      <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sb-m-title">Request payment extension</div>
        <div className="sb-m-sub">Your request is sent to admin for approval. Reminders continue until approved.</div>

        {error && <div className="sb-alert sb-al-red">{error}</div>}

        <div className="sb-m-fg">
          <label className="sb-m-fl">Current due date</label>
          <input className="sb-m-fi ro" readOnly value={fmtDate(repayment?.due_date)} />
        </div>
        <div className="sb-m-fg">
          <label className="sb-m-fl">Requested new date *</label>
          <input className="sb-m-fi" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        </div>
        <div className="sb-m-fg">
          <label className="sb-m-fl">Reason *</label>
          <textarea
            className="sb-m-fi"
            rows={3}
            placeholder="Explain why you need more time…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        <div className="sb-m-acts">
          <button className="sb-btn sb-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="sb-btn sb-btn-amber" onClick={handleSubmit} disabled={submit.isPending}>
            {submit.isPending ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </div>
    </div>
  );
}
