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
      attendances: {
        Row: {
          created_at: string
          id: string
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          archived: boolean
          city: string
          coach_id: string
          created_at: string
          id: string
          manager_name: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string
          archived?: boolean
          city?: string
          coach_id?: string
          created_at?: string
          id?: string
          manager_name?: string
          name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          address?: string
          archived?: boolean
          city?: string
          coach_id?: string
          created_at?: string
          id?: string
          manager_name?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_skills: {
        Row: {
          created_at: string
          direction: string
          evaluation_id: string
          id: string
          skill_key: string
          value: number
        }
        Insert: {
          created_at?: string
          direction?: string
          evaluation_id: string
          id?: string
          skill_key: string
          value: number
        }
        Update: {
          created_at?: string
          direction?: string
          evaluation_id?: string
          id?: string
          skill_key?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_skills_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          engagement: number
          id: string
          notes: string
          session_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          engagement?: number
          id?: string
          notes?: string
          session_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          engagement?: number
          id?: string
          notes?: string
          session_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
        ]
      }
      match_rosters: {
        Row: {
          created_at: string
          id: string
          match_id: string
          side: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          side: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          side?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_rosters_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rosters_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rosters_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
        ]
      }
      match_sets: {
        Row: {
          created_at: string
          id: string
          match_id: string
          points_a: number
          points_b: number
          set_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          points_a?: number
          points_b?: number
          set_number: number
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          points_a?: number
          points_b?: number
          set_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          balance_score: number | null
          coach_id: string
          created_at: string
          format: string
          id: string
          match_date: string
          session_id: string | null
          team_a_name: string
          team_b_name: string
          team_id: string
          updated_at: string
          walkover: boolean
          winner: string | null
        }
        Insert: {
          balance_score?: number | null
          coach_id?: string
          created_at?: string
          format?: string
          id?: string
          match_date?: string
          session_id?: string | null
          team_a_name?: string
          team_b_name?: string
          team_id: string
          updated_at?: string
          walkover?: boolean
          winner?: string | null
        }
        Update: {
          balance_score?: number | null
          coach_id?: string
          created_at?: string
          format?: string
          id?: string
          match_date?: string
          session_id?: string | null
          team_a_name?: string
          team_b_name?: string
          team_id?: string
          updated_at?: string
          walkover?: boolean
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          parental_consent_acknowledged: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          parental_consent_acknowledged?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          parental_consent_acknowledged?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          assembly_mode: string
          bench_policy: string
          coach_id: string
          created_at: string
          height_unit: string
          id: string
          show_weights: boolean
          team_size: string
          theme: string
          updated_at: string
        }
        Insert: {
          assembly_mode?: string
          bench_policy?: string
          coach_id: string
          created_at?: string
          height_unit?: string
          id?: string
          show_weights?: boolean
          team_size?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          assembly_mode?: string
          bench_policy?: string
          coach_id?: string
          created_at?: string
          height_unit?: string
          id?: string
          show_weights?: boolean
          team_size?: string
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_configs: {
        Row: {
          active: boolean
          coach_id: string
          created_at: string
          id: string
          key: string
          kind: string
          label: string
          sort_order: number
          updated_at: string
          weight: number
        }
        Insert: {
          active?: boolean
          coach_id?: string
          created_at?: string
          id?: string
          key: string
          kind: string
          label: string
          sort_order?: number
          updated_at?: string
          weight?: number
        }
        Update: {
          active?: boolean
          coach_id?: string
          created_at?: string
          id?: string
          key?: string
          kind?: string
          label?: string
          sort_order?: number
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_configs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          coach_id: string
          id: string
          skill_key: string
          student_id: string
          updated_at: string
          value: number
        }
        Insert: {
          coach_id?: string
          id?: string
          skill_key: string
          student_id: string
          updated_at?: string
          value?: number
        }
        Update: {
          coach_id?: string
          id?: string
          skill_key?: string
          student_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          alternate_positions: string[]
          coach_id: string
          created_at: string
          dominant_hand: string
          guardian_name: string
          guardian_phone: string
          height_cm: number | null
          id: string
          is_guest: boolean
          name: string
          notes: string
          parental_consent: boolean
          photo_path: string | null
          position: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          alternate_positions?: string[]
          coach_id?: string
          created_at?: string
          dominant_hand?: string
          guardian_name?: string
          guardian_phone?: string
          height_cm?: number | null
          id?: string
          is_guest?: boolean
          name: string
          notes?: string
          parental_consent?: boolean
          photo_path?: string | null
          position?: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          alternate_positions?: string[]
          coach_id?: string
          created_at?: string
          dominant_hand?: string
          guardian_name?: string
          guardian_phone?: string
          height_cm?: number | null
          id?: string
          is_guest?: boolean
          name?: string
          notes?: string
          parental_consent?: boolean
          photo_path?: string | null
          position?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_students: {
        Row: {
          created_at: string
          id: string
          student_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "team_students_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          archived: boolean
          branch_id: string
          coach_id: string
          created_at: string
          id: string
          instructor_name: string
          level: string
          name: string
          schedule_days: string
          schedule_time: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string
          archived?: boolean
          branch_id: string
          coach_id?: string
          created_at?: string
          id?: string
          instructor_name?: string
          level?: string
          name: string
          schedule_days?: string
          schedule_time?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string
          archived?: boolean
          branch_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          instructor_name?: string
          level?: string
          name?: string
          schedule_days?: string
          schedule_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          notes: string
          session_date: string
          team_id: string
          updated_at: string
        }
        Insert: {
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string
          session_date?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          notes?: string
          session_date?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_student_attendance_stats: {
        Row: {
          absent_count: number | null
          attendance_pct: number | null
          coach_id: string | null
          late_count: number | null
          present_count: number | null
          student_id: string | null
          total_sessions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "students_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_student_match_stats: {
        Row: {
          coach_id: string | null
          losses: number | null
          name: string | null
          student_id: string | null
          total_matches: number | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_rosters_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rosters_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_overall"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "students_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_student_overall: {
        Row: {
          coach_id: string | null
          name: string | null
          overall_rating: number | null
          position: string | null
          skills_count: number | null
          student_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fn_is_coach_owner_of_evaluation: {
        Args: { p_evaluation_id: string }
        Returns: boolean
      }
      fn_is_coach_owner_of_match: {
        Args: { p_match_id: string }
        Returns: boolean
      }
      fn_is_coach_owner_of_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      fn_is_coach_owner_of_team: {
        Args: { p_team_id: string }
        Returns: boolean
      }
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
