# RP-Partner

Rental property management platform for Filipino property owners.

## Architecture

- **Monorepo**: npm workspaces with `apps/` and `packages/`
- **Mobile**: React Native (Expo SDK 54) with expo-router 6.x
- **Admin**: Next.js 15 with App Router (planned)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State**: Zustand with persist middleware

## Commands

```bash
# Root level
npm run mobile          # Start Expo dev server
npm run admin           # Start Next.js admin (when built)

# Mobile app (apps/mobile)
npx expo start          # Start Expo Go
npx expo start --clear  # Clear cache and start
npx expo install        # Install Expo-compatible deps

# Database
# Apply migrations via Supabase Dashboard SQL Editor
```

## Project Structure

```
rp-partner/
├── apps/
│   ├── mobile/              # Expo React Native app
│   │   ├── app/             # expo-router file-based routes
│   │   │   ├── (auth)/      # Auth screens (welcome, login, register)
│   │   │   ├── (tabs)/      # Tab navigation (properties, calendar, cashflow, more)
│   │   │   └── property/    # Property detail screens
│   │   ├── components/      # Reusable UI components
│   │   ├── constants/       # Theme, colors, typography
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Supabase client, API calls
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript types
│   └── admin/               # Next.js admin dashboard (planned)
├── packages/
│   └── shared/              # Shared types and utilities (planned)
└── supabase/
    └── migrations/          # SQL migration files
```

## Key Patterns

### Authentication
- Supabase Auth with email/password
- Tokens stored in `expo-secure-store`
- Auth state managed in `stores/authStore.ts`
- Protected routes via `app/_layout.tsx`

### Navigation
- expo-router 6.x file-based routing
- `(auth)` group for unauthenticated screens
- `(tabs)` group for main tab navigation
- Dynamic routes: `property/[id]`, `reservation/[id]`

### Database
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies check `auth.uid() = user_id`

### Styling
- Design tokens in `constants/theme.ts`
- Colors: primary (teal), semantic (success, warning, error)
- Typography: size scale from xs to 3xl
- Spacing: 4px base unit (xs, sm, md, lg, xl, 2xl)

## Database Schema

Core tables:
- `users` - User profiles with subscription status
- `properties` - Rental properties
- `reservations` - Bookings with date constraints (no overlaps)
- `cashflow_entries` - Income/expense tracking

## Environment Variables

Mobile app (`apps/mobile/.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Important Notes

- **No react-native-reanimated animations in Expo Go**: Removed due to Worklets version mismatch
- **Currency**: PHP (Philippine Peso) formatting
- **Property limit**: Users have configurable property limits based on subscription
