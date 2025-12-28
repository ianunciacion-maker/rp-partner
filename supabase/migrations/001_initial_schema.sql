-- RP-Partner Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  property_limit INTEGER DEFAULT 1,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  property_type TEXT CHECK (property_type IN ('villa', 'apartment', 'condo', 'house', 'resort', 'other')),
  max_guests INTEGER DEFAULT 10,
  base_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  cover_image_url TEXT,
  gallery_urls TEXT[],
  amenities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  guest_count INTEGER NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  base_amount DECIMAL(10,2) NOT NULL,
  additional_fees JSONB DEFAULT '{}',
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  balance_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - deposit_amount) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
  source TEXT CHECK (source IN ('direct', 'airbnb', 'booking', 'facebook', 'referral', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

-- Cashflow entries table
CREATE TABLE cashflow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  transaction_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'gcash', 'maya', 'bank_transfer', 'credit_card', 'check', 'other')),
  reference_number TEXT,
  receipt_url TEXT,
  receipt_thumbnail_url TEXT,
  tags TEXT[],
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_reservations_property ON reservations(property_id, check_in, check_out);
CREATE INDEX idx_cashflow_property ON cashflow_entries(property_id, transaction_date);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = reservations.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can insert reservations" ON reservations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = reservations.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can update own reservations" ON reservations FOR UPDATE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = reservations.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can delete own reservations" ON reservations FOR DELETE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = reservations.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "Users can view own cashflow" ON cashflow_entries FOR SELECT USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = cashflow_entries.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can insert cashflow" ON cashflow_entries FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = cashflow_entries.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can update own cashflow" ON cashflow_entries FOR UPDATE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = cashflow_entries.property_id AND properties.user_id = auth.uid()));
CREATE POLICY "Users can delete own cashflow" ON cashflow_entries FOR DELETE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = cashflow_entries.property_id AND properties.user_id = auth.uid()));
