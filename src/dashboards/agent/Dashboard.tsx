import { useState, useMemo, useEffect, useRef, ReactNode } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../api/client";
import useStore from "../../store/useStore";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { useSignOut } from "../../hooks/useSignOut";
import { getSocket, initSocket } from "../../socket";
import type {
  AgentApplication,
  ApplicationDocument,
  LoanBaseline,
  Repayment,
  Notification,
  ChatMessage,
} from "../../types/api";
import "./Agent.css";

type TabKey = "home" | "quotes" | "customers" | "msgs" | "notifs";
type BadgeKey = "msgs" | "notifs" | "quotes";

interface TabDef {
  key: TabKey;
  label: string;
  badgeKey?: BadgeKey;
}

const TABS: TabDef[] = [
  { key: "home", label: "Dashboard" },
  { key: "quotes", label: "Awaiting quote", badgeKey: "quotes" },
  { key: "customers", label: "My customers" },
  { key: "msgs", label: "Messages", badgeKey: "msgs" },
  { key: "notifs", label: "Notifications", badgeKey: "notifs" },
];

interface SidebarItem {
  key: TabKey;
  label: string;
  icon: ReactNode;
  badgeKey?: BadgeKey;
  badgeClass?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "home", label: "Dashboard", icon: <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /> },
  { key: "quotes", label: "Awaiting quote", badgeKey: "quotes", badgeClass: "sg-b-amber", icon: <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /> },
  { key: "customers", label: "My customers", icon: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM4.5 16a4.5 4.5 0 019 0H4.5zM14 16h5.5a4.5 4.5 0 00-9 0H14z" /> },
  { key: "msgs", label: "Messages", badgeKey: "msgs", badgeClass: "sg-b-red", icon: <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" /> },
  { key: "notifs", label: "Notifications", badgeKey: "notifs", badgeClass: "sg-b-red", icon: <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /> },
];

const PALETTE = [
  { bg: "var(--blue-lt)", color: "var(--blue)" },
  { bg: "var(--red-lt)", color: "var(--red)" },
  { bg: "var(--accent-lt)", color: "var(--accent)" },
  { bg: "#E0FDF4", color: "var(--teal)" },
  { bg: "var(--amber-lt)", color: "var(--amber)" },
];

interface CustomerView {
  name: string;
  application_id: string;
  product: string;
  amount: string | number;
  due_date?: string;
  status: string;
}

const initials = (name = ""): string =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";

const fmtMoney = (n: string | number | null | undefined): string =>
  n == null ? "—" : `₦${Number(n).toLocaleString()}`;

const fmtDate = (d: string | null | undefined): string =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

interface DueResult {
  label: string;
  cls: string;
  days: number | null;
}

const dueInfo = (dueDate: string | undefined, status: string | undefined): DueResult => {
  if (status === "overdue") return { label: "Overdue", cls: "sg-t-over", days: -1 };
  if (!dueDate) return { label: "—", cls: "", days: null };
  const now = new Date();
  const due = new Date(dueDate);
  const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, cls: "sg-t-over", days };
  if (days <= 2) return { label: `Due in ${days}d`, cls: "sg-t-due", days };
  return { label: fmtDate(dueDate), cls: "", days };
};

const statusBadge = (status: string | undefined, days: number | null): ReactNode => {
  const map: Record<string, { cls: string; label: string }> = {
    overdue: { cls: "sg-bd-red", label: "Overdue" },
    due: { cls: "sg-bd-amber", label: days != null && days <= 2 ? `Due in ${days}d` : "Due soon" },
    paid: { cls: "sg-bd-green", label: "Paid" },
    pending: { cls: "sg-bd-gray", label: "Pending" },
    active: { cls: "sg-bd-blue", label: "Active" },
  };
  const m = map[status || ""] || { cls: "sg-bd-gray", label: status || "—" };
  return <span className={`sg-badge ${m.cls}`}>{m.label}</span>;
};

const Icon = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 20 20">{children}</svg>;

