export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pipelines: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          id: string
          pipeline_id: string
          name: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          pipeline_id: string
          name: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          pipeline_id?: string
          name?: string
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          job_title: string | null
          email: string | null
          phone: string | null
          website: string | null
          identifier: string | null
          organization_name: string | null
          country: string | null
          num_employees: string | null
          industry: string | null
          keywords: string | null
          person_linkedin_url: string | null
          company_linkedin_url: string | null
          facebook_url: string | null
          twitter_url: string | null
          address: string | null
          city: string | null
          state: string | null
          annual_revenue: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          identifier?: string | null
          organization_name?: string | null
          country?: string | null
          num_employees?: string | null
          industry?: string | null
          keywords?: string | null
          person_linkedin_url?: string | null
          company_linkedin_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          annual_revenue?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          identifier?: string | null
          organization_name?: string | null
          country?: string | null
          num_employees?: string | null
          industry?: string | null
          keywords?: string | null
          person_linkedin_url?: string | null
          company_linkedin_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          annual_revenue?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          user_id: string
          pipeline_id: string
          stage_id: string
          contact_id: string | null
          name: string
          value: number | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          pipeline_id: string
          stage_id: string
          contact_id?: string | null
          name: string
          value?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pipeline_id?: string
          stage_id?: string
          contact_id?: string | null
          name?: string
          value?: number | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          contact_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          contact_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      mission_metrics_reports: {
        Row: {
          id: string
          contact_id: string
          user_id: string
          charity_number: string | null
          website_url: string | null
          specific_url: string | null
          report_json: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          user_id: string
          charity_number?: string | null
          website_url?: string | null
          specific_url?: string | null
          report_json: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          user_id?: string
          charity_number?: string | null
          website_url?: string | null
          specific_url?: string | null
          report_json?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never