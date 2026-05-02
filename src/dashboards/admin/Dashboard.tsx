import { useState, useMemo, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import useStore from "../../store/useStore";
import { disconnectSocket } from "../../socket";
import type {
  Application,
  Extension,
  Agent,
  Customer,
  AuditLog,
  Analytics,
} from "../../types/api";
import "./Admin.css";

type TabKey = "overview" | "loans" | "agents" | "customers" | "extensions" | "notifs" | "settings";

type BadgeKey = "extensions" | "audit";

interface TabDef {
  key: TabKey;
  label: string;
  badgeKey?: BadgeKey;
}

const TABS: TabDef[] = [
  { key: "overview", label: "Overview" },
  { key: "loans", label: "All loans" },
  { key: "agents", label: "Agents" },
  { key: "customers", label: "All customers" },
  { key: "extensions", label: "Extensions", badgeKey: "extensions" },
  { key: "notifs", label: "Notifications", badgeKey: "audit" },
  { key: "settings", label: "Notif. settings" },
];

interface SidebarItem {
  key: TabKey;
  label: string;
  icon: ReactNode;
  badgeKey?: BadgeKey;
  badgeClass?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "overview", label: "Overview", icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> },
  { key: "loans", label: "All loans", icon: <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /> },
  { key: "agents", label: "Agents", icon: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM4.5 16a4.5 4.5 0 019 0H4.5zM14 16h5.5a4.5 4.5 0 00-9 0H14z" /> },
  { key: "customers", label: "All customers", icon: <path d="M10 12a4 4 0 100-8 4 4 0 000 8zm-6.938 4h13.856C16.09 14.004 13.232 12 10 12s-6.09 2.004-6.938 4z" /> },
  { key: "extensions", label: "Extensions", badgeKey: "extensions", badgeClass: "sa-b-amber", icon: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /> },
  { key: "notifs", label: "Notifications", badgeKey: "audit", badgeClass: "sa-b-red", icon: <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /> },
  { key: "settings", label: "Notif. settings", icon: <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /> },
];

const initials = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "?";

const fmtMoney = (n: string | number | null | undefined): string =>
  n == null ? "—" : `₦${Number(n).toLocaleString()}`;

const fmtDate = (d: string | null | undefined): string =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

interface DueResult {
  label: string;
  cls: string;
}

const dueLabel = (dueDate: string | undefined, status: string | undefined): DueResult => {
  if (status === "overdue") return { label: "Overdue", cls: "sa-t-over" };
  if (!dueDate) return { label: "—", cls: "" };
  const now = new Date();
  const due = new Date(dueDate);
  const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, cls: "sa-t-over" };
  if (days <= 2) return { label: fmtDate(dueDate), cls: "sa-t-due" };
  return { label: fmtDate(dueDate), cls: "" };
};

const statusBadge = (status: string | undefined): ReactNode => {
  const map: Record<string, { cls: string; label: string }> = {
    overdue: { cls: "sa-bd-red", label: "Overdue" },
    due: { cls: "sa-bd-amber", label: "Due soon" },
    paid: { cls: "sa-bd-green", label: "Paid" },
    pending: { cls: "sa-bd-gray", label: "Pending" },
    approved: { cls: "sa-bd-blue", label: "Approved" },
    active: { cls: "sa-bd-blue", label: "Active" },
    declined: { cls: "sa-bd-red", label: "Declined" },
  };
  const m = map[status || ""] || { cls: "sa-bd-gray", label: status || "—" };
  return <span className={`sa-badge ${m.cls}`}>{m.label}</span>;
};

