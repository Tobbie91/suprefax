export type UserRole = "borrower" | "agent" | "admin";

export type KycStatus = "pending" | "verified" | "rejected" | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  kyc_status?: KycStatus;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ApplicationStatus =
  | "pending"
  | "active"
  | "approved"
  | "declined"
  | "signed"
  | "awaiting_approval";

export interface Application {
  id: string;
  borrower_id: string;
  agent_id: string;
  product: string;
  amount: string | number;
  status: ApplicationStatus | string;
  admin_approved: boolean;
  created_at: string;
  borrower_name?: string;
  agent_name?: string;
  due_date?: string;
  repayment_status?: string;
  repayment_amount?: string | number;
}

export interface AgentApplication {
  application_id: string;
  borrower_name: string;
  product: string;
  amount: string | number;
  due_date?: string;
  status: string;
}

export type RepaymentStatus = "due" | "overdue" | "paid";

export interface Repayment {
  id: string;
  application_id: string;
  due_date: string;
  amount: string | number;
  status: RepaymentStatus | string;
  borrower_name?: string;
}

export type ExtensionStatus = "pending" | "approved" | "declined";

export interface Extension {
  id: string;
  application_id: string;
  new_date: string;
  reason: string;
  status: ExtensionStatus;
  created_at: string;
  borrower_name?: string;
}

export interface Signature {
  id: string;
  application_id: string;
  party: string;
  signed: boolean;
  signed_at?: string;
}

export type NotificationType = "48hr" | "24hr" | "overdue" | "approval" | string;

export interface Notification {
  id?: string;
  user_id?: string;
  application_id?: string;
  message: string;
  type?: NotificationType;
  channel?: string;
  paused?: boolean;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  created_at: string;
}

export interface Analytics {
  total_loans: number;
  active: number;
  overdue: number;
  default_rate: number;
}

export interface Agent {
  id: string;
  email: string;
  full_name: string;
  customers: string | number;
  portfolio: string | number;
}

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
  kyc_status?: KycStatus;
  kyc_address?: string | null;
  kyc_nin?: string | null;
  kyc_bvn?: string | null;
  kyc_verified_at?: string | null;
  kyc_rejection_reason?: string | null;
  application_id?: string;
  product?: string;
  amount?: string | number;
  status?: string;
  due_date?: string;
  repayment_status?: string;
  agent_name?: string;
}

export interface DocumentInfo {
  status: "available" | "locked";
  url?: string;
  reason?: string;
}

export interface ChatMessage {
  roomId?: string;
  senderId: string;
  text: string;
}
