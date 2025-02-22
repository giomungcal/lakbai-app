export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          address: string;
          created_at: string;
          day: number;
          description: string | null;
          id: number;
          itinerary_id: string;
          name: string;
          time: string;
        };
        Insert: {
          address?: string;
          created_at?: string;
          day?: number;
          description?: string | null;
          id?: number;
          itinerary_id?: string;
          name?: string;
          time?: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          day?: number;
          description?: string | null;
          id?: number;
          itinerary_id?: string;
          name?: string;
          time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_itinerary_id_fkey";
            columns: ["itinerary_id"];
            isOneToOne: false;
            referencedRelation: "itineraries";
            referencedColumns: ["id"];
          }
        ];
      };
      itineraries: {
        Row: {
          address: string;
          days_count: number;
          emoji: string;
          end_date: string;
          id: string;
          is_created_by_lakbai: boolean;
          is_public: boolean;
          name: string;
          num_of_people: string;
          owner_id: string;
          start_date: string;
        };
        Insert: {
          address: string;
          days_count?: number;
          emoji: string;
          end_date: string;
          id: string;
          is_created_by_lakbai?: boolean;
          is_public?: boolean;
          name: string;
          num_of_people: string;
          owner_id: string;
          start_date: string;
        };
        Update: {
          address?: string;
          days_count?: number;
          emoji?: string;
          end_date?: string;
          id?: string;
          is_created_by_lakbai?: boolean;
          is_public?: boolean;
          name?: string;
          num_of_people?: string;
          owner_id?: string;
          start_date?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          created_at: string;
          itinerary_id: string;
          role: string;
          user_id: string;
          email_address: string;
          first_name: string | null;
          last_name: string | null;
          image_url: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          itinerary_id: string;
          role: string;
          user_id: string;
          email_address: string;
          first_name: string | null;
          last_name: string | null;
          image_url: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          itinerary_id?: string;
          role?: string;
          user_id?: string;
          email_address?: string;
          first_name?: string | null;
          last_name?: string | null;
          image_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user itinerary_itinerary_id_fkey";
            columns: ["itinerary_id"];
            isOneToOne: false;
            referencedRelation: "itineraries";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      role: "edit" | "view";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
