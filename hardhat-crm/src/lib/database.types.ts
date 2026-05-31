// Auto-generated from the live Supabase project (project ref: vbzlxltvmjqoxrtunysk).
// Regenerate with: supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
// To opt into end-to-end typing, import Database here in lib/supabase.ts:
//   import type { Database } from './database.types'
//   export const supabase = createClient<Database>(url, anonKey)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          deal_id: string | null
          id: string
          occurred_at: string
          summary: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          occurred_at?: string
          summary: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          deal_id?: string | null
          id?: string
          occurred_at?: string
          summary?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accounting_software: string | null
          address: string | null
          annual_revenue: number | null
          created_at: string
          id: string
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          name: string
          notes: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["language"] | null
          status: Database["public"]["Enums"]["company_status"]
          trade: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accounting_software?: string | null
          address?: string | null
          annual_revenue?: number | null
          created_at?: string
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language"] | null
          status?: Database["public"]["Enums"]["company_status"]
          trade?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accounting_software?: string | null
          address?: string | null
          annual_revenue?: number | null
          created_at?: string
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language"] | null
          status?: Database["public"]["Enums"]["company_status"]
          trade?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["language"] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language"] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language"] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_id: string | null
          created_at: string
          estimated_monthly_value: number | null
          expected_close_date: string | null
          id: string
          notes: string | null
          owner: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          stage: Database["public"]["Enums"]["deal_stage"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          estimated_monthly_value?: number | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          estimated_monthly_value?: number | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          due_date: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: "call" | "email" | "meeting" | "note"
      company_status: "prospect" | "active_client" | "churned"
      deal_stage:
        | "new_lead"
        | "discovery_call"
        | "financial_inspection"
        | "proposal_sent"
        | "won"
        | "lost"
      language: "en" | "es"
      lead_source: "referral" | "web" | "partner" | "social" | "other"
      service_type:
        | "financial_inspection"
        | "restructure_90day"
        | "cleanup"
        | "ongoing_bookkeeping"
        | "profit_strategy"
      task_status: "open" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
