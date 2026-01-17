# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rental property management platform for Filipino property owners. Monorepo with Expo React Native mobile app and planned Next.js admin dashboard.

## Commands

```bash
# Development
npm run mobile              # Start Expo dev server (from root)
npx expo start --clear      # Clear cache and start (from apps/mobile)

# Mobile builds
npm run mobile:build        # Web export
npx eas build --platform android  # Android build
npx eas build --platform ios      # iOS build

# Code quality (from apps/mobile)
npm run lint               # Run ESLint
npm run test               # Run Jest tests

# Database
# Apply migrations via Supabase Dashboard SQL Editor
```

## Architecture

### Tech Stack
- **Mobile**: Expo SDK 54, React Native 0.81, expo-router 6.x
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Storage)
- **State**: Zustand (no persist middleware needed - auth uses SecureStore)
- **Forms**: react-hook-form + zod validation
- **Dates**: date-fns v4

### Path Aliases
Use `@/` prefix for imports from the mobile app root:
```typescript
import { supabase } from '@/services/supabase';
import { Colors } from '@/constants/theme';
import type { Property } from '@/types/database';
```

### Navigation Structure
expo-router file-based routing with route groups:
- `(auth)/` - Unauthenticated screens (welcome, login, register)
- `(tabs)/` - Main tab navigation (properties, calendar, cashflow, more)
- `property/[id]`, `reservation/[id]`, `cashflow/[id]` - Detail screens
- `property/[id]/calendar` - Property-specific calendar with share feature

### Database Types
Types are manually defined in `apps/mobile/types/database.ts` mirroring Supabase schema. The `Database` interface provides full typing for Supabase client:
```typescript
import type { Database } from '@/types/database';
const supabase = createClient<Database>(url, key);
```

### Auth Flow
1. `services/supabase.ts` - Supabase client with platform-aware storage (SecureStore on native, localStorage on web)
2. `stores/authStore.ts` - Zustand store managing session state
3. `app/_layout.tsx` - Root layout that initializes auth and shows loading state
4. `app/index.tsx` - Redirects based on auth state

### Reservation Date Constraints
Database enforces no overlapping reservations using PostgreSQL exclusion constraint with `btree_gist` extension. The `[)` range means check-out day can be another guest's check-in day.

## Code Patterns

### Form Validation
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

### UI Components
Reusable components in `components/ui/` (Button, Input, Select, Modal) follow the design system in `constants/theme.ts`. Use design tokens instead of hardcoded values.

## Important Constraints

- **No reanimated in Expo Go**: Avoid complex animations due to Worklets version mismatch
- **PHP currency**: All amounts displayed in Philippine Peso
- **Property limits**: Users have configurable `property_limit` based on subscription
- **RLS enabled**: All tables have Row Level Security - users only see their own data