type ChatHistory = Record<string, ChatMessage[]>;

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});

  const user = useStore((s) => s.user);
  const handleSignOut = useSignOut();
  useRealtimeNotifications();

  useEffect(() => {
    if (user?.id && !getSocket()) initSocket(user.id);
  }, [user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg: ChatMessage) => {
      setChatHistory((h) => {
        const room = msg.roomId || activeContact;
        if (!room) return h;
        return { ...h, [room]: [...(h[room] || []), msg] };
      });
    };
    socket.on("message", handler);
    return () => { socket.off("message", handler); };
  }, [activeContact]);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const queryClient = useQueryClient();
  const { data: applications = [] } = useQuery<AgentApplication[]>({
    queryKey: ["agent-applications"],
    queryFn: () => api.get("/agent/applications").then((r) => r.data),
  });

  const { data: baselines = [] } = useQuery<LoanBaseline[]>({
    queryKey: ["loan-baselines"],
    queryFn: () => api.get("/loan-baselines").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const awaitingQuote = applications.filter((a) => a.status === "awaiting_quote");

  const { data: repayments = [] } = useQuery<Repayment[]>({
    queryKey: ["agent-repayments"],
    queryFn: () => api.get("/agent/repayments").then((r) => r.data),
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["agent-notifications"],
    queryFn: () => api.get("/notifications?role=agent").then((r) => r.data),
  });

  const customers: CustomerView[] = useMemo(() => {
    const map = new Map<string, CustomerView>();
    applications.forEach((a) => {
      if (!map.has(a.borrower_name)) {
        map.set(a.borrower_name, {
          name: a.borrower_name,
          application_id: a.application_id,
          product: a.product,
          amount: a.amount,
          due_date: a.due_date,
          status: a.status,
        });
      }
    });
    return Array.from(map.values());
  }, [applications]);

  const overdueCount = repayments.filter((r) => r.status === "overdue").length;
  const dueWeekTotal = repayments
    .filter((r) => {
      if (!r.due_date) return false;
      const days = Math.ceil((new Date(r.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7 && r.status !== "paid";
    })
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const portfolio = repayments
    .filter((r) => r.status !== "paid")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const overdueCustomer = repayments.find((r) => r.status === "overdue");

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  })();

  const badgeCounts: Record<BadgeKey, number> = {
    msgs: 0,
    notifs: notifications.length,
    quotes: awaitingQuote.length,
  };

  return (
    <div className="suprefax-agent">
      <div className="sg-sign-bar">
        <span className="sg-sb-logo">Suprefax</span>
        <div className="sg-sb-sep" />
        <span className="sg-sb-portal">Agent portal</span>
        <span>Secure session · Agent access only</span>
        <div className="sg-sb-right">
          <span className="sg-sb-date">{today}</span>
          <button className="sg-sb-back" onClick={handleSignOut}>← Sign out</button>
        </div>
      </div>

      <div className="sg-topbar">
        <div className="sg-tb-brand">
          <div className="sg-tb-mark">
            <svg viewBox="0 0 16 16"><path d="M2 2h4v12H2V2zm8 0h4v12h-4V2zm-4 4h4v4H6V6z" /></svg>
          </div>
          <div>
            <div className="sg-tb-name">Suprefax</div>
            <div className="sg-tb-tag">Agent portal</div>
          </div>
        </div>
        <nav className="sg-tb-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`sg-tab ${activeTab === t.key ? "on" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.badgeKey && badgeCounts[t.badgeKey] > 0 && (
                <span className="sg-nb">{badgeCounts[t.badgeKey]}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sg-tb-right">
          <button className="sg-tb-notif" onClick={() => setActiveTab("notifs")}>
            <svg viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            {notifications.length > 0 && <div className="sg-tb-pip" />}
          </button>
          <div className="sg-tb-av">{initials(user?.name || user?.email)}</div>
          <div>
            <div className="sg-tb-uname">{user?.name || "Agent"}</div>
            <div className="sg-tb-urole">Agent · {user?.id?.slice(0, 8) || ""}</div>
          </div>
          <button className="sg-signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="sg-layout">
        <div className="sg-sidebar">
          <div className="sg-sb-sec">
            <div className="sg-sb-lbl">Agent</div>
            {SIDEBAR_ITEMS.map((it) => (
              <button
                key={it.key}
                className={`sg-sb-item ${activeTab === it.key ? "on" : ""}`}
                onClick={() => setActiveTab(it.key)}
              >
                <Icon>{it.icon}</Icon>
                {it.label}
                {it.badgeKey && badgeCounts[it.badgeKey] > 0 && (
                  <span className={`sg-sb-badge ${it.badgeClass}`}>{badgeCounts[it.badgeKey]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="sg-sb-divider" />
          <div className="sg-sb-footer">
            <div className="sg-sb-user">
              <div className="sg-sb-u-av">{initials(user?.name || user?.email)}</div>
              <div>
                <div className="sg-sb-u-name">{user?.name || "Agent"}</div>
                <div className="sg-sb-u-role">Agent</div>
                <div className="sg-sb-agent-id">{user?.id?.slice(0, 12)}…</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sg-main">
          {activeTab === "home" && (
            <HomePage
              greeting={greeting}
              firstName={(user?.name || user?.email || "").split(" ")[0] || "Agent"}
              applications={applications}
              repayments={repayments}
              customers={customers}
              overdueCustomer={overdueCustomer}
              overdueCount={overdueCount}
              dueWeekTotal={dueWeekTotal}
              portfolio={portfolio}
              setActiveTab={setActiveTab}
              setActiveContact={setActiveContact}
            />
          )}
          {activeTab === "quotes" && (
            <QuotesPage
              applications={awaitingQuote}
              baselines={baselines}
              queryClient={queryClient}
            />
          )}
          {activeTab === "customers" && (
            <CustomersPage
              customers={customers}
              setActiveTab={setActiveTab}
              setActiveContact={setActiveContact}
            />
          )}
          {activeTab === "msgs" && (
            <MessagesPage
              customers={customers}
              activeContact={activeContact}
              setActiveContact={setActiveContact}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              currentUserId={user?.id || ""}
            />
          )}
          {activeTab === "notifs" && <NotificationsPage notifications={notifications} setActiveTab={setActiveTab} />}
        </div>
      </div>
    </div>
  );
}

interface HomePageProps {
  greeting: string;
  firstName: string;
  applications: AgentApplication[];
  repayments: Repayment[];
  customers: CustomerView[];
  overdueCustomer: Repayment | undefined;
  overdueCount: number;
  dueWeekTotal: number;
  portfolio: number;
  setActiveTab: (t: TabKey) => void;
  setActiveContact: (c: string | null) => void;
}

function HomePage({
  greeting, firstName, applications, repayments, customers,
  overdueCustomer, overdueCount, dueWeekTotal, portfolio,
  setActiveTab, setActiveContact,
}: HomePageProps) {
  return (
    <div className="sg-page">
      <div className="sg-page-hdr">
        <div className="sg-page-title">{greeting}, {firstName}</div>
        <div className="sg-page-sub">Agent dashboard · {customers.length} assigned customer{customers.length !== 1 && "s"}</div>
      </div>

      <div className="sg-stat-grid sg-s4">
        <div className="sg-stat">
          <div className="sg-s-lbl">My customers</div>
          <div className="sg-s-val">{customers.length}</div>
          <div className="sg-s-sub">{applications.filter((a) => a.status === "active").length} active loans</div>
        </div>
        <div className="sg-stat">
          <div className="sg-s-lbl">Portfolio value</div>
          <div className="sg-s-val" style={{ fontSize: 16 }}>{fmtMoney(portfolio)}</div>
          <div className="sg-s-sub">Outstanding</div>
        </div>
        <div className="sg-stat">
          <div className="sg-s-lbl">Due this week</div>
          <div className="sg-s-val" style={{ fontSize: 16, color: "var(--amber)" }}>{fmtMoney(dueWeekTotal)}</div>
          <div className="sg-s-sub">{repayments.filter((r) => r.status !== "paid" && r.due_date && Math.ceil((new Date(r.due_date).getTime() - new Date().getTime()) / 86400000) <= 7).length} customers</div>
        </div>
        <div className="sg-stat">
          <div className="sg-s-lbl">Overdue</div>
          <div className="sg-s-val" style={{ fontSize: 16, color: "var(--red)" }}>{overdueCount}</div>
          <div className="sg-s-sub">{overdueCount > 0 ? "Action needed" : "All clear"}</div>
        </div>
      </div>

      {overdueCustomer && (
        <div className="sg-alert sg-al-red">
          ⚠ {overdueCustomer.borrower_name || "A customer"} is overdue — {fmtMoney(overdueCustomer.amount)}. Contact immediately.
        </div>
      )}

      <div className="sg-card">
        <div className="sg-card-hdr">
          <div>
            <div className="sg-card-title">Repayment tracker</div>
            <div className="sg-card-sub" style={{ marginBottom: 0 }}>Your customers — contract, amount and due date</div>
          </div>
          <button className="sg-btn sg-btn-sm sg-btn-accent" onClick={() => setActiveTab("customers")}>View all customers →</button>
        </div>

        {applications.length === 0 ? (
          <div className="sg-empty">No assigned applications yet.</div>
        ) : (
          <div className="sg-tbl-wrap">
            <table className="sg-tbl">
              <thead>
                <tr>
                  <th>Customer</th><th>Reference</th><th>Product</th><th>Amount</th><th>Due date</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => {
                  const due = dueInfo(a.due_date, a.status);
                  return (
                    <tr key={a.application_id}>
                      <td>{a.borrower_name || "—"}</td>
                      <td style={{ color: "var(--muted)", fontSize: 11 }}>{a.application_id?.slice(0, 8)}…</td>
                      <td>{a.product || "—"}</td>
                      <td>{fmtMoney(a.amount)}</td>
                      <td className={due.cls}>{due.label}</td>
                      <td>{statusBadge(a.status, due.days)}</td>
                      <td>
                        <button
                          className={`sg-btn sg-btn-sm ${a.status === "overdue" ? "sg-btn-red" : ""}`}
                          onClick={() => { setActiveContact(a.borrower_name); setActiveTab("msgs"); }}
                        >
                          {a.status === "overdue" ? "Urgent" : "Message"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface CustomersPageProps {
  customers: CustomerView[];
  setActiveTab: (t: TabKey) => void;
  setActiveContact: (c: string | null) => void;
}

function CustomersPage({ customers, setActiveTab, setActiveContact }: CustomersPageProps) {
  return (
    <div className="sg-page">
      <div className="sg-page-hdr">
        <div className="sg-page-title">My customers</div>
        <div className="sg-page-sub">All borrowers assigned to you</div>
      </div>

      {customers.length === 0 ? (
        <div className="sg-card sg-empty">No customers assigned yet.</div>
      ) : customers.map((c, i) => {
        const palette = PALETTE[i % PALETTE.length];
        const due = dueInfo(c.due_date, c.status);
        return (
          <div
            key={c.application_id || i}
            className="sg-person-card"
            onClick={() => { setActiveContact(c.name); setActiveTab("msgs"); }}
          >
            <div className="sg-person-av" style={{ background: palette.bg, color: palette.color }}>
              {initials(c.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sg-person-name">{c.name}</div>
              <div className="sg-person-sub">
                {c.application_id?.slice(0, 8)} · {c.product} · {fmtMoney(c.amount)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginRight: 10 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{due.label}</div>
            </div>
            {statusBadge(c.status, due.days)}
            <button
              className="sg-btn sg-btn-sm"
              style={{ marginLeft: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveContact(c.name);
                setActiveTab("msgs");
              }}
            >
              Message
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface MessagesPageProps {
  customers: CustomerView[];
  activeContact: string | null;
  setActiveContact: (c: string | null) => void;
  chatHistory: ChatHistory;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
  currentUserId: string;
}

function MessagesPage({ customers, activeContact, setActiveContact, chatHistory, setChatHistory, currentUserId }: MessagesPageProps) {
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const active = activeContact ? customers.find((c) => c.name === activeContact) : customers[0];
  const roomId = active ? `chat-${active.application_id}` : null;
  const messages = (roomId && chatHistory[roomId]) || [];

  useEffect(() => {
    if (!roomId) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("joinRoom", { roomId });
  }, [roomId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    if (!input.trim() || !roomId) return;
    const socket = getSocket();
    if (!socket) return;
    const msg: ChatMessage = { roomId, senderId: currentUserId, text: input };
    socket.emit("sendMessage", msg);
    setChatHistory((h) => ({ ...h, [roomId]: [...(h[roomId] || []), msg] }));
    setInput("");
  };

  return (
    <div className="sg-page">
      <div className="sg-page-hdr">
        <div className="sg-page-title">Messages</div>
        <div className="sg-page-sub">In-app chat with your customers</div>
      </div>

      {customers.length === 0 ? (
        <div className="sg-card sg-empty">You have no customers to message yet.</div>
      ) : (
        <div className="sg-chat-wrap">
          <div className="sg-clp">
            <div className="sg-clp-hdr">Customers</div>
            {customers.map((c, i) => {
              const isActive = active?.name === c.name;
              return (
                <div
                  key={c.application_id || i}
                  className={`sg-cl-item ${isActive ? "on" : ""}`}
                  onClick={() => setActiveContact(c.name)}
                >
                  <div className="sg-cli-name">{c.name}</div>
                  <div className="sg-cli-prev">{c.product || "—"}</div>
                  <div className="sg-cli-time">{fmtMoney(c.amount)}</div>
                </div>
              );
            })}
          </div>

          <div className="sg-chat-main-p">
            {!active ? (
              <div className="sg-chat-empty">Select a customer to start chatting</div>
            ) : (
              <>
                <div className="sg-chat-hdr">
                  <div className="sg-chat-av" style={{ background: PALETTE[0].bg, color: PALETTE[0].color }}>
                    {initials(active.name)}
                  </div>
                  <div>
                    <div className="sg-chat-uname">{active.name}</div>
                    <div className="sg-chat-urole">Borrower · {active.application_id?.slice(0, 8)}</div>
                  </div>
                  <div className="sg-chat-online" />
                </div>
                <div className="sg-chat-body" ref={bodyRef}>
                  <div className="sg-msg-sys">Today</div>
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 40 }}>
                      No messages yet. Send the first one below.
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`sg-msg ${m.senderId === currentUserId ? "mine" : "theirs"}`}>
                      <div className="sg-msg-b">{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="sg-chat-input-row">
                  <input
                    className="sg-chat-inp"
                    placeholder={`Reply to ${active.name.split(" ")[0]}…`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                  />
                  <button className="sg-chat-send" onClick={send}>
                    <svg viewBox="0 0 16 16"><path d="M1 1l14 7-14 7V9.5l10-1.5-10-1.5V1z" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NotifPageProps {
  notifications: Notification[];
  setActiveTab: (t: TabKey) => void;
}

function NotificationsPage({ notifications, setActiveTab }: NotifPageProps) {
  const dotColor = (type: string | undefined): string => {
    if (type === "overdue") return "var(--red)";
    if (type === "24hr") return "var(--red)";
    if (type === "48hr") return "var(--amber)";
    if (type === "approval") return "var(--green)";
    return "var(--blue)";
  };

  return (
    <div className="sg-page">
      <div className="sg-page-hdr">
        <div className="sg-page-title">Notifications</div>
        <div className="sg-page-sub">Payment alerts and updates for your customer portfolio</div>
      </div>

      <div className="sg-card">
        <div className="sg-card-hdr">
          <div className="sg-card-title">All notifications</div>
        </div>
        {notifications.length === 0 ? (
          <div className="sg-empty">No notifications right now.</div>
        ) : notifications.map((n, i) => (
          <div key={n.id || i} className="sg-notif-row">
            <div className="sg-ndot" style={{ background: dotColor(n.type) }} />
            <div style={{ flex: 1 }}>
              <div className="sg-ntitle">{n.message}</div>
              <div className="sg-ndesc">
                {n.type ? `Type: ${n.type}` : ""} {n.channel ? `· Channel: ${n.channel}` : ""}
              </div>
              <div className="sg-ntime">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
              <div className="sg-nacts">
                <button className="sg-btn sg-btn-sm" onClick={() => setActiveTab("msgs")}>Message customer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuotesPageProps {
  applications: AgentApplication[];
  baselines: LoanBaseline[];
  queryClient: ReturnType<typeof useQueryClient>;
}

function QuotesPage({ applications, baselines, queryClient }: QuotesPageProps) {
  if (applications.length === 0) {
    return (
      <div className="sg-page">
        <div className="sg-page-hdr">
          <div className="sg-page-title">Awaiting your quote</div>
          <div className="sg-page-sub">Applications waiting for you to set an interest rate</div>
        </div>
        <div className="sg-card sg-empty">No applications are waiting for your quote.</div>
      </div>
    );
  }
  return (
    <div className="sg-page">
      <div className="sg-page-hdr">
        <div className="sg-page-title">Awaiting your quote</div>
        <div className="sg-page-sub">{applications.length} application{applications.length !== 1 && "s"} waiting</div>
      </div>
      {applications.map((a) => (
        <QuoteCard key={a.application_id} app={a} baselines={baselines} queryClient={queryClient} />
      ))}
    </div>
  );
}

function QuoteCard({ app, baselines, queryClient }: { app: AgentApplication; baselines: LoanBaseline[]; queryClient: ReturnType<typeof useQueryClient> }) {
  const [rate, setRate] = useState("");
  const [days, setDays] = useState<number>(app.duration_days || 30);
  const [error, setError] = useState<string | null>(null);

  const { data: docs = [] } = useQuery<ApplicationDocument[]>({
    queryKey: ["app-documents", app.application_id],
    queryFn: () => api.get(`/applications/${app.application_id}/documents`).then((r) => r.data),
  });

  const baseline = baselines.find((b) => b.product_key === app.product && b.duration_days === days);
  const principal = Number(app.amount || 0);
  const months = days / 30;
  const preview = rate ? principal * (1 + (Number(rate) / 100) * months) : null;

  const quoteMutation = useMutation({
    mutationFn: () =>
      api.post(`/agent/applications/${app.application_id}/quote`, {
        interest_rate_monthly_pct: Number(rate),
        duration_days: days,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-applications"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Could not send quote.");
    },
  });

  const submit = () => {
    setError(null);
    const r = Number(rate);
    if (!Number.isFinite(r) || r <= 0) { setError("Enter a positive interest rate."); return; }
    if (baseline && r < baseline.baseline_monthly_rate_pct) {
      setError(`Rate must be at or above the baseline (${baseline.baseline_monthly_rate_pct}%).`);
      return;
    }
    quoteMutation.mutate();
  };

  return (
    <div className="sg-card" style={{ marginBottom: 16 }}>
      <div className="sg-card-hdr">
        <div>
          <div className="sg-card-title">{app.borrower_name} — {app.product}</div>
          <div className="sg-card-sub">{fmtMoney(app.amount)} · {app.purpose}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Detail label="Email" value={app.borrower_email} />
        <Detail label="Passport" value={app.int_passport_no} />
        <Detail label="Address" value={app.borrower_address} />
        <Detail label="Bank" value={app.bank_name ? `${app.bank_name} · ${app.bank_account_number} · ${app.bank_account_name}` : "—"} />
        <Detail label="Next of kin" value={app.nok_name ? `${app.nok_name} (${app.nok_relationship}) · ${app.nok_phone}` : "—"} />
        <Detail label="NOK address" value={app.nok_address} />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Documents ({docs.length})</div>
        {docs.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--dim)" }}>None uploaded.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {docs.map((d) => (
              <a key={d.id} href={d.cloudinary_url} target="_blank" rel="noreferrer" className="sg-btn sg-btn-sm" style={{ textDecoration: "none" }}>
                {d.doc_type.replace(/_/g, " ")} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {error && <div className="sg-alert sg-al-red" style={{ marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Duration</label>
          <select style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "var(--white)" }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>
            Monthly rate (%) {baseline ? `· baseline ${baseline.baseline_monthly_rate_pct}%` : ""}
          </label>
          <input style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, fontFamily: "inherit", background: "var(--white)" }} type="number" min="0" step="0.1" placeholder="e.g. 10" value={rate} onChange={(e) => setRate(e.target.value)} />
        </div>
        <button className="sg-btn sg-btn-accent" onClick={submit} disabled={quoteMutation.isPending}>
          {quoteMutation.isPending ? "Sending…" : "Send quote"}
        </button>
      </div>
      {preview !== null && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Borrower will see total repayable: <strong style={{ color: "var(--amber)" }}>{fmtMoney(Math.round(preview))}</strong>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--ink)" }}>{value || "—"}</div>
    </div>
  );
}
