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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      game_answers: {
        Row: {
          answer: string
          created_at: string
          id: string
          player_number: number
          room_id: string
          round_number: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          player_number: number
          room_id: string
          round_number: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          player_number?: number
          room_id?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_answers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_final_results: {
        Row: {
          advice: string
          awards: Json | null
          created_at: string
          final_score: number
          id: string
          room_id: string
          summary: string
          title: string
        }
        Insert: {
          advice: string
          awards?: Json | null
          created_at?: string
          final_score: number
          id?: string
          room_id: string
          summary: string
          title: string
        }
        Update: {
          advice?: string
          awards?: Json | null
          created_at?: string
          final_score?: number
          id?: string
          room_id?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_final_results_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          player_number: number
          room_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          player_number: number
          room_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          player_number?: number
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_reactions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string
          current_question: string | null
          current_question_b: string | null
          current_round: number
          current_surprise: string | null
          game_mode: string
          id: string
          language: string
          phase: string
          player1_name: string
          player2_name: string | null
          previous_questions: Json | null
          question_mood: string | null
          relationship_type: string
          room_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_question?: string | null
          current_question_b?: string | null
          current_round?: number
          current_surprise?: string | null
          game_mode?: string
          id?: string
          language?: string
          phase?: string
          player1_name?: string
          player2_name?: string | null
          previous_questions?: Json | null
          question_mood?: string | null
          relationship_type?: string
          room_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_question?: string | null
          current_question_b?: string | null
          current_round?: number
          current_surprise?: string | null
          game_mode?: string
          id?: string
          language?: string
          phase?: string
          player1_name?: string
          player2_name?: string | null
          previous_questions?: Json | null
          question_mood?: string | null
          relationship_type?: string
          room_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_round_results: {
        Row: {
          compatibility_score: number
          couple_verdict: string
          created_at: string
          id: string
          player1_scores: Json
          player2_scores: Json
          room_id: string
          round_number: number
        }
        Insert: {
          compatibility_score: number
          couple_verdict: string
          created_at?: string
          id?: string
          player1_scores: Json
          player2_scores: Json
          room_id: string
          round_number: number
        }
        Update: {
          compatibility_score?: number
          couple_verdict?: string
          created_at?: string
          id?: string
          player1_scores?: Json
          player2_scores?: Json
          room_id?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_round_results_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          boldness: string | null
          created_at: string
          drama: string | null
          games_played: number | null
          honesty: string | null
          humor: string | null
          id: string
          jealousy: string | null
          last_played_at: string | null
          loyalty: string | null
          player_name: string
          traits: Json | null
          updated_at: string
        }
        Insert: {
          boldness?: string | null
          created_at?: string
          drama?: string | null
          games_played?: number | null
          honesty?: string | null
          humor?: string | null
          id?: string
          jealousy?: string | null
          last_played_at?: string | null
          loyalty?: string | null
          player_name: string
          traits?: Json | null
          updated_at?: string
        }
        Update: {
          boldness?: string | null
          created_at?: string
          drama?: string | null
          games_played?: number | null
          honesty?: string | null
          humor?: string | null
          id?: string
          jealousy?: string | null
          last_played_at?: string | null
          loyalty?: string | null
          player_name?: string
          traits?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_game_rooms: { Args: never; Returns: undefined }
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
