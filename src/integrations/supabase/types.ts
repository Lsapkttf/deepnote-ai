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
      calories: {
        Row: {
          calories_burned: number
          created_at: string
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          calories_burned: number
          created_at?: string
          id?: string
          timestamp: string
          user_id?: string | null
        }
        Update: {
          calories_burned?: number
          created_at?: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      heart_rate: {
        Row: {
          bpm: number
          created_at: string
          id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          bpm: number
          created_at?: string
          id?: string
          timestamp: string
          user_id?: string | null
        }
        Update: {
          bpm?: number
          created_at?: string
          id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          archived: boolean | null
          color: string
          content: string | null
          created_at: string | null
          id: string
          pinned: boolean | null
          title: string
          transcription: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          color: string
          content?: string | null
          created_at?: string | null
          id?: string
          pinned?: boolean | null
          title: string
          transcription?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          color?: string
          content?: string | null
          created_at?: string | null
          id?: string
          pinned?: boolean | null
          title?: string
          transcription?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      oxygen: {
        Row: {
          created_at: string
          id: string
          oxygen_saturation: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          oxygen_saturation: number
          timestamp: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          oxygen_saturation?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sleep: {
        Row: {
          created_at: string
          end_time: string
          id: string
          sleep_stage: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          sleep_stage?: string
          start_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          sleep_stage?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
      steps: {
        Row: {
          created_at: string
          id: string
          steps: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          steps: number
          timestamp: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          steps?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stress: {
        Row: {
          created_at: string
          id: string
          stress_level: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          stress_level: number
          timestamp: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          stress_level?: number
          timestamp?: string
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
