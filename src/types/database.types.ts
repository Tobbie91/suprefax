/**
 * Database Types - Mirrors Supabase PostgreSQL Schema
 */

// User roles
export type UserRole = 'client' | 'admin' | 'super_admin';

// KYC status
export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

// Application status workflow
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed';

// Document status workflow
export type DocumentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'released';

// Service categories
export type ServiceCategory =
  | 'visa_pof'
  | 'lpo_financing'
  | 'working_capital'
  | 'business_migration'
  | 'cac_registration'
  | 'loan_agreements'
  | 'declarations'
  | 'consultancy';

// Notification types
export type NotificationType =
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'document_ready'
  | 'document_approved'
  | 'action_required'
  | 'system_message';

// Profile table
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;

  // Company Information
  company_name: string | null;
  company_registration_number: string | null;
  company_address: string | null;
  company_country: string | null;

  // KYC Information
  kyc_status: KYCStatus;
  kyc_submitted_at: string | null;
  kyc_verified_at: string | null;
  kyc_documents: unknown[];

  // Metadata
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Service table
export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: ServiceCategory;

  // Pricing
  base_price: number | null;
  currency: string;

  // Configuration
  is_active: boolean;
  requires_kyc: boolean;
  estimated_processing_days: number | null;

  // Form Configuration (JSON Schema)
  form_schema: Record<string, unknown>;

  // Document Templates
  template_ids: string[];

  // Metadata
  display_order: number;
  icon: string | null;
  features: string[];
  requirements: string[];

  created_at: string;
  updated_at: string;
}

// Document Template table
export interface DocumentTemplate {
  id: string;
  service_id: string | null;

  name: string;
  description: string | null;
  version: number;
  is_active: boolean;

  // Template Configuration
  template_type: 'html' | 'markdown' | 'docx';
  template_content: string;

  // Variable Mapping
  variables: TemplateVariable[];

  // Conditional Clauses
  conditional_clauses: ConditionalClause[];

  // Output Configuration
  output_format: 'pdf' | 'docx';
  page_settings: PageSettings;

  // Storage
  storage_path: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface TemplateVariable {
  key: string;
  label: string;
  source: string; // Form field path
  format?: string; // Formatting type
}

export interface ConditionalClause {
  condition: string;
  include_clause: string;
}

export interface PageSettings {
  size: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Application table
export interface Application {
  id: string;
  reference_number: string;

  user_id: string;
  service_id: string;

  // Status Tracking
  status: ApplicationStatus;
  status_history: StatusHistoryEntry[];

  // Form Data
  form_data: Record<string, unknown>;
  form_step: number;
  is_form_complete: boolean;

  // File Attachments
  attachments: Attachment[];

  // Assignment
  assigned_admin_id: string | null;

  // Pricing
  quoted_price: number | null;
  final_price: number | null;
  currency: string;

  // Timestamps
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  completed_at: string | null;

  // Notes
  admin_notes: string | null;
  client_notes: string | null;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  // Relations (optional, for joins)
  user?: Profile;
  service?: Service;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

export interface Attachment {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  uploaded_at: string;
}

// Document table (generated documents)
export interface Document {
  id: string;

  application_id: string;
  template_id: string | null;

  // Document Info
  name: string;
  description: string | null;
  document_type: string;
  version: number;

  // Status
  status: DocumentStatus;

  // Content
  rendered_content: string | null;
  variable_values: Record<string, unknown>;

  // Storage
  storage_bucket: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string;

  // Access Control
  download_token: string | null;
  download_count: number;
  max_downloads: number | null;
  expires_at: string | null;

  // Approval Tracking
  approved_by: string | null;
  approved_at: string | null;
  released_by: string | null;
  released_at: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;

  // Relations (optional, for joins)
  application?: Application;
  template?: DocumentTemplate;
}

// Approval table (audit trail)
export interface Approval {
  id: string;

  // Polymorphic reference
  entity_type: 'application' | 'document';
  entity_id: string;

  // Action
  action: 'submitted' | 'approved' | 'rejected' | 'released' | 'revised';
  from_status: string | null;
  to_status: string | null;

  // Actor
  performed_by: string;

  // Details
  comments: string | null;
  metadata: Record<string, unknown>;

  created_at: string;

  // Relations (optional, for joins)
  performer?: Profile;
}

// Notification table
export interface Notification {
  id: string;

  user_id: string;

  type: NotificationType;
  title: string;
  message: string;

  // Related Entity
  entity_type: 'application' | 'document' | null;
  entity_id: string | null;

  // Status
  is_read: boolean;
  read_at: string | null;

  // Action
  action_url: string | null;
  action_label: string | null;

  // Metadata
  metadata: Record<string, unknown>;

  created_at: string;
}

// Audit Log table
export interface AuditLog {
  id: string;

  user_id: string | null;

  // Action Details
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  entity_type: string;
  entity_id: string | null;

  // Change Tracking
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;

  // Context
  ip_address: string | null;
  user_agent: string | null;

  created_at: string;
}

// Database schema type (for Supabase client)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at'>>;
      };
      document_templates: {
        Row: DocumentTemplate;
        Insert: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DocumentTemplate, 'id' | 'created_at'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'reference_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Application, 'id' | 'reference_number' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      approvals: {
        Row: Approval;
        Insert: Omit<Approval, 'id' | 'created_at'>;
        Update: never; // Approvals are immutable
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Pick<Notification, 'is_read' | 'read_at'>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never; // Audit logs are immutable
      };
    };
    Enums: {
      user_role: UserRole;
      kyc_status: KYCStatus;
      application_status: ApplicationStatus;
      document_status: DocumentStatus;
      service_category: ServiceCategory;
      notification_type: NotificationType;
    };
  };
}
