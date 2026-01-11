# AGENTS.md

This file contains conventions and commands for agentic coding agents working in this repository.

## Build/Lint/Test Commands

### Root Level
- `npm run mobile` - Start Expo dev server
- `npm run admin` - Start Next.js admin (when built)
- `npm run mobile:build` - Build mobile for web

### Mobile App (`apps/mobile`)
- `npm start` / `npm run dev` - Start Expo dev server
- `npm run android` - Start Expo with Android
- `npm run ios` - Start Expo with iOS
- `npm run web` - Start Expo with web
- `npm run build` / `npm run build:web` - Export for web platform
- `npm run build:android` - EAS build for Android
- `npm run build:ios` - EAS build for iOS
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests (run single test with `-t pattern`)
- `npx expo start --clear` - Clear cache and start

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Import order: React imports, third-party imports, internal modules
- Use `import type` for pure type imports: `import type { Property } from '@/types/database'`
- Group related imports together

### TypeScript
- Strict TypeScript is enabled
- All components and functions must have proper types
- Define component props as interfaces
- Database types in `types/database.ts` follow Supabase schema pattern
- Use type aliases for database row types: `User`, `Property`, `Reservation`, `CashflowEntry`
- Use `InsertTables<T>` and `UpdateTables<T>` for mutation types

### Naming Conventions
- Components: PascalCase (`Button`, `LoginScreen`)
- Functions: camelCase (`signIn`, `fetchProperties`)
- Variables: camelCase (`isLoading`, `properties`)
- Constants: PascalCase (`Colors`, `Spacing`, `Typography`, `PROPERTY_TYPES`)
- Type definitions: PascalCase (`ButtonProps`, `AuthState`)
- Files: lowercase with hyphens for utility files, PascalCase for components

### Styling
- Use design tokens from `constants/theme.ts` (Colors, Spacing, Typography, BorderRadius, Shadows)
- StyleSheet definitions at bottom of component files
- Use named style properties: `styles.base`, `styles[variant]`, `styles.size_sm`
- Platform-specific styles using `Platform.OS === 'web'`
- No react-native-reanimated animations in Expo Go (Worklets version mismatch)

### Error Handling
- Wrap async operations in try-catch blocks
- Use `error instanceof Error` for type narrowing
- Provide user-friendly error messages via Alert.alert or window.alert
- Log errors to console for debugging
- Use loading states during async operations

### Form Patterns
- Forms use controlled inputs with state: `const [form, setForm] = useState({...})`
- Validation in `validate()` function returns boolean
- Errors stored in state: `const [errors, setErrors] = useState<Record<string, string>>({})`
- Clear errors on input change: `if (errors[key]) { setErrors(prev => ({...prev, [key]: ''})); }`
- Use `updateForm` helper to update form state and clear errors
- KeyboardShouldPersistTaps="handled" in ScrollView forms

### State Management
- Use Zustand stores for global state (e.g., `useAuthStore`)
- Local state with useState for component-specific state
- Clear error states before operations
- Throw errors from async functions to allow caller handling

### Platform Compatibility
- Define `const isWeb = Platform.OS === 'web';` at file top for reuse
- Use conditional rendering for platform differences
- Deep links: `rp-partner://` scheme for native
- Web URLs: `${window.location.origin}` for native features
- Auth storage: localStorage on web, expo-secure-store on native

### Supabase
- Use typed client: `createClient<Database>`
- RLS policies enforce `auth.uid() = user_id`
- Handle errors from Supabase operations
- Storage paths: `{userId}/{propertyId}/cover.{ext}`
- Use `.select()` and `.single()` for single row queries
- Session management: `supabase.auth.getSession()` before operations

### Navigation Patterns
- expo-router's `useRouter()` for navigation: `router.push()`, `router.back()`, `router.replace()`
- `Stack.Screen` for header configuration
- `useFocusEffect` with `useCallback` for screen refresh on focus
- Tab navigation in `(tabs)` group, auth screens in `(auth)` group

### Component Patterns
- Default export for screen components
- Named export for reusable UI components
- Platform-specific alerts: `window.alert` for web, `Alert.alert` for native
- Platform-specific navigation: `router.replace()` for web, `router.back()` for native

### Constants
- Property types defined as const arrays with label/value pairs
- Currency: PHP (Philippine Peso) formatting with `toLocaleString()`
- Date handling with date-fns library
- Use Spacing scale: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

### Common UI Patterns
- RefreshControl: `<RefreshControl refreshing={isRefreshing} onRefresh={...} />`
- Loading states: `<ActivityIndicator size="large" color={Colors.primary.teal} />`
- Empty states: centered content with icon, title, text, and CTA button
- FAB (Floating Action Button): absolute positioning with Shadows.lg
- Platform-specific cursor: `Platform.OS === 'web' && ({ cursor: 'pointer' } as any)`

### Comments
- DO NOT add comments unless explicitly requested
- Code should be self-documenting through clear naming
