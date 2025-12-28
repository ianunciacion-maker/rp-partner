export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          property_limit: number;
          subscription_status: string;
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          property_type: string | null;
          max_guests: number;
          base_rate: number;
          currency: string;
          cover_image_url: string | null;
          gallery_urls: string[] | null;
          amenities: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      reservations: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          guest_name: string;
          guest_phone: string | null;
          guest_email: string | null;
          guest_count: number;
          check_in: string;
          check_out: string;
          nights: number;
          base_amount: number;
          additional_fees: Json | null;
          total_amount: number;
          deposit_amount: number;
          deposit_paid: boolean;
          balance_amount: number;
          status: string;
          source: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'nights' | 'balance_amount' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>;
      };
      cashflow_entries: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          reservation_id: string | null;
          type: string;
          category: string;
          subcategory: string | null;
          description: string;
          amount: number;
          currency: string;
          transaction_date: string;
          payment_method: string | null;
          reference_number: string | null;
          receipt_url: string | null;
          receipt_thumbnail_url: string | null;
          tags: string[] | null;
          notes: string | null;
          is_recurring: boolean;
          recurring_config: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cashflow_entries']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cashflow_entries']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type CashflowEntry = Database['public']['Tables']['cashflow_entries']['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
