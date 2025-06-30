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
      competitions: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["competition_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["competition_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          competition_id: string | null
          created_at: string | null
          esc_score: number | null
          id: string
          is_home: boolean | null
          match_date: string
          notes: string | null
          opponent_score: number | null
          opponent_team: string
          status: Database["public"]["Enums"]["match_status"] | null
          updated_at: string | null
          venue: string
        }
        Insert: {
          competition_id?: string | null
          created_at?: string | null
          esc_score?: number | null
          id?: string
          is_home?: boolean | null
          match_date: string
          notes?: string | null
          opponent_score?: number | null
          opponent_team: string
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string | null
          venue: string
        }
        Update: {
          competition_id?: string | null
          created_at?: string | null
          esc_score?: number | null
          id?: string
          is_home?: boolean | null
          match_date?: string
          notes?: string | null
          opponent_score?: number | null
          opponent_team?: string
          status?: Database["public"]["Enums"]["match_status"] | null
          updated_at?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_measurements: {
        Row: {
          created_at: string
          height: number | null
          id: string
          measurement_date: string
          notes: string | null
          plant_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          measurement_date?: string
          notes?: string | null
          plant_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          measurement_date?: string
          notes?: string | null
          plant_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plant_measurements_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_primary: boolean | null
          photo_url: string
          plant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url: string
          plant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          plant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_photos_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_varieties: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      plant_watering: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          plant_id: string
          watering_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id: string
          watering_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          plant_id?: string
          watering_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_watering_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plante_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      plante_noms: {
        Row: {
          categorie_id: string
          created_at: string
          description: string | null
          id: string
          nom: string
          updated_at: string
        }
        Insert: {
          categorie_id: string
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          updated_at?: string
        }
        Update: {
          categorie_id?: string
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plante_noms_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "plante_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      plante_profile: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plants: {
        Row: {
          created_at: string
          custom_variety: string | null
          growth: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          planting_date: string | null
          purchase_price: number | null
          status: string | null
          updated_at: string
          user_id: string
          variety_id: string | null
        }
        Insert: {
          created_at?: string
          custom_variety?: string | null
          growth?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          planting_date?: string | null
          purchase_price?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          variety_id?: string | null
        }
        Update: {
          created_at?: string
          custom_variety?: string | null
          growth?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          planting_date?: string | null
          purchase_price?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          variety_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_variety_id_fkey"
            columns: ["variety_id"]
            isOneToOne: false
            referencedRelation: "plant_varieties"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          full_name: string
          height: number | null
          id: string
          image_url: string | null
          jersey_number: number | null
          nationality: string | null
          position: Database["public"]["Enums"]["player_position"]
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name: string
          height?: number | null
          id?: string
          image_url?: string | null
          jersey_number?: number | null
          nationality?: string | null
          position: Database["public"]["Enums"]["player_position"]
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          full_name?: string
          height?: number | null
          id?: string
          image_url?: string | null
          jersey_number?: number | null
          nationality?: string | null
          position?: Database["public"]["Enums"]["player_position"]
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          image_url: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          image_url?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          image_url?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_plant_measurement: {
        Args: {
          plant_uuid: string
          height_cm?: number
          width_cm?: number
          note_text?: string
        }
        Returns: string
      }
      add_plant_watering: {
        Args: { plant_uuid: string; amount_ml: number; note_text?: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_plant_measurements: {
        Args: { plant_uuid: string }
        Returns: {
          id: string
          height: number
          width: number
          notes: string
          measurement_date: string
        }[]
      }
      get_plant_watering: {
        Args: { plant_uuid: string }
        Returns: {
          id: string
          amount: number
          notes: string
          watering_date: string
        }[]
      }
    }
    Enums: {
      competition_status: "upcoming" | "ongoing" | "completed" | "cancelled"
      match_status:
        | "scheduled"
        | "live"
        | "finished"
        | "cancelled"
        | "postponed"
      player_position: "goalkeeper" | "defender" | "midfielder" | "forward"
      user_role: "admin" | "editor" | "viewer"
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
    Enums: {
      competition_status: ["upcoming", "ongoing", "completed", "cancelled"],
      match_status: ["scheduled", "live", "finished", "cancelled", "postponed"],
      player_position: ["goalkeeper", "defender", "midfielder", "forward"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
