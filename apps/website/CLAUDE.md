# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RP-Partner marketing website - a Next.js 16 app promoting a property management application for Filipino landlords. The site is conversion-focused with a target of 15% visitor-to-signup.

## Commands

```bash
# Development (port 3000 often in use, use 3001)
npm run dev -- -p 3001

# Testing
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report (80% threshold)
npm run test:e2e            # Playwright E2E tests
npm run test:e2e:ui         # E2E with UI

# Code quality
npm run lint
npm run format

# Production
npm run build
npm start
```

## Architecture

```
/src
├── /app                    # Next.js App Router pages
├── /components
│   ├── /ui                 # Shadcn-style base components (button, card, dialog)
│   ├── /sections           # Homepage sections (Hero, Features, Pricing, FAQ)
│   ├── /shared             # Reusable branded components (Button, GlassCard, PhoneMockup)
│   ├── /mockups            # App screen mockups for marketing
│   ├── /layout             # Header, Footer
│   └── /forms              # ContactForm with Zod validation
├── /lib
│   ├── constants.ts        # All static content, nav links, pricing, stats
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
├── /types                  # TypeScript interfaces
└── /hooks                  # Custom hooks (placeholder)

/__tests__
├── /components             # Component unit tests
├── /unit                   # Utility tests
├── /e2e                    # Playwright tests
└── setup.ts                # Vitest setup & mocks
```

## Key Patterns

**Component variants with CVA:**
```typescript
const buttonVariants = cva([...baseStyles], {
  variants: { variant: {...}, size: {...} }
});
```

**Polymorphic buttons:** `Button` component renders as `<button>` or Next.js `<Link>` based on `href` prop.

**Animations:** Framer Motion with custom variants for fade-in, slide-up effects.

**Forms:** React Hook Form + Zod for validation.

**Imports:** Use `@/` alias for src directory.

## Design System

- **Colors:** Navy (#1a365d), Teal (#38b2ac) defined in tailwind.config.ts
- **Font:** Plus Jakarta Sans
- **Glassmorphism:** Semi-transparent backgrounds with blur effects
- **Custom animations:** float, gradient-move, fade-in, slide-up

## Testing Notes

- Unit tests use Vitest + React Testing Library with JSDOM
- E2E tests use Playwright configured for port 3001
- Coverage threshold: 80% across statements, branches, functions, lines
- Mocks for `IntersectionObserver`, `ResizeObserver`, `window.matchMedia` in `__tests__/setup.ts`

## Content Location

All static content (navigation, pricing, stats, testimonials) lives in `src/lib/constants.ts`. Update content there rather than in components.
