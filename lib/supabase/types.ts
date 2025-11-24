export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  campaign_os: {
    Tables: {
      campaign_channels: {
        Row: {
          campaign_id: string
          channel_id: string
          weight: number | null
        }
        Insert: {
          campaign_id: string
          channel_id: string
          weight?: number | null
        }
        Update: {
          campaign_id?: string
          channel_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_channels_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget_estimate: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          narratives: Json | null
          primary_goal_type: Database["public"]["Enums"]["goal_type"]
          secondary_goals: Json | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
          wizard_data: Json | null
        }
        Insert: {
          budget_estimate?: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          narratives?: Json | null
          primary_goal_type: Database["public"]["Enums"]["goal_type"]
          secondary_goals?: Json | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
          wizard_data?: Json | null
        }
        Update: {
          budget_estimate?: number | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          narratives?: Json | null
          primary_goal_type?: Database["public"]["Enums"]["goal_type"]
          secondary_goals?: Json | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
          wizard_data?: Json | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["channel_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["channel_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["channel_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      content_slots: {
        Row: {
          angle_hint: string | null
          channel: string
          content_type: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          objective: string
          primary_segment_id: string | null
          primary_topic_id: string | null
          slot_index: number
          sprint_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          angle_hint?: string | null
          channel: string
          content_type: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          objective: string
          primary_segment_id?: string | null
          primary_topic_id?: string | null
          slot_index: number
          sprint_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          angle_hint?: string | null
          channel?: string
          content_type?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          objective?: string
          primary_segment_id?: string | null
          primary_topic_id?: string | null
          slot_index?: number
          sprint_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_slots_primary_segment_id_fkey"
            columns: ["primary_segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_slots_primary_topic_id_fkey"
            columns: ["primary_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_slots_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          campaign_id: string
          created_at: string | null
          description: string | null
          funnel_stage: Database["public"]["Enums"]["funnel_stage_enum"] | null
          id: string
          kpi_hint: string | null
          priority: number | null
          target_metric: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          description?: string | null
          funnel_stage?: Database["public"]["Enums"]["funnel_stage_enum"] | null
          id?: string
          kpi_hint?: string | null
          priority?: number | null
          target_metric?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          description?: string | null
          funnel_stage?: Database["public"]["Enums"]["funnel_stage_enum"] | null
          id?: string
          kpi_hint?: string | null
          priority?: number | null
          target_metric?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      message_strategies: {
        Row: {
          campaign_id: string
          created_at: string | null
          cta_funnel: Json
          extra_fields: Json | null
          id: string
          preview_summary: string | null
          segment_id: string
          strategy_core: Json
          style_tone: Json
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          cta_funnel: Json
          extra_fields?: Json | null
          id?: string
          preview_summary?: string | null
          segment_id: string
          strategy_core: Json
          style_tone: Json
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          cta_funnel?: Json
          extra_fields?: Json | null
          id?: string
          preview_summary?: string | null
          segment_id?: string
          strategy_core?: Json
          style_tone?: Json
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_strategies_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_strategies_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_strategies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          campaign_id: string
          created_at: string | null
          cta: string | null
          headline: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"] | null
          proof_point: string | null
          segment_id: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          campaign_id: string
          created_at?: string | null
          cta?: string | null
          headline: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          proof_point?: string | null
          segment_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          campaign_id?: string
          created_at?: string | null
          cta?: string | null
          headline?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"] | null
          proof_point?: string | null
          segment_id?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      narrative_goals: {
        Row: {
          goal_id: string
          narrative_id: string
        }
        Insert: {
          goal_id: string
          narrative_id: string
        }
        Update: {
          goal_id?: string
          narrative_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrative_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narrative_goals_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "narratives"
            referencedColumns: ["id"]
          },
        ]
      }
      narrative_topics: {
        Row: {
          narrative_id: string
          topic_id: string
        }
        Insert: {
          narrative_id: string
          topic_id: string
        }
        Update: {
          narrative_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrative_topics_narrative_id_fkey"
            columns: ["narrative_id"]
            isOneToOne: false
            referencedRelation: "narratives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narrative_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      narratives: {
        Row: {
          campaign_id: string
          created_at: string | null
          description: string
          id: string
          priority: number | null
          suggested_phase:
            | Database["public"]["Enums"]["narrative_phase_enum"]
            | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          description: string
          id?: string
          priority?: number | null
          suggested_phase?:
            | Database["public"]["Enums"]["narrative_phase_enum"]
            | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: number | null
          suggested_phase?:
            | Database["public"]["Enums"]["narrative_phase_enum"]
            | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "narratives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_topic_matrix: {
        Row: {
          created_at: string | null
          importance: string
          role: string
          segment_id: string
          summary: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          importance: string
          role: string
          segment_id: string
          summary?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          importance?: string
          role?: string
          segment_id?: string
          summary?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segment_topic_matrix_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_topic_matrix_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          campaign_id: string
          created_at: string | null
          demographic_profile: Json | null
          demographics: Json | null
          description: string | null
          example_persona: Json | null
          funnel_stage_focus: string | null
          id: string
          media_habits: Json | null
          name: string
          priority: string | null
          psychographic_profile: Json | null
          psychographics: Json | null
          short_label: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          demographic_profile?: Json | null
          demographics?: Json | null
          description?: string | null
          example_persona?: Json | null
          funnel_stage_focus?: string | null
          id?: string
          media_habits?: Json | null
          name: string
          priority?: string | null
          psychographic_profile?: Json | null
          psychographics?: Json | null
          short_label?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          demographic_profile?: Json | null
          demographics?: Json | null
          description?: string | null
          example_persona?: Json | null
          funnel_stage_focus?: string | null
          id?: string
          media_habits?: Json | null
          name?: string
          priority?: string | null
          psychographic_profile?: Json | null
          psychographics?: Json | null
          short_label?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_channels: {
        Row: {
          channel_key: string
          sprint_id: string
        }
        Insert: {
          channel_key: string
          sprint_id: string
        }
        Update: {
          channel_key?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_channels_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_segments: {
        Row: {
          segment_id: string
          sprint_id: string
        }
        Insert: {
          segment_id: string
          sprint_id: string
        }
        Update: {
          segment_id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_segments_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_topics: {
        Row: {
          sprint_id: string
          topic_id: string
        }
        Insert: {
          sprint_id: string
          topic_id: string
        }
        Update: {
          sprint_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_topics_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          campaign_id: string
          created_at: string | null
          end_date: string
          focus_channels: Json | null
          focus_description: string
          focus_goal: string
          focus_goals: Json | null
          focus_stage: string | null
          id: string
          key_messages_summary: string | null
          name: string
          narrative_emphasis: Json | null
          order: number
          risks_and_watchouts: Json | null
          start_date: string
          status: Database["public"]["Enums"]["sprint_status"] | null
          success_criteria: Json | null
          success_indicators: Json | null
          suggested_weekly_post_volume: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          end_date: string
          focus_channels?: Json | null
          focus_description?: string
          focus_goal: string
          focus_goals?: Json | null
          focus_stage?: string | null
          id?: string
          key_messages_summary?: string | null
          name: string
          narrative_emphasis?: Json | null
          order?: number
          risks_and_watchouts?: Json | null
          start_date: string
          status?: Database["public"]["Enums"]["sprint_status"] | null
          success_criteria?: Json | null
          success_indicators?: Json | null
          suggested_weekly_post_volume?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          end_date?: string
          focus_channels?: Json | null
          focus_description?: string
          focus_goal?: string
          focus_goals?: Json | null
          focus_stage?: string | null
          id?: string
          key_messages_summary?: string | null
          name?: string
          narrative_emphasis?: Json | null
          order?: number
          risks_and_watchouts?: Json | null
          start_date?: string
          status?: Database["public"]["Enums"]["sprint_status"] | null
          success_criteria?: Json | null
          success_indicators?: Json | null
          suggested_weekly_post_volume?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          campaign_id: string
          category: Database["public"]["Enums"]["task_category"] | null
          channel_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          sprint_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee?: string | null
          campaign_id: string
          category?: Database["public"]["Enums"]["task_category"] | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee?: string | null
          campaign_id?: string
          category?: Database["public"]["Enums"]["task_category"] | null
          channel_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          campaign_id: string
          category: string | null
          content_angles: Json | null
          core_narrative: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          priority: string | null
          recommended_channels: Json | null
          recommended_content_types: Json | null
          related_goal_stages: Json | null
          related_goal_types: Json | null
          risk_notes: Json | null
          short_label: string | null
          topic_type: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          category?: string | null
          content_angles?: Json | null
          core_narrative?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: string | null
          recommended_channels?: Json | null
          recommended_content_types?: Json | null
          related_goal_stages?: Json | null
          related_goal_types?: Json | null
          risk_notes?: Json | null
          short_label?: string | null
          topic_type?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          category?: string | null
          content_angles?: Json | null
          core_narrative?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: string | null
          recommended_channels?: Json | null
          recommended_content_types?: Json | null
          related_goal_stages?: Json | null
          related_goal_types?: Json | null
          risk_notes?: Json | null
          short_label?: string | null
          topic_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campaign_status: "planning" | "running" | "closed"
      campaign_type:
        | "political_election"
        | "political_issue"
        | "brand_awareness"
        | "product_launch"
        | "promo"
        | "ngo_issue"
      channel_type: "social" | "paid" | "owned"
      funnel_stage_enum:
        | "awareness"
        | "engagement"
        | "consideration"
        | "conversion"
        | "mobilization"
      goal_type:
        | "awareness"
        | "engagement"
        | "list_building"
        | "conversion"
        | "mobilization"
      message_status: "draft" | "approved"
      message_type: "core" | "supporting" | "contrast"
      narrative_phase_enum: "early" | "mid" | "late"
      sprint_status: "planned" | "active" | "closed"
      task_category:
        | "creative"
        | "copy"
        | "social_setup"
        | "ads_setup"
        | "analytics"
        | "coordination"
      task_status: "todo" | "in_progress" | "done"
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
  campaign_os: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      campaign_status: ["planning", "running", "closed"],
      campaign_type: [
        "political_election",
        "political_issue",
        "brand_awareness",
        "product_launch",
        "promo",
        "ngo_issue",
      ],
      channel_type: ["social", "paid", "owned"],
      funnel_stage_enum: [
        "awareness",
        "engagement",
        "consideration",
        "conversion",
        "mobilization",
      ],
      goal_type: [
        "awareness",
        "engagement",
        "list_building",
        "conversion",
        "mobilization",
      ],
      message_status: ["draft", "approved"],
      message_type: ["core", "supporting", "contrast"],
      narrative_phase_enum: ["early", "mid", "late"],
      sprint_status: ["planned", "active", "closed"],
      task_category: [
        "creative",
        "copy",
        "social_setup",
        "ads_setup",
        "analytics",
        "coordination",
      ],
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const

