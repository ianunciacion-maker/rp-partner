# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rental property management platform for Filipino property owners, branded as **Tuknang**. Monorepo containing an Expo React Native app (with web support) and a Next.js admin dashboard.

## Commands

```bash
# Development (from root)
npm run mobile              # Start Expo dev server
npm run admin               # Start Next.js admin on port 3001

# Mobile app (from apps/mobile)
npx expo start --clear      # Clear cache and start
npx expo start --web        # Run web version locally
npx expo start --android    # Run on Android
npx expo start --ios        # Run on iOS

# Admin app (from apps/admin)
npm run dev                 # Start Next.js dev server on port 3001
npm run build               # Build for production

# Builds
npm run mobile:build        # Web export for Vercel deployment (from root)
npx eas build --platform android  # Android build (from apps/mobile)
npx eas build --platform ios      # iOS build (from apps/mobile)

# Code quality (from apps/mobile)
npm run lint               # Run ESLint
npm run test               # Run Jest tests
npm run test -- --testPathPattern="filename"  # Run single test file

# Code quality (from apps/admin)
npm run lint               # Run Next.js ESLint

# Database
# Apply migrations via Supabase Dashboard SQL Editor
# Migration files in supabase/migrations/

# Edge Functions (from project root)
npx supabase functions serve   # Local development
npx supabase functions deploy <function-name>  # Deploy single function

```

## Environment Setup

**Mobile app**: Copy `apps/mobile/.env.example` to `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Admin app**: Create `apps/admin/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for admin operations
```

## Architecture

### Monorepo Structure
- `apps/mobile/` - Expo React Native app (main user-facing app)
- `apps/admin/` - Next.js admin dashboard (port 3001, Tailwind CSS)
- `apps/website/` - Placeholder/unused
- `supabase/migrations/` - PostgreSQL migrations (numbered 001-008, continue sequence for new migrations)
- `supabase/functions/` - Supabase Edge Functions (check-subscriptions, send-payment-reminders, get-shared-calendar)

### Tech Stack
- **Mobile/Web**: Expo SDK ~54.0, React Native 0.81.5, React 19, expo-router 6.x with typed routes
- **Admin**: Next.js ^16.1, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Storage, Edge Functions)
- **State**: Zustand (no persist middleware - auth uses SecureStore on native, localStorage on web)
- **Forms**: react-hook-form + zod validation
- **Dates**: date-fns v4
- **Deploy**: Vercel (web), EAS (native)

Note: Mobile app is not in npm workspaces (managed separately). Only `apps/admin` and `packages/*` are workspaced.

### Path Aliases
Use `@/` prefix for imports from the mobile app root:
```typescript
import { supabase } from '@/services/supabase';
import { Colors } from '@/constants/theme';
import type { Property } from '@/types/database';
```

### Navigation Structure (Mobile)
expo-router file-based routing with route groups:
- `(auth)/` - Unauthenticated screens (welcome, login, register)
- `(tabs)/` - Main tab navigation (properties, calendar, cashflow, more)
- `property/[id]`, `reservation/[id]`, `cashflow/[id]` - Detail screens
- `property/[id]/calendar` - Property-specific calendar with share feature
- `cashflow/dashboard` - Cashflow analytics dashboard
- `share/[token]` - Public shareable calendar view (no auth required)
- `reset-password` - Password reset flow (root level, handles deep links)
- `settings/`, `subscription/` - User settings and subscription management

### Navigation Structure (Admin)
Next.js App Router with route groups:
- `/login` - Admin authentication
- `(dashboard)/` - Authenticated admin pages (dashboard, users, payments)
- `(dashboard)/users/[id]` - User detail/management
- `(dashboard)/payments/[id]` - Payment detail

Admin routes are protected by `middleware.ts` which checks for a valid session AND `role === 'admin'` in the users table. Non-admin users are signed out and redirected to `/login`.

### Admin Supabase Clients
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';
// supabase - anon key for client-side operations
// supabaseAdmin - service role key for server-side operations (bypasses RLS)
```

### Path Aliases (Admin)
Admin app uses `@/` prefix pointing to `src/`:
```typescript
import { supabase } from '@/lib/supabase';  // apps/admin/src/lib/supabase.ts
```

### Database Types
Types are manually defined in `apps/mobile/types/database.ts` mirroring Supabase schema. The `Database` interface provides full typing for Supabase client:
```typescript
import type { Database } from '@/types/database';
const supabase = createClient<Database>(url, key);
```

Type aliases: `User`, `Property`, `Reservation`, `CashflowEntry`, `LockedDate`, `SubscriptionPlan`, `PaymentMethod`, `Subscription`, `PaymentSubmission`, `SubscriptionReminder`, `CalendarShareToken`
Joined types: `SubscriptionWithPlan`, `PaymentSubmissionWithDetails`
Mutation types: `InsertTables<T>`, `UpdateTables<T>`

### Auth Flow
1. `services/supabase.ts` - Supabase client with platform-aware storage (SecureStore on native, localStorage on web, SSR-safe)
2. `stores/authStore.ts` - Zustand store managing session state with `isInitialized` flag
3. `app/_layout.tsx` - Root layout that initializes auth and shows loading state
4. `app/index.tsx` - Redirects based on auth state

### Storage
Images (property covers, receipts) uploaded to Supabase Storage. Paths: `{userId}/{propertyId}/cover.{ext}`

### Reservation Date Constraints
Database enforces no overlapping reservations using PostgreSQL exclusion constraint with `btree_gist` extension. The `[)` range means check-out day can be another guest's check-in day.

### Shareable Calendar
Property owners can generate public share links for their calendar:
- **URL format**: `/share/{token}` - Works on web without authentication
- **Token storage**: `calendar_share_tokens` table with RLS (owners manage their own tokens)
- **Edge function**: `get-shared-calendar` fetches calendar data using service role key (bypasses RLS)
- **Month limits**: Based on owner's subscription (Free: ±2 months, Paid: unlimited, -1 = unlimited)
- **Services**: `services/shareCalendar.ts` - createShareToken, fetchSharedCalendar, getShareUrl, revokeShareToken
- **Components**: `SharedCalendarView.tsx` - Standalone calendar component for public view

### Subscription System
The subscription system uses a manual payment verification flow (GCash/bank transfer screenshots reviewed by admin):
- **States**: `none`, `active`, `expiring_soon`, `grace_period`, `expired`, `payment_pending`
- **Billing**: 30-day cycles with 3-day grace period after expiration
- **Feature limits**: Calendar month access, report export months, and property count are controlled by subscription plan or user-level overrides
- **User overrides**: Admins can grant users specific limits via `calendar_months_override`, `report_months_override`, `property_limit` (-1 = unlimited)
- **Store**: `stores/subscriptionStore.ts` - Manages subscription state and feature access checks

## Code Style

### Naming Conventions
- Components: PascalCase (`Button`, `LoginScreen`). Files: PascalCase for components, lowercase-hyphenated for utilities.
- Functions/variables: camelCase. Constants: PascalCase (`Colors`, `Spacing`) or UPPER_SNAKE_CASE (`PROPERTY_TYPES`).
- Type definitions: PascalCase (`ButtonProps`, `AuthState`).
- Default exports for screen components, named exports for reusable UI components.

### Comments
Do NOT add comments unless explicitly requested. Code should be self-documenting through clear naming.

### Import Order
React imports → third-party imports → internal `@/` modules. Use `import type` for pure type imports.

## Code Patterns

### Form Patterns
**react-hook-form + zod** (preferred for complex forms):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* ... */ });
const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});
```

**Controlled inputs + useState** (simpler forms):
```typescript
const [form, setForm] = useState({ name: '', email: '' });
const [errors, setErrors] = useState<Record<string, string>>({});
const updateForm = (key: string, value: string) => {
  setForm(prev => ({ ...prev, [key]: value }));
  if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
};
```

### Supabase Queries
Always scope queries by property ownership (RLS enforces this server-side but be explicit):
```typescript
const { data } = await supabase
  .from('reservations')
  .select('*')
  .eq('property_id', propertyId);