const Icon = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 20 20">{children}</svg>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const user = useStore((s) => s.user);
  const clearUser = useStore((s) => s.clearUser);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    disconnectSocket();
    clearUser();
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const queryClient = useQueryClient();
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then((r) => r.data),
  });
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["admin-applications"],
    queryFn: () => api.get("/admin/applications").then((r) => r.data),
  });
  const { data: extensions = [] } = useQuery<Extension[]>({
    queryKey: ["admin-extensions"],
    queryFn: () => api.get("/admin/extensions").then((r) => r.data),
  });
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["admin-agents"],
    queryFn: () => api.get("/admin/agents").then((r) => r.data),
  });
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["admin-customers"],
    queryFn: () => api.get("/admin/customers").then((r) => r.data),
  });
  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: () => api.get("/audit").then((r) => r.data),
  });

  const pendingExtensions = useMemo(
    () => extensions.filter((e) => e.status === "pending"),
    [extensions]
  );

  const badgeCounts: Record<BadgeKey, number> = {
    extensions: pendingExtensions.length,
    audit: auditLogs.length,
  };

  return (
    <div className="suprefax-admin">
      <div className="sa-sign-bar">
        <span className="sa-sb-logo">Suprefax</span>
        <div className="sa-sb-sep" />
        <span className="sa-sb-portal">Admin panel</span>
        <span>Full system access · Administrator only</span>
        <div className="sa-sb-right">
          <span className="sa-sb-date">{today}</span>
          <button className="sa-sb-back" onClick={handleSignOut}>← Sign out</button>
        </div>
      </div>

      <div className="sa-topbar">
        <div className="sa-tb-brand">
          <div className="sa-tb-mark">
            <svg viewBox="0 0 16 16"><path d="M2 2h4v12H2V2zm8 0h4v12h-4V2zm-4 4h4v4H6V6z" /></svg>
          </div>
          <div>
            <div className="sa-tb-name">Suprefax</div>
            <div className="sa-tb-tag">Admin panel</div>
          </div>
        </div>
        <nav className="sa-tb-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`sa-tab ${activeTab === t.key ? "on" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.badgeKey && badgeCounts[t.badgeKey] > 0 && (
                <span className="sa-nb">{badgeCounts[t.badgeKey]}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sa-tb-right">
          <button className="sa-tb-notif" onClick={() => setActiveTab("notifs")}>
            <svg viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            {auditLogs.length > 0 && <div className="sa-tb-pip" />}
          </button>
          <div className="sa-tb-av">{initials(user?.name || user?.email)}</div>
          <div>
            <div className="sa-tb-uname">{user?.name || "Admin"}</div>
            <div className="sa-tb-urole">Administrator</div>
          </div>
          <button className="sa-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="sa-layout">
        <div className="sa-sidebar">
          <div className="sa-sb-sec">
            <div className="sa-sb-lbl">Admin</div>
            {SIDEBAR_ITEMS.map((it) => (
              <button
                key={it.key}
                className={`sa-sb-item ${activeTab === it.key ? "on" : ""}`}
                onClick={() => setActiveTab(it.key)}
              >
                <Icon>{it.icon}</Icon>
                {it.label}
                {it.badgeKey && badgeCounts[it.badgeKey] > 0 && (
                  <span className={`sa-sb-badge ${it.badgeClass}`}>
                    {badgeCounts[it.badgeKey]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="sa-sb-divider" />
          <div className="sa-sb-footer">
            <div className="sa-sb-user">
              <div className="sa-sb-u-av">{initials(user?.name || user?.email)}</div>
              <div>
                <div className="sa-sb-u-name">{user?.name || "Admin"}</div>
                <div className="sa-sb-u-role">Full access · Administrator</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sa-main">
          {activeTab === "overview" && <OverviewPage analytics={analytics} extensions={pendingExtensions} applications={applications} setActiveTab={setActiveTab} />}
          {activeTab === "loans" && <LoansPage applications={applications} />}
          {activeTab === "agents" && <AgentsPage agents={agents} setActiveTab={setActiveTab} />}
          {activeTab === "customers" && <CustomersPage customers={customers} agents={agents} />}
          {activeTab === "extensions" && <ExtensionsPage extensions={pendingExtensions} queryClient={queryClient} />}
          {activeTab === "notifs" && <NotificationsPage auditLogs={auditLogs} />}
          {activeTab === "settings" && <SettingsPage applications={applications} />}
        </div>
      </div>
    </div>
  );
}

interface OverviewProps {
  analytics: Analytics | undefined;
  extensions: Extension[];
  applications: Application[];
  setActiveTab: (t: TabKey) => void;
}

function OverviewPage({ analytics, extensions, applications, setActiveTab }: OverviewProps) {
  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">Admin overview</div>
        <div className="sa-page-sub">Complete system view — all loans, agents, customers and pending actions</div>
      </div>

      <div className="sa-stat-grid sa-s4">
        <div className="sa-stat">
          <div className="sa-s-lbl">Total loans</div>
          <div className="sa-s-val">{analytics?.total_loans ?? "—"}</div>
          <div className="sa-s-sub">{analytics?.active ?? 0} active</div>
        </div>
        <div className="sa-stat">
          <div className="sa-s-lbl">Portfolio</div>
          <div className="sa-s-val" style={{ fontSize: 16 }}>
            {fmtMoney(applications.reduce((s, a) => s + Number(a.amount || 0), 0))}
          </div>
          <div className="sa-s-sub">All loans combined</div>
        </div>
        <div className="sa-stat">
          <div className="sa-s-lbl">Pending extensions</div>
          <div className="sa-s-val" style={{ fontSize: 16, color: "var(--amber)" }}>
            {extensions.length}
          </div>
          <div className="sa-s-sub">Awaiting review</div>
        </div>
        <div className="sa-stat">
          <div className="sa-s-lbl">Overdue</div>
          <div className="sa-s-val" style={{ fontSize: 16, color: "var(--red)" }}>
            {analytics?.overdue ?? 0}
          </div>
          <div className="sa-s-sub">Repayments late</div>
        </div>
      </div>

      {(extensions.length > 0 || (analytics?.overdue ?? 0) > 0) && (
        <div className="sa-alert sa-al-red">
          ⚠ {extensions.length} extension request{extensions.length !== 1 && "s"} pending approval · {analytics?.overdue ?? 0} loan{analytics?.overdue !== 1 && "s"} overdue
        </div>
      )}

      <div className="sa-two-col">
        <div className="sa-card">
          <div className="sa-card-hdr">
            <div>
              <div className="sa-card-title">Recent applications</div>
              <div className="sa-card-sub" style={{ marginBottom: 0 }}>Latest loan activity</div>
            </div>
          </div>
          {applications.length === 0 ? (
            <div className="sa-empty">No applications yet.</div>
          ) : (
            <table className="sa-tbl">
              <thead>
                <tr><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td>{a.borrower_name || a.borrower_id?.slice(0, 8)}</td>
                    <td>{a.product || "—"}</td>
                    <td>{fmtMoney(a.amount)}</td>
                    <td>{statusBadge(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="sa-card">
          <div className="sa-card-title" style={{ marginBottom: 12 }}>Pending actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ActionRow label={`${extensions.length} extension request${extensions.length !== 1 ? "s" : ""}`} color="amber" onClick={() => setActiveTab("extensions")} />
            <ActionRow label={`${analytics?.overdue ?? 0} overdue loans`} color="red" onClick={() => setActiveTab("loans")} />
            <ActionRow label={`${applications.filter((a) => !a.admin_approved).length} awaiting approval`} color="purple" onClick={() => setActiveTab("loans")} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ActionColor = "amber" | "red" | "purple" | "blue";

function ActionRow({ label, color, onClick }: { label: string; color: ActionColor; onClick: () => void }) {
  const map: Record<ActionColor, { bg: string; border: string; text: string; btn: string }> = {
    amber: { bg: "var(--amber-lt)", border: "rgba(180,83,9,.2)", text: "var(--amber)", btn: "sa-btn-amber" },
    red: { bg: "var(--red-lt)", border: "rgba(220,38,38,.2)", text: "var(--red)", btn: "sa-btn-red" },
    purple: { bg: "var(--purple-lt)", border: "rgba(109,40,217,.2)", text: "var(--purple)", btn: "sa-btn-purple" },
    blue: { bg: "var(--blue-lt)", border: "rgba(27,79,216,.2)", text: "var(--blue)", btn: "sa-btn-blue" },
  };
  const c = map[color];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "var(--r3)", background: c.bg, border: `1px solid ${c.border}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{label}</div>
      <button className={`sa-btn sa-btn-sm ${c.btn}`} onClick={onClick}>Review →</button>
    </div>
  );
}

function LoansPage({ applications }: { applications: Application[] }) {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (a.borrower_name || "").toLowerCase().includes(q) ||
        (a.id || "").toLowerCase().includes(q) ||
        (a.agent_name || "").toLowerCase().includes(q);
      const matchesProduct = !productFilter || a.product === productFilter;
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [applications, search, productFilter, statusFilter]);

  const products = [...new Set(applications.map((a) => a.product).filter(Boolean))];
  const statuses = [...new Set(applications.map((a) => a.status).filter(Boolean))];

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">All loan agreements</div>
        <div className="sa-page-sub">Complete register of every loan across all agents and customers</div>
      </div>

      <div className="sa-search-bar">
        <input className="sa-search-inp" placeholder="Search by customer, reference or agent…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="sa-filter-sel" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="">All products</option>
          {products.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="sa-filter-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="sa-card">
        {filtered.length === 0 ? (
          <div className="sa-empty">No loans match your filters.</div>
        ) : (
          <div className="sa-tbl-wrap">
            <table className="sa-tbl">
              <thead>
                <tr><th>Customer</th><th>Reference</th><th>Product</th><th>Amount</th><th>Agent</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a.borrower_name || "—"}</td>
                    <td style={{ color: "var(--muted)", fontSize: 11 }}>{a.id?.slice(0, 8)}…</td>
                    <td>{a.product || "—"}</td>
                    <td>{fmtMoney(a.amount)}</td>
                    <td style={{ color: "var(--muted)" }}>{a.agent_name || "—"}</td>
                    <td>{statusBadge(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentsPage({ agents, setActiveTab }: { agents: Agent[]; setActiveTab: (t: TabKey) => void }) {
  const totalPortfolio = agents.reduce((s, a) => s + Number(a.portfolio || 0), 0);
  const totalCustomers = agents.reduce((s, a) => s + Number(a.customers || 0), 0);

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">Agent management</div>
        <div className="sa-page-sub">All registered agents — view portfolios and contact details</div>
      </div>

      <div className="sa-stat-grid sa-s4" style={{ marginBottom: 20 }}>
        <div className="sa-stat"><div className="sa-s-lbl">Total agents</div><div className="sa-s-val">{agents.length}</div><div className="sa-s-sub">All active</div></div>
        <div className="sa-stat"><div className="sa-s-lbl">Customers</div><div className="sa-s-val">{totalCustomers}</div><div className="sa-s-sub">Across agents</div></div>
        <div className="sa-stat"><div className="sa-s-lbl">Portfolio</div><div className="sa-s-val" style={{ fontSize: 16 }}>{fmtMoney(totalPortfolio)}</div><div className="sa-s-sub">Combined</div></div>
        <div className="sa-stat"><div className="sa-s-lbl">Avg per agent</div><div className="sa-s-val" style={{ fontSize: 16 }}>{fmtMoney(agents.length ? totalPortfolio / agents.length : 0)}</div><div className="sa-s-sub">Portfolio</div></div>
      </div>

      {agents.length === 0 ? (
        <div className="sa-card sa-empty">No agents in the system yet.</div>
      ) : agents.map((a) => (
        <div key={a.id} className="sa-agent-card">
          <div className="sa-ac-header">
            <div className="sa-ac-av">{initials(a.full_name || a.email)}</div>
            <div style={{ flex: 1 }}>
              <div className="sa-ac-name">
                {a.full_name || "—"} <span className="sa-badge sa-bd-green" style={{ marginLeft: 6 }}>Active</span>
              </div>
              <div className="sa-ac-id">{a.id?.slice(0, 8)} · {a.email}</div>
            </div>
          </div>
          <div className="sa-ac-stats">
            <div className="sa-ac-stat"><div className="sa-ac-stat-lbl">Customers</div><div className="sa-ac-stat-val">{a.customers}</div></div>
            <div className="sa-ac-stat"><div className="sa-ac-stat-lbl">Portfolio</div><div className="sa-ac-stat-val" style={{ fontSize: 12 }}>{fmtMoney(a.portfolio)}</div></div>
            <div className="sa-ac-stat"><div className="sa-ac-stat-lbl">Email</div><div className="sa-ac-stat-val" style={{ fontSize: 10, color: "var(--muted)" }}>{a.email}</div></div>
            <div className="sa-ac-stat"><div className="sa-ac-stat-lbl">Status</div><div className="sa-ac-stat-val" style={{ fontSize: 11 }}>Active</div></div>
          </div>
          <div className="sa-ac-actions">
            <button className="sa-btn sa-btn-sm" onClick={() => setActiveTab("customers")}>View customers</button>
            <button className="sa-btn sa-btn-sm" onClick={() => setActiveTab("loans")}>View contracts</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomersPage({ customers, agents }: { customers: Customer[]; agents: Agent[] }) {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (c.full_name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.application_id || "").toLowerCase().includes(q);
      const matchesAgent = !agentFilter || c.agent_name === agentFilter;
      return matchesSearch && matchesAgent;
    });
  }, [customers, search, agentFilter]);

  const palette = [
    { bg: "var(--blue-lt)", color: "var(--blue)" },
    { bg: "var(--red-lt)", color: "var(--red)" },
    { bg: "var(--accent-lt)", color: "var(--accent)" },
    { bg: "var(--teal-lt)", color: "var(--teal)" },
    { bg: "var(--purple-lt)", color: "var(--purple)" },
  ];

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">All customers</div>
        <div className="sa-page-sub">Every borrower on the platform — search and filter</div>
      </div>

      <div className="sa-search-bar">
        <input className="sa-search-inp" placeholder="Search by name, email or reference…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="sa-filter-sel" value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
          <option value="">All agents</option>
          {agents.map((a) => <option key={a.id} value={a.full_name}>{a.full_name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="sa-card sa-empty">No customers match your filters.</div>
      ) : filtered.map((c, i) => {
        const color = palette[i % palette.length];
        const due = dueLabel(c.due_date, c.repayment_status);
        return (
          <div key={`${c.id}-${c.application_id || i}`} className="sa-person-card">
            <div className="sa-p-av" style={{ background: color.bg, color: color.color }}>
              {initials(c.full_name || c.email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sa-p-name">{c.full_name || "—"}</div>
              <div className="sa-p-sub">
                {c.application_id ? `${c.application_id.slice(0, 8)} · ${c.product || "—"} · ${fmtMoney(c.amount)}` : "No active loan"}
              </div>
              <div className="sa-p-sub" style={{ color: "var(--dim)" }}>
                Agent: {c.agent_name || "Unassigned"}
              </div>
            </div>
            <div style={{ textAlign: "right", marginRight: 10, flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Due {due.label}</div>
              <div style={{ marginTop: 3 }}>{statusBadge(c.repayment_status || c.status)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExtensionsPage({ extensions, queryClient }: { extensions: Extension[]; queryClient: QueryClient }) {
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/extensions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-extensions"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
  const declineMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/extensions/${id}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-extensions"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">Extension requests</div>
        <div className="sa-page-sub">Review and approve or decline customer payment extension requests</div>
      </div>

      <div className="sa-alert sa-al-amber">
        Approving an extension automatically pauses all payment reminders for the customer until the new due date.
      </div>

      {extensions.length === 0 ? (
        <div className="sa-card sa-empty">No pending extension requests. 🎉</div>
      ) : extensions.map((e) => (
        <div key={e.id} className="sa-ext-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                EXT-{e.id.slice(0, 8)} — {e.borrower_name || "Customer"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Application {e.application_id?.slice(0, 8)}
              </div>
            </div>
            <span className="sa-badge sa-bd-amber">Pending review</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div className="sa-sr"><span className="sa-sr-l">Requested new date</span><span className="sa-sr-r" style={{ color: "var(--amber)" }}>{fmtDate(e.new_date)}</span></div>
            <div className="sa-sr"><span className="sa-sr-l">Submitted</span><span className="sa-sr-r">{fmtDate(e.created_at)}</span></div>
          </div>

          <div style={{ background: "var(--bg)", borderRadius: "var(--r3)", padding: "12px 14px", fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12, border: "1px solid var(--border)" }}>
            "{e.reason || 'No reason provided'}"
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="sa-btn sa-btn-green"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate(e.id)}
            >
              ✓ Approve — pause notifications
            </button>
            <button
              className="sa-btn sa-btn-red"
              disabled={declineMutation.isPending}
              onClick={() => declineMutation.mutate(e.id)}
            >
              ✗ Decline request
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsPage({ auditLogs }: { auditLogs: AuditLog[] }) {
  const dotColor = (action: string | undefined): string => {
    if (action?.includes("APPROVED")) return "var(--green)";
    if (action?.includes("DECLINED")) return "var(--red)";
    if (action?.includes("REQUESTED")) return "var(--amber)";
    return "var(--blue)";
  };

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">System notifications</div>
        <div className="sa-page-sub">Audit log — every administrative action across the platform</div>
      </div>

      <div className="sa-card">
        <div className="sa-card-hdr">
          <div className="sa-card-title">Audit feed</div>
        </div>
        {auditLogs.length === 0 ? (
          <div className="sa-empty">No system events recorded yet.</div>
        ) : auditLogs.map((log) => (
          <div key={log.id} className="sa-notif-row">
            <div className="sa-ndot" style={{ background: dotColor(log.action) }} />
            <div style={{ flex: 1 }}>
              <div className="sa-ntitle">{log.action?.replace(/_/g, " ")}</div>
              <div className="sa-ndesc">
                Actor: {log.actor_id?.slice(0, 8) || "system"}
                {log.entity && <> · Entity: <code style={{ fontSize: 11 }}>{log.entity?.slice(0, 8)}</code></>}
              </div>
              <div className="sa-ntime">{new Date(log.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GlobalToggles {
  "48hr": boolean;
  "24hr": boolean;
  overdue: boolean;
  email: boolean;
  whatsapp: boolean;
  agentCopy: boolean;
  autoPause: boolean;
}

function SettingsPage({ applications }: { applications: Application[] }) {
  const queryClient = useQueryClient();
  const [globalToggles, setGlobalToggles] = useState<GlobalToggles>({
    "48hr": true, "24hr": true, overdue: true, email: true, whatsapp: true, agentCopy: true, autoPause: true,
  });
  const [perLoanState, setPerLoanState] = useState<Record<string, boolean>>({});

  const controlMutation = useMutation({
    mutationFn: (payload: { application_id: string; paused: boolean }) =>
      api.post("/admin/notifications/control", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-applications"] }),
  });

  const togglePerLoan = (appId: string, currentlyOn: boolean) => {
    const newOn = !currentlyOn;
    setPerLoanState((s) => ({ ...s, [appId]: newOn }));
    controlMutation.mutate({ application_id: appId, paused: !newOn });
  };

  const globalRules: { key: keyof GlobalToggles; label: string; sub: string }[] = [
    { key: "48hr", label: "48-hour payment reminder", sub: "Email + in-app sent to customer, agent and sponsor 48hrs before due date" },
    { key: "24hr", label: "24-hour payment reminder", sub: "Final reminder to all parties 24hrs before due date" },
    { key: "overdue", label: "Overdue payment alert", sub: "Triggered when payment passes due date without settlement" },
    { key: "email", label: "Email delivery", sub: "Send all alerts via email to all registered party addresses" },
    { key: "whatsapp", label: "WhatsApp delivery", sub: "Send alerts via WhatsApp to customer and sponsor numbers" },
    { key: "agentCopy", label: "Agent copy on all alerts", sub: "Agent receives a copy of every alert sent to their customers" },
    { key: "autoPause", label: "Auto-pause on extension approval", sub: "When admin approves an extension, automatically pause reminders" },
  ];

  return (
    <div className="sa-page">
      <div className="sa-page-hdr">
        <div className="sa-page-title">Notification settings</div>
        <div className="sa-page-sub">Control how and when payment alerts are delivered system-wide</div>
      </div>

      <div className="sa-card">
        <div className="sa-card-hdr">
          <div>
            <div className="sa-card-title">Global notification rules</div>
            <div className="sa-card-sub" style={{ marginBottom: 0 }}>Applied to all loans unless overridden below (frontend toggle, persisted client-side)</div>
          </div>
        </div>
        {globalRules.map((r) => (
          <div key={r.key} className="sa-sw-wrap">
            <div>
              <div className="sa-sw-label">{r.label}</div>
              <div className="sa-sw-sub">{r.sub}</div>
            </div>
            <button
              className={`sa-sw ${globalToggles[r.key] ? "on" : "off"}`}
              onClick={() => setGlobalToggles((g) => ({ ...g, [r.key]: !g[r.key] }))}
            >
              <div className="sa-sw-k" />
            </button>
          </div>
        ))}
      </div>

      <div className="sa-card">
        <div className="sa-card-hdr">
          <div>
            <div className="sa-card-title">Per-loan notification overrides</div>
            <div className="sa-card-sub" style={{ marginBottom: 0 }}>Pause or resume notifications for individual loans (persisted to backend)</div>
          </div>
        </div>
        {applications.length === 0 ? (
          <div className="sa-empty">No applications yet.</div>
        ) : applications.map((a) => {
          const isOn = perLoanState[a.id] ?? true;
          return (
            <div key={a.id} className="sa-sw-wrap">
              <div>
                <div className="sa-sw-label">{a.id.slice(0, 8)} — {a.borrower_name || "Customer"}</div>
                <div className="sa-sw-sub">{a.product || "—"} · {fmtMoney(a.amount)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{isOn ? "Notifications on" : "Paused"}</span>
                <button
                  className={`sa-sw ${isOn ? "on" : "off"}`}
                  onClick={() => togglePerLoan(a.id, isOn)}
                  disabled={controlMutation.isPending}
                >
                  <div className="sa-sw-k" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
