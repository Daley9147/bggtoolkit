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
          mobile_phone: string | null
          corporate_phone: string | null
          other_phone: string | null
          list_name: string | null
          website: string | null
          identifier: string | null
          organisation_name: string | null
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
          mobile_phone?: string | null
          corporate_phone?: string | null
          other_phone?: string | null
          list_name?: string | null
          website?: string | null
          identifier?: string | null
          organisation_name?: string | null
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
          mobile_phone?: string | null
          corporate_phone?: string | null
          other_phone?: string | null
          list_name?: string | null
          website?: string | null
          identifier?: string | null
          organisation_name?: string | null
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
          contact_id: string | null
          opportunity_id: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          contact_id?: string | null
          opportunity_id?: string | null
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          opportunity_id?: string | null
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
             foreignKeyName: "notes_opportunity_id_fkey"
             columns: ["opportunity_id"]
             referencedRelation: "opportunities"
             referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
          email_signature: string | null
          calendly_url: string | null
          ghl_access_token: string | null
          ghl_refresh_token: string | null
          ghl_token_expires_at: string | null
          ghl_location_id: string | null
          ghl_email: string | null
          ghl_user_id: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          status?: string | null
          email_signature?: string | null
          calendly_url?: string | null
          ghl_access_token?: string | null
          ghl_refresh_token?: string | null
          ghl_token_expires_at?: string | null
          ghl_location_id?: string | null
          ghl_email?: string | null
          ghl_user_id?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          status?: string | null
          email_signature?: string | null
          calendly_url?: string | null
          ghl_access_token?: string | null
          ghl_refresh_token?: string | null
          ghl_token_expires_at?: string | null
          ghl_location_id?: string | null
          ghl_email?: string | null
          ghl_user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          contact_id: string | null
          opportunity_id: string | null
          title: string
          description: string | null
          due_date: string | null
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          contact_id?: string | null
          opportunity_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contact_id?: string | null
          opportunity_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_accounts: {
        Row: {
          id: string
          user_id: string
          imap_host: string
          imap_port: number
          imap_user: string
          imap_password: string
          smtp_host: string
          smtp_port: number
          smtp_user: string
          smtp_password: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          imap_host: string
          imap_port: number
          imap_user: string
          imap_password: string
          smtp_host: string
          smtp_port: number
          smtp_user: string
          smtp_password: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          imap_host?: string
          imap_port?: number
          imap_user?: string
          imap_password?: string
          smtp_host?: string
          smtp_port?: number
          smtp_user?: string
          smtp_password?: string
          created_at?: string
        }
        Relationships: []
      }
      email_templates: {
          Row: {
            id: string
            user_id: string
            template_name: string
            subject_line: string
            body: string
            created_at: string
          }
          Insert: {
            id?: string
            user_id?: string
            template_name: string
            subject_line: string
            body: string
            created_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            template_name?: string
            subject_line?: string
            body?: string
            created_at?: string
          }
          Relationships: []
      }
      logged_actions: {
          Row: {
            id: string
            user_id: string
            action_type: string
            entity_type: string
            entity_id: string | null
            metadata: Json
            created_at: string
          }
          Insert: {
            id?: string
            user_id?: string
            action_type: string
            entity_type: string
            entity_id?: string | null
            metadata?: Json
            created_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            action_type?: string
            entity_type?: string
            entity_id?: string | null
            metadata?: Json
            created_at?: string
          }
          Relationships: []
      }
      workspaces: {
          Row: {
            id: string
            user_id: string
            title: string
            content: Json
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id?: string
            title: string
            content: Json
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            title?: string
            content?: Json
            created_at?: string
            updated_at?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
