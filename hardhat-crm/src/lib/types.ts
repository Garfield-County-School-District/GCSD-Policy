// Hand-written types mirroring the SQL schema. Once a Supabase project exists
// you can regenerate these with `generate_typescript_types` / the Supabase CLI.

export type Language = 'en' | 'es'
export type CompanyStatus = 'prospect' | 'active_client' | 'churned'
export type LeadSource = 'referral' | 'web' | 'partner' | 'social' | 'other'
export type DealStage =
  | 'new_lead'
  | 'discovery_call'
  | 'financial_inspection'
  | 'proposal_sent'
  | 'won'
  | 'lost'
export type ServiceType =
  | 'financial_inspection'
  | 'restructure_90day'
  | 'cleanup'
  | 'ongoing_bookkeeping'
  | 'profit_strategy'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note'
export type TaskStatus = 'open' | 'done'

export interface Company {
  id: string
  name: string
  trade: string | null
  status: CompanyStatus
  lead_source: LeadSource | null
  preferred_language: Language | null
  phone: string | null
  website: string | null
  address: string | null
  accounting_software: string | null
  annual_revenue: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string | null
  first_name: string
  last_name: string | null
  title: string | null
  email: string | null
  phone: string | null
  preferred_language: Language | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  company_id: string | null
  title: string
  stage: DealStage
  service_type: ServiceType | null
  estimated_monthly_value: number | null
  expected_close_date: string | null
  owner: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  type: ActivityType
  summary: string
  company_id: string | null
  contact_id: string | null
  deal_id: string | null
  occurred_at: string
  created_by: string | null
  created_at: string
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  due_date: string | null
  assigned_to: string | null
  company_id: string | null
  contact_id: string | null
  deal_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Minimal Database shape so createClient is typed. Expand as needed.
export interface Database {
  public: {
    Tables: {
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> }
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> }
      deals: { Row: Deal; Insert: Partial<Deal>; Update: Partial<Deal> }
      activities: { Row: Activity; Insert: Partial<Activity>; Update: Partial<Activity> }
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> }
    }
  }
}

// Display labels & ordering used across the UI.
export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'discovery_call', label: 'Discovery Call' },
  { value: 'financial_inspection', label: 'Financial Inspection' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  financial_inspection: 'Financial Inspection',
  restructure_90day: '90-Day Restructure',
  cleanup: 'Cleanup',
  ongoing_bookkeeping: 'Ongoing Bookkeeping',
  profit_strategy: 'Profit Strategy',
}

export const STATUS_LABELS: Record<CompanyStatus, string> = {
  prospect: 'Prospect',
  active_client: 'Active Client',
  churned: 'Churned',
}
