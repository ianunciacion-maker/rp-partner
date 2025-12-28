# RP-Partner v1.0 — Rental Property Management Platform

## Project Overview

**App Name:** RP-Partner  
**Version:** 1.0 (Foundation Release)  
**Target Market:** Philippines Rental Property Owners & Managers  
**Platforms:** Android APK (Primary), iOS (Future), Desktop Web (Responsive)  
**Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)  
**Tech Stack:** React Native (Expo) + TypeScript + Supabase  

---

## Executive Summary

RP-Partner is a premium rental property management platform designed for Filipino property owners and managers. The app provides unified calendar management, comprehensive cashflow tracking with receipt attachments, multi-property support, and a robust admin dashboard for subscription and user management.

### Core Value Propositions
1. **Unified Property Calendar** — Visual booking management with conflict prevention
2. **Complete Cashflow Intelligence** — Income/expense tracking with receipt attachments
3. **Multi-Property Portfolio** — Manage unlimited properties under one account (admin-controlled limits)
4. **Premium Mobile Experience** — Million-dollar design that's intuitive and beautiful
5. **Enterprise Security** — Bank-grade security via Supabase with zero credential exposure

---

## Design Philosophy

### Visual Identity
- **Primary Colors:** Deep Navy (#1A1F3C) + Electric Teal (#00D4AA) + Warm Gold (#FFB800)
- **Typography:** Inter (UI) + Space Grotesk (Headings) — Modern, clean, professional
- **Design System:** Glassmorphism elements, smooth 60fps animations, haptic feedback
- **Dark Mode:** Full support with OLED-true blacks for battery efficiency

### UX Principles
1. **One-Thumb Navigation** — All critical actions reachable with single hand
2. **Progressive Disclosure** — Show only what's needed, reveal complexity on demand
3. **Zero-State Excellence** — Empty states that guide, never frustrate
4. **Micro-Interactions** — Every tap feels alive with subtle feedback
5. **Filipino-First Localization** — English/Tagalog with peso formatting (₱)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RP-PARTNER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Mobile     │  │   Desktop    │  │    Admin     │           │
│  │  (RN/Expo)   │  │   (Web)      │  │  Dashboard   │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         └────────────────┼────────────────┘                     │
│                          │                                       │
│                          ▼                                       │
│  ┌───────────────────────────────────────────────────────┐      │
│  │              SUPABASE BACKEND                          │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │      │
│  │  │  Auth   │ │Database │ │ Storage │ │  Edge   │     │      │
│  │  │ (RLS)   │ │(Postgres)│ │(Receipts)│ │Functions│     │      │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture (CRITICAL)

### Non-Negotiable Security Rules

```typescript
// ❌ NEVER DO THIS — Credentials exposed
const supabaseUrl = "https://xxx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI..."

// ✅ ALWAYS DO THIS — Environment variables
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'
```

### Security Implementation Checklist

#### 1. Environment Variables
```bash
# .env (NEVER COMMIT THIS FILE)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_anon_key

# .env.example (Commit this as template)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

#### 2. Supabase Row Level Security (RLS)
```sql
-- Users can only see their own data
CREATE POLICY "Users view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own data
CREATE POLICY "Users manage own properties" ON properties
  FOR ALL USING (auth.uid() = user_id);

-- Admin bypass for admin dashboard
CREATE POLICY "Admins full access" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

#### 3. API Key Management
- **ANON_KEY:** Client-side, limited by RLS policies
- **SERVICE_ROLE_KEY:** Server-side only (Edge Functions), never in client code
- **Admin actions:** Always via Edge Functions with SERVICE_ROLE_KEY

#### 4. Storage Security
```sql
-- Receipt bucket policies
CREATE POLICY "Users upload own receipts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view own receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 5. Sensitive Data Encryption
```typescript
// Encrypt sensitive financial data before storage
import * as Crypto from 'expo-crypto';

const encryptAmount = async (amount: number, userId: string) => {
  // Use user-specific salt
  const encrypted = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${amount}:${userId}:${Date.now()}`
  );
  return encrypted;
};
```

---

## Database Schema

### Core Tables

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  property_limit INTEGER DEFAULT 1,  -- Admin-controlled
  subscription_status TEXT DEFAULT 'trial' CHECK (
    subscription_status IN ('trial', 'active', 'suspended', 'cancelled')
  ),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'payment', 'suspension', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,  -- Deep link for actions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ  -- Auto-dismiss after date
);

-- ============================================
-- PROPERTIES
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  property_type TEXT CHECK (
    property_type IN ('villa', 'apartment', 'condo', 'house', 'resort', 'other')
  ),
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

CREATE TABLE property_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  rate_name TEXT NOT NULL,  -- 'Weekend Rate', 'Holiday Rate', 'Peak Season'
  rate_type TEXT CHECK (rate_type IN ('per_night', 'per_guest', 'flat')),
  amount DECIMAL(10,2) NOT NULL,
  applies_to JSONB,  -- Date ranges, days of week, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESERVATIONS & CALENDAR
-- ============================================

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Guest Information
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  guest_count INTEGER NOT NULL,
  
  -- Booking Details
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  -- Financial
  base_amount DECIMAL(10,2) NOT NULL,
  additional_fees JSONB DEFAULT '{}',  -- {excess_guests: 500, pet_fee: 300, etc.}
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  balance_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - deposit_amount) STORED,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  source TEXT CHECK (source IN ('direct', 'airbnb', 'booking', 'facebook', 'referral', 'other')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent overlapping reservations
  CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

CREATE TABLE calendar_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,  -- 'Maintenance', 'Personal Use', 'Cleaning', etc.
  is_blocked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CASHFLOW & FINANCIAL TRACKING
-- ============================================

CREATE TABLE cashflow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  
  -- Entry Details
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,  -- See category enums below
  subcategory TEXT,
  description TEXT NOT NULL,
  
  -- Financial
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  
  -- Date & Payment
  transaction_date DATE NOT NULL,
  payment_method TEXT CHECK (
    payment_method IN ('cash', 'gcash', 'maya', 'bank_transfer', 'credit_card', 'check', 'other')
  ),
  reference_number TEXT,  -- Transaction ID, check number, etc.
  
  -- Receipt Attachment
  receipt_url TEXT,  -- Supabase Storage URL
  receipt_thumbnail_url TEXT,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_config JSONB,  -- {frequency: 'monthly', next_date: '2024-02-01'}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Categories
-- 'reservation_payment', 'deposit', 'balance_payment', 'security_deposit_forfeit',
-- 'damage_fee', 'late_checkout_fee', 'extra_services', 'refund_received', 'other_income'

-- Expense Categories
-- 'utilities' (electric, water, internet, gas)
-- 'maintenance' (repairs, cleaning, landscaping)
-- 'supplies' (linens, toiletries, kitchen supplies)
-- 'staff' (housekeeping, security, caretaker)
-- 'marketing' (ads, photography, listing fees)
-- 'taxes' (property tax, income tax, permits)
-- 'insurance' (property, liability)
-- 'mortgage' (payment, interest)
-- 'improvement' (renovation, furniture, appliances)
-- 'commission' (platform fees, agent fees)
-- 'refund_issued'
-- 'other_expense'

-- ============================================
-- ADMIN TABLES
-- ============================================

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,  -- 'user', 'property', 'system'
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

### Database Indexes for Performance

```sql
-- Reservation calendar queries
CREATE INDEX idx_reservations_property_dates ON reservations(property_id, check_in, check_out);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Cashflow date range queries
CREATE INDEX idx_cashflow_property_date ON cashflow_entries(property_id, transaction_date);
CREATE INDEX idx_cashflow_type_category ON cashflow_entries(type, category);

-- User lookups
CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_notifications_user ON user_notifications(user_id, is_read);
```

---

## Feature Specifications

### Module 1: User Authentication & Onboarding

#### 1.1 Authentication Flows
```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Splash Screen (2s animation)                               │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐  Yes  ┌─────────────┐                      │
│  │ Has Token?  │──────▶│ Validate   │                       │
│  └──────┬──────┘       │   Token     │                       │
│         │ No           └──────┬──────┘                       │
│         ▼                     │                              │
│  ┌─────────────┐         ┌────┴────┐                        │
│  │   Welcome   │         │ Valid?  │                        │
│  │   Screen    │         └────┬────┘                        │
│  └──────┬──────┘              │                              │
│         │                ┌────┴────┐                        │
│         ▼           Yes  │    No   │                        │
│  ┌─────────────┐    ┌────▼────┐    │                        │
│  │ Login/Sign  │    │  Home   │◀───┘                        │
│  │    Up       │    │ Screen  │                             │
│  └─────────────┘    └─────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 Authentication Methods
- **Email/Password** with strong validation (8+ chars, special char, number)
- **Google OAuth** via Supabase
- **Apple Sign-In** (required for iOS App Store)
- **Phone OTP** (future: GCash/Maya integration potential)

#### 1.3 Welcome & Onboarding Screens

**Screen 1: Welcome**
```
┌────────────────────────────────────┐
│                                    │
│         [Animated Logo]            │
│                                    │
│      "Your Properties,            │
│       Perfectly Managed"          │
│                                    │
│   [  Get Started  ]               │
│                                    │
│   Already have an account?        │
│         [Log In]                  │
│                                    │
└────────────────────────────────────┘
```

**Onboarding Carousel (First-time users)**
- Slide 1: "See Everything at a Glance" — Calendar preview
- Slide 2: "Track Every Peso" — Cashflow dashboard
- Slide 3: "Manage Multiple Properties" — Property grid
- Slide 4: "Beautiful Reports" — Export preview

---

### Module 2: Property Management

#### 2.1 Property List View (Home)

```
┌────────────────────────────────────┐
│ ≡  RP-Partner         [🔔] [👤]    │
├────────────────────────────────────┤
│                                    │
│  Good morning, Ian! 👋             │
│  You have 3 properties            │
│                                    │
│  ┌────────────────────────────┐   │
│  │ 📸 Cover Image             │   │
│  │ ┌──────────────────────┐   │   │
│  │ │   Casa Dael Villa    │   │   │
│  │ │   Antipolo, Rizal    │   │   │
│  │ │                      │   │   │
│  │ │   🗓️ 12 Bookings      │   │   │
│  │ │   💰 ₱89,500 MTD     │   │   │
│  │ │                      │   │   │
│  │ │   ● 3 Upcoming       │   │   │
│  │ │   ○ Next: Dec 28-30  │   │   │
│  │ └──────────────────────┘   │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ [Second Property Card]     │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ [ + Add Property ]         │   │
│  │ (Limit: 3/5 properties)   │   │
│  └────────────────────────────┘   │
│                                    │
├────────────────────────────────────┤
│  🏠    📅    💰    📊    ⋮        │
│ Home  Cal  Cash  Stats More       │
└────────────────────────────────────┘
```

#### 2.2 Property Detail View

**Tab Structure:**
1. **Overview** — Quick stats, upcoming bookings, recent activity
2. **Calendar** — Full booking calendar with blocking
3. **Cashflow** — Property-specific income/expenses
4. **Settings** — Rates, amenities, property details

#### 2.3 Add/Edit Property Form

```typescript
interface PropertyForm {
  // Basic Info
  name: string;              // Required
  description?: string;
  property_type: PropertyType;
  
  // Location
  address: string;
  city: string;
  province: string;
  
  // Capacity & Pricing
  max_guests: number;
  base_rate: number;         // Per night
  
  // Media
  cover_image?: File;
  gallery?: File[];          // Max 10 images
  
  // Amenities (Multi-select)
  amenities: string[];       // ['pool', 'wifi', 'aircon', 'kitchen', etc.]
}
```

---

### Module 3: Calendar & Reservations

#### 3.1 Calendar Views

**Monthly View (Default)**
```
┌────────────────────────────────────┐
│ ←  December 2025  →    [Filter ▼] │
├────────────────────────────────────┤
│  S   M   T   W   T   F   S        │
├────────────────────────────────────┤
│      1   2   3   4   5   6        │
│                  ███████████      │  ← Booking spans
│  7   8   9  10  11  12  13        │
│  ██████████████████████████      │  ← Another booking
│ 14  15  16  17  18  19  20        │
│          ████████                 │  ← Short stay
│ 21  22  23  24  25  26  27        │
│              ░░░░░░               │  ← Blocked dates
│ 28  29  30  31                    │
│                                    │
├────────────────────────────────────┤
│  Legend:                           │
│  ██ Confirmed  ▓▓ Pending  ░░ Blocked│
│                                    │
│  [ + New Reservation ]            │
│  [ 🚫 Block Dates ]               │
└────────────────────────────────────┘
```

**Agenda View**
```
┌────────────────────────────────────┐
│ Upcoming Reservations              │
├────────────────────────────────────┤
│                                    │
│  TODAY • Dec 27                    │
│  ┌────────────────────────────┐   │
│  │ ● Juan Dela Cruz           │   │
│  │   Dec 27 - Dec 29 (2N)     │   │
│  │   4 guests • ₱12,000       │   │
│  │   Via: Facebook            │   │
│  │   [View] [Message]         │   │
│  └────────────────────────────┘   │
│                                    │
│  SATURDAY • Dec 28                 │
│  ┌────────────────────────────┐   │
│  │ ○ Maria Santos (Pending)   │   │
│  │   Dec 28 - Jan 1 (4N)      │   │
│  │   8 guests • ₱24,000       │   │
│  │   [Confirm] [Decline]      │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

#### 3.2 Reservation Form

```typescript
interface ReservationForm {
  // Guest Info
  guest_name: string;        // Required
  guest_phone: string;       // Philippine format validation
  guest_email?: string;
  guest_count: number;       // Required
  
  // Dates
  check_in: Date;            // Required
  check_out: Date;           // Required
  
  // Source
  source: 'direct' | 'airbnb' | 'booking' | 'facebook' | 'referral' | 'other';
  
  // Pricing (Auto-calculated from property rates)
  base_amount: number;
  additional_fees: {
    excess_guests?: number;
    pet_fee?: number;
    early_checkin?: number;
    late_checkout?: number;
    cleaning_fee?: number;
    [key: string]: number;
  };
  
  // Payment
  deposit_amount: number;
  deposit_paid: boolean;
  
  // Notes
  notes?: string;
}
```

#### 3.3 Calendar Blocking

**Block Dates Modal**
- Date range picker
- Reason dropdown: Personal Use, Maintenance, Cleaning, Renovation, Other
- Custom notes field
- Recurring block option (e.g., every Sunday for maintenance)

---

### Module 4: Cashflow Management

#### 4.1 Cashflow Dashboard

```
┌────────────────────────────────────┐
│ ← Cashflow          [Export 📤]    │
├────────────────────────────────────┤
│                                    │
│  ┌──────────┐ ┌──────────┐        │
│  │ INCOME   │ │ EXPENSES │        │
│  │ ₱125,500 │ │ ₱23,450  │        │
│  │   ↑12%   │ │   ↓5%    │        │
│  └──────────┘ └──────────┘        │
│                                    │
│  ┌────────────────────────────┐   │
│  │      NET PROFIT            │   │
│  │      ₱102,050              │   │
│  │   ██████████████░░░░░░░░   │   │
│  │   81% margin               │   │
│  └────────────────────────────┘   │
│                                    │
│  [Dec 2025 ▼]  [All Properties ▼] │
│                                    │
├────────────────────────────────────┤
│  RECENT TRANSACTIONS              │
│                                    │
│  ┌────────────────────────────┐   │
│  │ 🟢 Booking - Juan         │   │
│  │    Casa Dael • Dec 27     │   │
│  │    +₱12,000    📎         │   │  ← Receipt attached
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ 🔴 Electric Bill          │   │
│  │    Casa Dael • Dec 26     │   │
│  │    -₱4,520     📎         │   │
│  └────────────────────────────┘   │
│                                    │
│  [ + Add Income ]  [ + Add Expense]│
│                                    │
└────────────────────────────────────┘
```

#### 4.2 Add Entry Form

```typescript
interface CashflowEntryForm {
  type: 'income' | 'expense';
  
  // Entry Details
  category: string;          // From predefined list
  subcategory?: string;
  description: string;       // Required
  amount: number;            // Required
  
  // Date & Payment
  transaction_date: Date;    // Defaults to today
  payment_method: PaymentMethod;
  reference_number?: string;
  
  // Receipt
  receipt?: {
    file: File;              // Image capture or gallery
    thumbnail?: string;      // Auto-generated
  };
  
  // Metadata
  tags?: string[];
  notes?: string;
  
  // Link to reservation (for income)
  reservation_id?: string;
  
  // Recurring
  is_recurring?: boolean;
  recurring_config?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    end_date?: Date;
  };
}
```

#### 4.3 Receipt Attachment Flow

```
┌────────────────────────────────────┐
│  Attach Receipt                    │
├────────────────────────────────────┤
│                                    │
│  ┌────────────┐ ┌────────────┐    │
│  │ 📷 Camera  │ │ 🖼️ Gallery │    │
│  │            │ │            │    │
│  │ Take Photo │ │ Choose     │    │
│  └────────────┘ └────────────┘    │
│                                    │
│  Preview:                          │
│  ┌────────────────────────────┐   │
│  │                            │   │
│  │    [Receipt Preview]       │   │
│  │                            │   │
│  │    [🔄 Retake] [✓ Use]     │   │
│  └────────────────────────────┘   │
│                                    │
│  Auto-detected:                    │
│  • Amount: ₱4,520                  │
│  • Date: Dec 26, 2025              │
│  • Vendor: Meralco                 │
│                                    │
└────────────────────────────────────┘
```

**Receipt Processing:**
1. Image capture via camera or gallery selection
2. Compress image for storage efficiency (max 1MB)
3. Generate thumbnail for list display
4. Upload to Supabase Storage with user-scoped path
5. (Future v2: OCR for auto-extraction of amount, date, vendor)

#### 4.4 Export Function

**Export Options:**
- **Format:** PDF, Excel (XLSX), CSV
- **Date Range:** Custom, This Month, Last Month, This Quarter, This Year, All Time
- **Property Filter:** All Properties, Specific Property
- **Content:** Summary Only, Detailed with Receipts, Raw Data

**PDF Report Structure:**
1. Cover page with property name & period
2. Executive summary (total income, expenses, net profit)
3. Income breakdown by category
4. Expense breakdown by category
5. Monthly trend charts
6. Detailed transaction list
7. Receipt appendix (thumbnails with references)

---

### Module 5: Analytics & Reports

#### 5.1 Dashboard Stats

```
┌────────────────────────────────────┐
│ Analytics         [Date Range ▼]   │
├────────────────────────────────────┤
│                                    │
│  OCCUPANCY RATE                    │
│  ┌────────────────────────────┐   │
│  │   78%    ↑ 12% vs LM       │   │
│  │   ████████████░░░░░        │   │
│  │   23/30 nights booked      │   │
│  └────────────────────────────┘   │
│                                    │
│  AVERAGE DAILY RATE                │
│  ┌────────────────────────────┐   │
│  │   ₱5,435                   │   │
│  │   ↑ ₱450 vs last month     │   │
│  └────────────────────────────┘   │
│                                    │
│  BOOKING SOURCES                   │
│  ┌────────────────────────────┐   │
│  │   [Pie Chart]              │   │
│  │   Direct: 45%              │   │
│  │   Facebook: 30%            │   │
│  │   Airbnb: 15%              │   │
│  │   Referral: 10%            │   │
│  └────────────────────────────┘   │
│                                    │
│  REVENUE TREND                     │
│  ┌────────────────────────────┐   │
│  │   [Line Chart - 6 months]  │   │
│  │                            │   │
│  │   ╱╲    ╱──╲               │   │
│  │  ╱  ╲__╱    ╲__╱╲          │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

#### 5.2 Key Metrics

**Operational Metrics:**
- Occupancy Rate (%)
- Average Daily Rate (ADR)
- Revenue Per Available Night (RevPAN)
- Average Length of Stay
- Booking Lead Time
- Cancellation Rate

**Financial Metrics:**
- Total Revenue
- Total Expenses
- Net Operating Income
- Profit Margin (%)
- Month-over-Month Growth
- Year-over-Year Comparison

**Guest Metrics:**
- Total Guests Hosted
- Repeat Guest Rate
- Average Party Size
- Top Booking Sources

---

### Module 6: Admin Dashboard (Web)

#### 6.1 Admin Authentication
- Separate admin login portal
- Role-based access (super_admin, admin, support)
- 2FA required for admin accounts
- Session timeout after 30 minutes of inactivity

#### 6.2 Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔷 RP-Partner Admin                    [🔔] [Admin Name ▼]     │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                        │
│  MENU   │  Dashboard Overview                                   │
│         │  ───────────────────────────────────────────          │
│ 📊 Dash │                                                        │
│ 👥 Users│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ 🏠 Props│  │ TOTAL USERS │ │ PROPERTIES  │ │ REVENUE MTD │     │
│ 💰 Subs │  │    1,234    │ │    3,456    │ │ ₱2.4M       │     │
│ 🔔 Notif│  │  ↑ 12 new   │ │  ↑ 45 new   │ │  ↑ 18%      │     │
│ ⚙️ Sett │  └─────────────┘ └─────────────┘ └─────────────┘     │
│ 📝 Logs │                                                        │
│         │  Recent Activity                                       │
│         │  ───────────────────────────────────────────          │
│         │  • New user: maria@email.com (2 min ago)              │
│         │  • Property limit increased: user_123 (5 min ago)     │
│         │  • Suspension warning sent: user_456 (1 hr ago)       │
│         │                                                        │
│         │  Users Requiring Attention                            │
│         │  ───────────────────────────────────────────          │
│         │  ┌────────────────────────────────────────────┐       │
│         │  │ 🔴 John Doe • Subscription expired 5 days  │       │
│         │  │    [Send Warning] [Suspend] [View]         │       │
│         │  └────────────────────────────────────────────┘       │
│         │                                                        │
└─────────┴───────────────────────────────────────────────────────┘
```

#### 6.3 User Management

```
┌─────────────────────────────────────────────────────────────────┐
│  User Management                      [+ Add User] [Export]      │
├─────────────────────────────────────────────────────────────────┤
│  Search: [________________________] [Status ▼] [Date ▼]         │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 👤 │ Name       │ Email           │ Props │ Status   │ ⋮ │  │
│  ├────┼────────────┼─────────────────┼───────┼──────────┼───┤  │
│  │ 🟢 │ Ian Santos │ ian@email.com   │ 3/5   │ Active   │ ⋮ │  │
│  │ 🟡 │ Maria Cruz │ maria@email.com │ 1/1   │ Trial    │ ⋮ │  │
│  │ 🔴 │ Juan Reyes │ juan@email.com  │ 2/3   │ Suspended│ ⋮ │  │
│  │ 🟢 │ Ana Lim    │ ana@email.com   │ 5/5   │ Active   │ ⋮ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Previous] Page 1 of 12 [Next]                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.4 User Detail / Edit Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  User Details: Ian Santos                              [✕]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACCOUNT INFO                                                    │
│  Email: ian@email.com                                           │
│  Phone: +63 917 123 4567                                        │
│  Joined: October 15, 2024                                       │
│  Last Active: 2 hours ago                                       │
│                                                                  │
│  SUBSCRIPTION                                                    │
│  Status: [Active ▼]                                             │
│  Property Limit: [  5  ▼]  (Currently using: 3)                 │
│  Expires: [February 28, 2025]                                   │
│                                                                  │
│  PROPERTIES (3)                                                  │
│  • Casa Dael Villa (₱89,500 MTD)                                │
│  • Beach House Batangas (₱45,200 MTD)                           │
│  • Tagaytay Retreat (₱32,100 MTD)                               │
│                                                                  │
│  ACTIONS                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ 📧 Send     │ │ ⚠️ Warning  │ │ 🚫 Suspend  │               │
│  │ Notification│ │             │ │             │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ACTIVITY LOG                                                    │
│  • Dec 26: Added reservation (Casa Dael)                        │
│  • Dec 25: Logged expense ₱4,520                                │
│  • Dec 24: Changed property rates                               │
│                                                                  │
│  [Save Changes]                              [Cancel]            │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.5 Send Notification Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Send Notification                                      [✕]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  To: Ian Santos (ian@email.com)                                 │
│                                                                  │
│  Type: [Payment Reminder ▼]                                     │
│        • Info                                                    │
│        • Warning                                                 │
│        • Payment Reminder                                        │
│        • Suspension Notice                                       │
│        • System Update                                           │
│                                                                  │
│  Title:                                                          │
│  [Payment Reminder                                    ]          │
│                                                                  │
│  Message:                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Your subscription expires in 3 days. Please renew to   │    │
│  │ continue managing your properties.                      │    │
│  │                                                         │    │
│  │ Payment details: [Bank/GCash info]                     │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Action Button (Optional):                                       │
│  [ ] Include action button                                       │
│      Label: [____________]  Deep Link: [____________]           │
│                                                                  │
│  Expires: [ ] Never  [○] After [7] days                         │
│                                                                  │
│  [Preview]                           [Send Notification]         │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.6 Admin Actions & Audit Log

All admin actions are logged:
- User property limit changes
- Subscription status changes
- Notifications sent
- Suspensions/reactivations
- System setting changes

---

## Technical Implementation

### Project Structure

```
rp-partner/
├── apps/
│   ├── mobile/                    # React Native (Expo)
│   │   ├── app/                   # Expo Router file-based routing
│   │   │   ├── (auth)/            # Auth screens group
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── forgot-password.tsx
│   │   │   ├── (tabs)/            # Main tab navigation
│   │   │   │   ├── index.tsx      # Home/Properties
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── cashflow.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   └── more.tsx
│   │   │   ├── property/          # Property screens
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── calendar.tsx
│   │   │   │   │   ├── cashflow.tsx
│   │   │   │   │   └── settings.tsx
│   │   │   │   └── add.tsx
│   │   │   ├── reservation/
│   │   │   │   ├── [id].tsx
│   │   │   │   └── add.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ...
│   │   │   ├── calendar/
│   │   │   │   ├── MonthView.tsx
│   │   │   │   ├── AgendaView.tsx
│   │   │   │   ├── BookingBar.tsx
│   │   │   │   └── DatePicker.tsx
│   │   │   ├── cashflow/
│   │   │   │   ├── EntryCard.tsx
│   │   │   │   ├── CategoryPicker.tsx
│   │   │   │   ├── ReceiptCapture.tsx
│   │   │   │   └── ExportModal.tsx
│   │   │   └── property/
│   │   │       ├── PropertyCard.tsx
│   │   │       └── PropertyForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProperties.ts
│   │   │   ├── useReservations.ts
│   │   │   ├── useCashflow.ts
│   │   │   └── useNotifications.ts
│   │   ├── services/
│   │   │   ├── supabase.ts        # Supabase client (uses env vars)
│   │   │   ├── auth.ts
│   │   │   ├── properties.ts
│   │   │   ├── reservations.ts
│   │   │   ├── cashflow.ts
│   │   │   └── storage.ts
│   │   ├── stores/                # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── propertyStore.ts
│   │   │   └── uiStore.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts      # Currency, date formatting
│   │   │   ├── validators.ts      # Form validation
│   │   │   ├── helpers.ts
│   │   │   └── constants.ts
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── app.json
│   │   ├── eas.json               # EAS Build config
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── admin/                     # Admin Dashboard (Next.js)
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx       # Dashboard home
│       │   │   ├── users/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [id]/
│       │   │   ├── properties/
│       │   │   ├── subscriptions/
│       │   │   ├── notifications/
│       │   │   ├── settings/
│       │   │   └── logs/
│       │   └── api/               # API routes if needed
│       ├── components/
│       ├── lib/
│       └── package.json
│
├── packages/                      # Shared packages
│   ├── database/                  # DB types, migrations
│   │   ├── migrations/
│   │   ├── seed/
│   │   └── types.ts
│   ├── shared/                    # Shared utilities
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── validators.ts
│   └── ui/                        # Shared UI (future)
│
├── supabase/
│   ├── migrations/                # SQL migrations
│   ├── functions/                 # Edge Functions
│   │   ├── admin-actions/
│   │   ├── send-notification/
│   │   └── generate-report/
│   ├── seed.sql
│   └── config.toml
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── .github/
│   └── workflows/
│       ├── mobile-build.yml
│       └── admin-deploy.yml
│
├── .gitignore
├── package.json                   # Monorepo root
└── README.md
```

### Key Dependencies

```json
// Mobile App (apps/mobile/package.json)
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-camera": "~16.0.0",
    "expo-file-system": "~18.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-haptics": "~14.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "zustand": "^5.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-calendars": "^1.1300.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-pdf": "^6.7.0",
    "date-fns": "^4.1.0",
    "zod": "^3.24.0",
    "react-hook-form": "^7.54.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "^5.3.0",
    "react-native-dotenv": "^3.4.0"
  }
}

