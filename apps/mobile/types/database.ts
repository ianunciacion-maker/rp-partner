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
          current_subscription_id: string | null;
          push_token: string | null;
          calendar_months_override: number | null;
          report_months_override: number | null;
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
      locked_dates: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['locked_dates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['locked_dates']['Insert']>;
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          price_monthly: number;
          calendar_months_limit: number | null;
          report_months_limit: number | null;
          property_limit: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          account_name: string;
          account_number: string | null;
          qr_code_url: string | null;
          instructions: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_methods']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: 'active' | 'expired' | 'grace_period' | 'cancelled';
          current_period_start: string;
          current_period_end: string;
          grace_period_end: string | null;
          reminder_sent_at: string | null;
          last_reminder_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      subscription_reminders: {
        Row: {
          id: string;
          subscription_id: string;
          user_id: string;
          reminder_type: 'expiring_7_days' | 'expiring_3_days' | 'expiring_1_day' | 'grace_period_start' | 'grace_period_day_2' | 'grace_period_final' | 'expired';
          channel: 'push' | 'in_app';
          sent_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_reminders']['Row'], 'id' | 'created_at' | 'sent_at'>;
        Update: Partial<Database['public']['Tables']['subscription_reminders']['Insert']>;
      };
      payment_submissions: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          payment_method_id: string;
          amount: number;
          screenshot_url: string;
          reference_number: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          months_purchased: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_submissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_submissions']['Insert']>;
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
export type LockedDate = Database['public']['Tables']['locked_dates']['Row'];
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type PaymentSubmission = Database['public']['Tables']['payment_submissions']['Row'];
export type SubscriptionReminder = Database['public']['Tables']['subscription_reminders']['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Subscription with plan details
export interface SubscriptionWithPlan extends Subscription {
  plan?: SubscriptionPlan;
}

// Payment submission with details
export interface PaymentSubmissionWithDetails extends PaymentSubmission {
  payment_method?: PaymentMethod;
  user?: User;
}