```

### Date Handling
Use date-fns and work with Date objects. Store dates as ISO strings in database. Be careful with timezone handling - the app uses local dates for display.

### UI Components (Mobile)
Reusable components in `components/ui/` (Button, Input, Select, Modal) follow the design system in `constants/theme.ts`. Use design tokens (Colors, Spacing, Typography, BorderRadius, Shadows) instead of hardcoded values. Spacing scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48). StyleSheet definitions go at the bottom of component files.

### Responsive Design (Mobile)
The theme includes responsive utilities for cross-platform layouts:
```typescript
import { Breakpoints, getResponsiveValue } from '@/constants/theme';
// Breakpoints: mobile (640px), tablet (1024px), desktop (1280px)
const padding = getResponsiveValue({ mobile: 16, tablet: 24, desktop: 32 }, screenWidth);
```

### UI Patterns (Admin)
Use `cn()` utility from `lib/utils.ts` for conditional Tailwind classes:
```typescript
import { cn } from '@/lib/utils';
<div className={cn('base-classes', condition && 'conditional-classes')} />
```

### Platform-Specific Code
```typescript
const isWeb = Platform.OS === 'web';
// Alerts: window.alert for web, Alert.alert for native
// Auth storage: localStorage on web, expo-secure-store on native
// Deep links: rp-partner:// scheme for native
```

### Navigation
```typescript
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/path');    // Navigate
router.back();           // Go back
router.replace('/path'); // Replace (use for web redirects)
```

### Common Mobile UI Patterns
- Loading: `<ActivityIndicator size="large" color={Colors.primary.teal} />`
- Pull-to-refresh: `<RefreshControl refreshing={isRefreshing} onRefresh={...} />`
- Empty states: centered content with icon, title, text, and CTA button
- FAB: absolute positioning with `Shadows.lg`
- Web cursor: `Platform.OS === 'web' && ({ cursor: 'pointer' } as any)`
- Screen refresh on focus: `useFocusEffect` with `useCallback`

## Important Constraints

- **PHP currency**: All amounts displayed in Philippine Peso (₱) with `toLocaleString()`
- **Property limits**: Users have configurable `property_limit` based on subscription
- **RLS enabled**: All tables have Row Level Security - users only see their own data
- **Date-only reservations**: check_in/check_out are DATE type, not timestamps - avoid timezone math
- **Typed routes**: expo-router typed routes enabled - use type-safe navigation
- **No reanimated in Expo Go**: Worklets version mismatch prevents react-native-reanimated animations in Expo Go

## Troubleshooting

- **Tests fail with "jest not found"**: Jest is configured in scripts but may need to be installed: `cd apps/mobile && npm install --save-dev jest @types/jest`
- **Metro bundler cache issues**: Run `npx expo start --clear` to clear bundler cache
- **Supabase type mismatches**: Types in `types/database.ts` are manually maintained - update when database schema changes