// Admin Dashboard (apps/admin/package.json)
{
  "dependencies": {
    "next": "15.1.0",
    "react": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.0",
    "tailwindcss": "^3.4.0",
    "shadcn/ui": "latest",
    "recharts": "^2.15.0",
    "date-fns": "^4.1.0",
    "zod": "^3.24.0",
    "react-hook-form": "^7.54.0"
  }
}
```

### Environment Setup

```bash
# .env.example (Mobile)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env.example (Admin)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

### Supabase Edge Functions

```typescript
// supabase/functions/admin-actions/index.ts
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // Server-side only
  )

  // Verify admin role
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  )
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Process admin action
  const { action, payload } = await req.json()
  
  switch (action) {
    case 'update_property_limit':
      // ... implementation
      break
    case 'update_subscription_status':
      // ... implementation
      break
    case 'send_notification':
      // ... implementation
      break
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
  }

  // Log admin action
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action,
    details: payload,
    ip_address: req.headers.get('x-forwarded-for')
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (monorepo, Expo, Next.js)
- [ ] Supabase project configuration
- [ ] Database schema creation with migrations
- [ ] Row Level Security policies
- [ ] Authentication flows (mobile + admin)
- [ ] Basic UI component library

### Phase 2: Core Features (Weeks 3-5)
- [ ] Property CRUD operations
- [ ] Calendar views (month, agenda)
- [ ] Reservation management
- [ ] Calendar blocking
- [ ] Basic cashflow entry (income/expense)

### Phase 3: Financial Features (Weeks 6-7)
- [ ] Receipt capture & storage
- [ ] Cashflow dashboard
- [ ] Basic analytics/stats
- [ ] Export functionality (PDF, Excel, CSV)

### Phase 4: Admin Dashboard (Weeks 8-9)
- [ ] Admin authentication & authorization
- [ ] User management CRUD
- [ ] Property limit controls
- [ ] Subscription status management
- [ ] Notification system
- [ ] Audit logging

### Phase 5: Polish & Testing (Week 10)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Testing (unit, integration, E2E)
- [ ] Bug fixes

### Phase 6: Deployment (Week 11)
- [ ] APK build & signing
- [ ] Admin dashboard deployment (Vercel)
- [ ] Production Supabase setup
- [ ] Documentation
- [ ] Beta testing

---

## Future Roadmap (v2.0+)

### Planned Features
1. **OCR Receipt Scanning** — Auto-extract amount, date, vendor from receipts
2. **Push Notifications** — Booking reminders, payment due, etc.
3. **Team Management** — Add staff with role-based permissions
4. **Guest Portal** — Self-service booking for repeat guests
5. **Automated Messaging** — WhatsApp/Messenger integration
6. **Channel Manager** — Sync with Airbnb, Booking.com
7. **iOS App Store Release**
8. **Smart Pricing** — AI-powered dynamic pricing suggestions
9. **Maintenance Scheduling** — Recurring task management
10. **Financial Forecasting** — Predictive revenue analytics

### Integration Roadmap
- GCash/Maya payment tracking
- QuickBooks/Xero export
- Google Calendar sync
- Property listing platforms

---

## Appendix

### A. Category Enums

```typescript
// Income Categories
export const INCOME_CATEGORIES = [
  { value: 'reservation_payment', label: 'Reservation Payment', icon: '🏠' },
  { value: 'deposit', label: 'Deposit Received', icon: '💳' },
  { value: 'balance_payment', label: 'Balance Payment', icon: '💰' },
  { value: 'security_deposit_forfeit', label: 'Security Deposit Forfeit', icon: '🔒' },
  { value: 'damage_fee', label: 'Damage Fee', icon: '🔧' },
  { value: 'late_checkout_fee', label: 'Late Checkout Fee', icon: '⏰' },
  { value: 'extra_services', label: 'Extra Services', icon: '✨' },
  { value: 'refund_received', label: 'Refund Received', icon: '↩️' },
  { value: 'other_income', label: 'Other Income', icon: '📥' },
] as const;

