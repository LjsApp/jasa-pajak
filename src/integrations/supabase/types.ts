export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          id: number
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          id?: number
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          id?: number
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tags: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tags?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          npwp: string
          npwp_doc_data: string | null
          npwp_doc_name: string | null
        }
        Insert: {
          address?: string
          created_at?: string
          id?: string
          name: string
          npwp?: string
          npwp_doc_data?: string | null
          npwp_doc_name?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          npwp?: string
          npwp_doc_data?: string | null
          npwp_doc_name?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string
          email: string
          id: number
          instagram: string
          logo_data_url: string | null
          maps_embed_url: string
          misi: string
          name: string
          phone: string
          tagline: string
          tiktok: string
          updated_at: string
          visi: string
          whatsapp: string
        }
        Insert: {
          address?: string
          email?: string
          id?: number
          instagram?: string
          logo_data_url?: string | null
          maps_embed_url?: string
          misi?: string
          name?: string
          phone?: string
          tagline?: string
          tiktok?: string
          updated_at?: string
          visi?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          email?: string
          id?: number
          instagram?: string
          logo_data_url?: string | null
          maps_embed_url?: string
          misi?: string
          name?: string
          phone?: string
          tagline?: string
          tiktok?: string
          updated_at?: string
          visi?: string
          whatsapp?: string
        }
        Relationships: []
      }
      custom_accounts: {
        Row: {
          client_id: string
          created_at: string
          id: string
          label: string
          section: string
          sort_order: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          label: string
          section: string
          sort_order?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          label?: string
          section?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "custom_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      laba_rugi: {
        Row: {
          client_id: string
          id: string
          tax_rate: number
          updated_at: string
          values: Json
          year: number
        }
        Insert: {
          client_id: string
          id?: string
          tax_rate?: number
          updated_at?: string
          values?: Json
          year: number
        }
        Update: {
          client_id?: string
          id?: string
          tax_rate?: number
          updated_at?: string
          values?: Json
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "laba_rugi_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      neraca: {
        Row: {
          client_id: string
          date: string
          id: string
          updated_at: string
          values: Json
        }
        Insert: {
          client_id: string
          date: string
          id?: string
          updated_at?: string
          values?: Json
        }
        Update: {
          client_id?: string
          date?: string
          id?: string
          updated_at?: string
          values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "neraca_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string
          excludes: string
          frees: string
          highlight: boolean
          id: string
          name: string
          order: number
          original_price: number
          price: number
          price_max: number | null
        }
        Insert: {
          created_at?: string
          description?: string
          excludes?: string
          frees?: string
          highlight?: boolean
          id?: string
          name: string
          order?: number
          original_price?: number
          price?: number
          price_max?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          excludes?: string
          frees?: string
          highlight?: boolean
          id?: string
          name?: string
          order?: number
          original_price?: number
          price?: number
          price_max?: number | null
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