// Expense Categories
export const EXPENSE_CATEGORIES = [
  { value: 'utilities', label: 'Utilities', icon: '💡', subcategories: ['Electric', 'Water', 'Internet', 'Gas'] },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧', subcategories: ['Repairs', 'Cleaning', 'Landscaping', 'Pool'] },
  { value: 'supplies', label: 'Supplies', icon: '🧴', subcategories: ['Linens', 'Toiletries', 'Kitchen', 'Cleaning'] },
  { value: 'staff', label: 'Staff', icon: '👥', subcategories: ['Housekeeping', 'Security', 'Caretaker', 'Laundry'] },
  { value: 'marketing', label: 'Marketing', icon: '📢', subcategories: ['Ads', 'Photography', 'Listing Fees'] },
  { value: 'taxes', label: 'Taxes', icon: '📋', subcategories: ['Property Tax', 'Income Tax', 'Permits'] },
  { value: 'insurance', label: 'Insurance', icon: '🛡️', subcategories: ['Property', 'Liability'] },
  { value: 'mortgage', label: 'Mortgage', icon: '🏦', subcategories: ['Payment', 'Interest'] },
  { value: 'improvement', label: 'Improvement', icon: '🏗️', subcategories: ['Renovation', 'Furniture', 'Appliances'] },
  { value: 'commission', label: 'Commission', icon: '💸', subcategories: ['Platform Fees', 'Agent Fees'] },
  { value: 'refund_issued', label: 'Refund Issued', icon: '↪️' },
  { value: 'other_expense', label: 'Other Expense', icon: '📤' },
] as const;
```

### B. Amenity Options

```typescript
export const AMENITIES = [
  { value: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'aircon', label: 'Air Conditioning', icon: '❄️' },
  { value: 'kitchen', label: 'Full Kitchen', icon: '🍳' },
  { value: 'parking', label: 'Parking', icon: '🚗' },
  { value: 'videoke', label: 'Videoke', icon: '🎤' },
  { value: 'bbq', label: 'BBQ Grill', icon: '🔥' },
  { value: 'garden', label: 'Garden', icon: '🌳' },
  { value: 'tv', label: 'Smart TV', icon: '📺' },
  { value: 'washer', label: 'Washer', icon: '🧺' },
  { value: 'security', label: '24/7 Security', icon: '🔐' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'jacuzzi', label: 'Jacuzzi', icon: '🛁' },
  { value: 'balcony', label: 'Balcony', icon: '🌅' },
  { value: 'pet_friendly', label: 'Pet Friendly', icon: '🐕' },
] as const;
```

### C. Payment Methods

```typescript
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'gcash', label: 'GCash', icon: '🟢' },
  { value: 'maya', label: 'Maya', icon: '🟣' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'check', label: 'Check', icon: '📝' },
  { value: 'other', label: 'Other', icon: '💱' },
] as const;
```

### D. Booking Sources

```typescript
export const BOOKING_SOURCES = [
  { value: 'direct', label: 'Direct Booking', icon: '📞' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'airbnb', label: 'Airbnb', icon: '🏠' },
  { value: 'booking', label: 'Booking.com', icon: '🅱️' },
  { value: 'referral', label: 'Referral', icon: '👥' },
  { value: 'other', label: 'Other', icon: '📋' },
] as const;
```

---

## Notes for Claude Code

### Critical Instructions
1. **Security First:** Never hardcode credentials. Always use environment variables.
2. **RLS Required:** Every table must have Row Level Security policies.
3. **TypeScript Strict:** Use strict TypeScript for type safety.
4. **Component Reuse:** Build atomic, reusable components.
5. **Offline Capability:** Consider offline-first patterns for mobile.
6. **Performance:** Lazy load screens, optimize images, minimize re-renders.

### Design Guidelines
- Follow the color palette defined in Design Philosophy
- Maintain consistent 8px spacing grid
- Use Reanimated for 60fps animations
- Implement proper loading states and skeleton screens
- Handle error states gracefully with retry options

### Testing Strategy
- Unit tests for utility functions and hooks
- Integration tests for Supabase queries
- E2E tests for critical user flows
- Security testing for RLS policies

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Author:** RP-Partner Team
