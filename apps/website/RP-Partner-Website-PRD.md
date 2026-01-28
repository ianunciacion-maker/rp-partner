# RP-Partner Marketing Website
## Product Requirements Document (PRD)

**Version:** 1.0
**Date:** January 22, 2026
**Author:** Product Team
**Status:** Draft for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Brand Identity & Design System](#4-brand-identity--design-system)
5. [Website Architecture & Sitemap](#5-website-architecture--sitemap)
6. [Page-by-Page Specifications](#6-page-by-page-specifications)
7. [SEO Strategy](#7-seo-strategy)
8. [Technical Requirements](#8-technical-requirements)
9. [Performance & Analytics](#9-performance--analytics)
10. [Launch Checklist](#10-launch-checklist)

---

## 1. Executive Summary

### 1.1 Purpose

This PRD defines the requirements for the RP-Partner marketing website, a conversion-focused landing experience designed to showcase the RP-Partner rental property management platform to Filipino property owners and managers. The website will serve as the primary acquisition channel, driving sign-ups for the free tier while highlighting premium features.

### 1.2 Key Objectives

- **Primary Goal:** Convert visitors into free app users (target: 15% visitor-to-signup rate)
- **Secondary Goal:** Educate potential users about rental property management best practices
- **Tertiary Goal:** Establish RP-Partner as the leading property management solution in the Philippines

### 1.3 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Visitor-to-Signup Rate | 15% | Google Analytics + Supabase |
| Average Time on Site | > 3 minutes | Google Analytics |
| Bounce Rate | < 40% | Google Analytics |
| Mobile Conversion Rate | > 12% | Google Analytics |
| Page Load Time | < 2 seconds | Lighthouse |
| SEO Ranking (target keywords) | Top 10 | Ahrefs/SEMrush |

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

*"Empower every Filipino property owner to manage their rentals professionally, effortlessly, and profitably—starting for free."*

### 2.2 Value Proposition

**Headline:** "Manage Your Rental Properties Like a Pro"

**Subheadline:** "The all-in-one app for Filipino property owners. Track bookings, manage finances, and grow your rental business—free to start."

### 2.3 Key Differentiators

1. **Built for Filipinos** — Peso-first pricing, GCash/Maya payments, local support
2. **Free Forever Plan** — Not a trial, but a genuinely useful free tier
3. **Mobile-First** — Manage properties from anywhere on iOS, Android, or web
4. **Simple & Beautiful** — No learning curve, get started in under 2 minutes

---

## 3. Target Audience

### 3.1 Primary Persona: "Maria the Property Owner"

| Attribute | Details |
|-----------|---------|
| **Demographics** | 35-55 years old, middle to upper-middle class |
| **Location** | Metro Manila, Cebu, Davao, and tourist destinations (Palawan, Boracay, Baguio) |
| **Properties** | 1-5 rental units (condos, apartments, vacation homes) |
| **Tech Comfort** | Moderate; uses Facebook, Viber, GCash daily |
| **Pain Points** | Tracking bookings on paper/spreadsheets, chasing payments, no financial visibility |
| **Goals** | Passive income, organized records, professional guest experience |

### 3.2 Secondary Persona: "Carlos the Property Manager"

| Attribute | Details |
|-----------|---------|
| **Demographics** | 25-40 years old, manages properties for others |
| **Properties** | 3-10 properties under management |
| **Pain Points** | Coordinating across multiple owners, tracking expenses per property |
| **Goals** | Efficiency, impressing property owners, growing management business |

### 3.3 Tertiary Persona: "Ana the Airbnb Host"

| Attribute | Details |
|-----------|---------|
| **Demographics** | 28-45 years old, tech-savvy, uses Airbnb/Booking.com |
| **Properties** | 1-3 vacation rentals |
| **Pain Points** | Manual tracking outside OTAs, no unified calendar |
| **Goals** | Centralized management, better financial tracking |

---

## 4. Brand Identity & Design System

### 4.1 Color Palette

The website uses the RP-Partner brand colors with a modern, trustworthy aesthetic.

#### Primary Colors
```css
--primary-navy: #1a365d;      /* Trust, professionalism */
--primary-teal: #38b2ac;      /* Growth, freshness, action */
```

#### Neutral Colors
```css
--neutral-white: #ffffff;
--neutral-gray-50: #f9fafb;   /* Background sections */
--neutral-gray-100: #f3f4f6;  /* Card backgrounds */
--neutral-gray-200: #e5e7eb;  /* Borders */
--neutral-gray-500: #6b7280;  /* Body text */
--neutral-gray-800: #1f2937;  /* Headings */
--neutral-gray-900: #111827;  /* Primary text */
```

#### Semantic Colors
```css
--success: #10b981;           /* Free tier, positive indicators */
--warning: #f59e0b;           /* Premium highlights */
--error: #ef4444;             /* Urgency, warnings */
--info: #3b82f6;              /* Information callouts */
```

#### Glassmorphism Effects
```css
--glass-background: rgba(255, 255, 255, 0.7);
--glass-blur: blur(20px);
--glass-border: 1px solid rgba(255, 255, 255, 0.3);
--glass-shadow: 0 8px 32px rgba(26, 54, 93, 0.1);
```

### 4.2 Typography

#### Font Stack
```css
--font-primary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;
```

#### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Title | 56px / 3.5rem | 800 (Extra Bold) | 1.1 |
| H1 | 48px / 3rem | 700 (Bold) | 1.2 |
| H2 | 36px / 2.25rem | 700 (Bold) | 1.25 |
| H3 | 24px / 1.5rem | 600 (Semibold) | 1.3 |
| H4 | 20px / 1.25rem | 600 (Semibold) | 1.4 |
| Body Large | 18px / 1.125rem | 400 (Regular) | 1.6 |
| Body | 16px / 1rem | 400 (Regular) | 1.6 |
| Body Small | 14px / 0.875rem | 400 (Regular) | 1.5 |
| Caption | 12px / 0.75rem | 500 (Medium) | 1.4 |

### 4.3 Design Principles

#### Apple Glass Design Elements

1. **Frosted Glass Cards**
   - Semi-transparent white backgrounds (70-85% opacity)
   - backdrop-filter: blur(20px)
   - Subtle white border (rgba(255,255,255,0.3))
   - Soft shadow with brand navy tint

2. **Floating Elements**
   - Cards appear to float with layered shadows
   - Hover states lift elements higher
   - Smooth transitions (300ms ease-out)

3. **Gradient Overlays**
   - Hero section: Navy to Teal gradient mesh
   - Accent gradients on buttons and highlights

4. **Rounded Everything**
   - Border radius scale: 12px (sm), 16px (md), 24px (lg), 32px (xl)
   - No sharp corners anywhere
   - Pills for tags and badges (full radius)

#### Modern Non-Squared Design

```css
/* Card Styles */
.card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4px 6px rgba(26, 54, 93, 0.05),
    0 10px 40px rgba(26, 54, 93, 0.1);
}

/* Button Styles */
.button-primary {
  border-radius: 100px; /* Pill shape */
  background: linear-gradient(135deg, #38b2ac 0%, #2c9a94 100%);
  box-shadow: 0 4px 14px rgba(56, 178, 172, 0.4);
}

/* Phone Mockup Frame */
.phone-frame {
  border-radius: 44px;
  border: 12px solid #1a365d;
  box-shadow:
    0 25px 50px rgba(26, 54, 93, 0.25),
    inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}
```

### 4.4 Iconography

- **Style:** Lucide Icons (consistent with app)
- **Size:** 24px standard, 20px compact, 32px featured
- **Color:** Navy for primary, Teal for interactive, Gray-500 for secondary

### 4.5 Imagery Guidelines

#### App Screenshots
- Use actual app screens in device mockups
- Show real (but anonymized) data
- Highlight different features per section
- Display in floating phone frames with shadow

#### Photography Style
- Filipino property owners (stock or custom)
- Warm, natural lighting
- Modern Filipino homes and condos
- Diverse representation

#### Illustration Style
- Minimal, line-based illustrations
- Teal and Navy accent colors
- Used sparingly for empty states and 404

---

## 5. Website Architecture & Sitemap

### 5.1 Primary Navigation

```
RP-Partner (Logo/Home)
├── Features
├── Pricing
├── About
├── Blog (Phase 2)
├── Help Center (Link to external)
└── [Get Started Free] (CTA Button)
```

### 5.2 Full Sitemap

```
/                           → Landing Page (Home)
/features                   → Features Overview
/features/properties        → Property Management Deep Dive
/features/calendar          → Calendar & Booking Features
/features/cashflow          → Financial Tracking Features
/pricing                    → Pricing & Plans
/about                      → About RP-Partner
/contact                    → Contact Form
/privacy                    → Privacy Policy
/terms                      → Terms of Service
/blog                       → Blog Index (Phase 2)
/blog/[slug]               → Blog Post (Phase 2)
/app                        → Redirect to Web App
/download                   → App Store Links
```

### 5.3 Footer Structure

```
PRODUCT                     COMPANY                  RESOURCES                LEGAL
Features                    About Us                 Help Center             Privacy Policy
Pricing                     Contact                  Blog                    Terms of Service
Download App                Careers (Coming Soon)    Status                  Cookie Policy

[App Store Badge] [Play Store Badge]

© 2026 RP-Partner. Made with ❤️ in the Philippines.

[Facebook] [Instagram] [TikTok]
```

---

## 6. Page-by-Page Specifications

### 6.1 Landing Page (Home)

The landing page is a long-scroll conversion page with multiple sections, each serving a specific purpose in the user journey.

#### Section 1: Hero

**Purpose:** Capture attention, communicate value prop, drive immediate action

**Layout:** Split layout - Left: Copy + CTA, Right: Floating phone mockup

**Content:**

```
[Badge] 🇵🇭 Built for Filipino Property Owners

[H1] Manage Your Rental Properties Like a Pro

[Subtitle] The all-in-one app to track bookings, manage finances,
and grow your rental business. Free to start, no credit card required.

[CTA Button - Primary] Get Started Free →
[CTA Button - Secondary] See How It Works

[Trust Indicators]
⭐ 4.8 Rating  |  📱 10,000+ Downloads  |  🏠 50,000+ Properties Managed
```

**Visual:**
- Floating iPhone/Android mockup showing Properties Dashboard
- Gradient mesh background (Navy → Teal, animated)
- Glassmorphism card floating behind phone
- Subtle parallax on scroll

**Animation Specifications:**
```css
/* Hero phone entrance */
.hero-phone {
  animation: floatIn 1s ease-out;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Continuous float */
.hero-phone-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Gradient background animation */
.hero-gradient {
  background: linear-gradient(-45deg, #1a365d, #234876, #38b2ac, #2d9d97);
  background-size: 400% 400%;
  animation: gradientMove 15s ease infinite;
}
```

---

#### Section 2: Social Proof Bar

**Purpose:** Build trust through numbers and recognition

**Layout:** Horizontal scrolling logos + stats

**Content:**
```
Trusted by property owners across the Philippines

[Logo Strip - Animated scroll]
Featured in: Inquirer.net | Rappler | Manila Bulletin | Tech in Asia

[Stats Grid]
10,000+          50,000+           ₱100M+              4.8★
Active Users     Properties        Tracked Revenue     App Rating
```

**Animation:** Infinite horizontal scroll for logos (marquee effect)

---

#### Section 3: Problem → Solution

**Purpose:** Empathize with pain points, position RP-Partner as the solution

**Layout:** Before/After comparison with glassmorphism cards

**Content:**

```
[H2] Sound Familiar?

[Problem Cards - Glass effect, red tint]
📋 "I track bookings in a notebook and always forget something"
💸 "I don't know how much I'm actually earning from my properties"
📞 "Guests message me everywhere—Viber, Facebook, SMS..."
📊 "I want to see reports but Excel confuses me"

[Arrow/Transition Animation]

[H2] There's a Better Way

[Solution Card - Glass effect, green tint, featuring app screenshot]
RP-Partner gives you one place to:
✓ See all your properties and bookings at a glance
✓ Track every peso coming in and going out
✓ Block dates and manage your calendar
✓ Export professional reports instantly
```

**Animation:**
- Cards fade in on scroll (staggered)
- Problem cards slide left, solution card slides right
- Checkmarks animate in sequence

---

#### Section 4: Features Showcase

**Purpose:** Demonstrate key features with visual evidence

**Layout:** Alternating left-right sections with phone mockups

**Content:**

##### Feature 4.1: Property Management

```
[Phone Mockup - Properties List Screen]

[H3] All Your Properties, One Dashboard

See every property at a glance. Add unlimited details, photos,
and notes. Know exactly what's happening across your entire portfolio.

• Add properties in under 2 minutes
• Upload photos and set your rates
• Track occupancy and performance
• Works for condos, apartments, and vacation homes
```

##### Feature 4.2: Smart Calendar

```
[Phone Mockup - Calendar Screen]

[H3] Never Double-Book Again

A visual calendar that shows all your reservations across properties.
Block dates for maintenance, personal use, or anything else.

• See availability at a glance
• Block dates with one tap
• Guest check-in/check-out tracking
• Perfect for multi-property owners
```

##### Feature 4.3: Cashflow Tracking

```
[Phone Mockup - Cashflow Screen]

[H3] Know Exactly Where Your Money Goes

Track income and expenses for each property. Categorize transactions,
upload receipts, and see your profitability in real-time.

• Income and expense tracking
• Category-based organization
• Receipt photo uploads
• Per-property financial reports
```

##### Feature 4.4: Reservation Management

```
[Phone Mockup - Reservation Detail Screen]

[H3] Guest Management Made Simple

Store guest details, track payments, and manage deposits.
Everything you need to provide a professional experience.

• Guest contact information
• Payment and deposit tracking
• Booking source tracking (Airbnb, direct, etc.)
• Notes and special requests
```

**Animation Specifications:**
```css
/* Feature section scroll reveal */
.feature-section {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.6s ease-out;
}

.feature-section.visible {
  opacity: 1;
  transform: translateX(0);
}

/* Alternate direction for even sections */
.feature-section:nth-child(even) {
  transform: translateX(50px);
}

/* Phone mockup tilt on hover */
.phone-mockup {
  transition: transform 0.4s ease;
}

.phone-mockup:hover {
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1.02);
}
```

---

#### Section 5: How It Works

**Purpose:** Reduce friction by showing simplicity

**Layout:** 3-step horizontal timeline

**Content:**

```
[H2] Get Started in 3 Easy Steps

[Step 1]
📱 Download the App
Get RP-Partner free on iOS, Android, or use the web app.
No credit card required.

[Step 2]
🏠 Add Your First Property
Enter your property details in under 2 minutes.
Upload photos and set your rates.

[Step 3]
🚀 Start Managing
Add bookings, track finances, and grow your rental business.
It's that simple.

[CTA] Get Started Free →
```

**Animation:**
- Steps connect with animated dotted line
- Icons pulse/glow when in view
- Numbers count up as section enters viewport

---

#### Section 6: Pricing

**Purpose:** Clear pricing with emphasis on free tier value

**Layout:** Two-card comparison (Free vs Premium)

**Content:**

```
[H2] Simple, Transparent Pricing

[Subtitle] Start free, upgrade when you're ready.

[FREE TIER CARD - Highlighted with "Most Popular" badge]
FREE
₱0/month forever

Perfect for getting started
─────────────────────
✓ 1 Property
✓ Unlimited reservations
✓ 2 months calendar history
✓ 2 months financial reports
✓ Cashflow tracking
✓ Receipt uploads
✓ iOS, Android, & Web access

[CTA Button] Start Free →

[PREMIUM CARD - Glassmorphism, teal accent]
PREMIUM
₱499/month

For growing property portfolios
─────────────────────
✓ Up to 3 Properties
✓ Unlimited reservations
✓ Unlimited calendar history
✓ Unlimited financial reports
✓ Everything in Free
✓ Priority support
✓ Advanced analytics (coming soon)

[CTA Button] Upgrade to Premium →

[Note] Pay via GCash, Maya, or Bank Transfer. No credit card needed.
```

**Design Notes:**
- Free card should be visually prominent (users often assume free = limited)
- Premium card uses glassmorphism with teal border glow
- Pricing is in Philippine Pesos with local payment methods emphasized

---

#### Section 7: Testimonials

**Purpose:** Social proof through real user stories

**Layout:** Carousel of testimonial cards with photos

**Content:**

```
[H2] Loved by Property Owners Across the Philippines

[Testimonial 1]
"Finally, an app that actually understands how we manage
properties here in the Philippines. I stopped using
spreadsheets after my first week!"

— Maria Santos
Condo Owner, Makati City
[Photo placeholder]

[Testimonial 2]
"I manage 5 properties for different owners. RP-Partner
helps me stay organized and look professional. Worth every peso."

— Carlos Reyes
Property Manager, Cebu City
[Photo placeholder]

[Testimonial 3]
"The cashflow tracking changed my life. I finally know
how much I'm actually earning from my Airbnb unit."

— Ana Dela Cruz
Vacation Rental Host, Palawan
[Photo placeholder]
```

**Animation:**
- Auto-advance carousel (5s intervals)
- Swipe-enabled on mobile
- Fade transition between cards
- Quote marks animate in

---

#### Section 8: FAQ

**Purpose:** Address objections and common questions

**Layout:** Accordion with smooth expand/collapse

**Content:**

```
[H2] Frequently Asked Questions

[Q] Is the free plan really free forever?
[A] Yes! The free plan is not a trial. You can use RP-Partner
    with 1 property forever at no cost. We believe everyone
    deserves access to professional property management tools.

[Q] How do I pay for Premium?
[A] We accept GCash, Maya, and bank transfers. No credit card
    required. Simply submit your payment proof in the app and
    you'll be upgraded within 24 hours.

[Q] Can I use this on my computer?
[A] Absolutely! RP-Partner works on iOS, Android, and any web
    browser. Your data syncs automatically across all devices.

[Q] Is my data secure?
[A] Yes. We use Supabase (powered by PostgreSQL) with enterprise-
    grade security. Your data is encrypted and backed up daily.
    We will never sell your information.

[Q] What if I have more than 3 properties?
[A] Contact us! We offer custom plans for property managers
    with larger portfolios. Email us at hello@rp-partner.com.

[Q] Can I export my data?
[A] Yes! Premium users can export financial reports as PDF.
    We're also working on more export options based on user feedback.
```

**Animation:**
- Accordion expand with smooth height transition
- Plus/minus icon rotation
- Content fade-in on expand

---

#### Section 9: Final CTA

**Purpose:** Last conversion opportunity

**Layout:** Full-width gradient section with centered content

**Content:**

```
[Background: Navy to Teal gradient with subtle pattern]

[H2] Ready to Manage Your Properties Like a Pro?

[Subtitle] Join 10,000+ Filipino property owners who've simplified
their rental management. Start free today.

[CTA Button - Large, White] Get Started Free →

[Sub-CTA] No credit card required • Free forever • Cancel anytime

[App Store Badges]
[Download on App Store] [Get it on Google Play]
```

**Animation:**
- Section background has subtle animated gradient
- CTA button has gentle pulse animation
- App store badges slide up on scroll

---

### 6.2 Features Page

**URL:** /features

**Purpose:** Comprehensive feature overview for research-stage visitors

**Layout:** Hub page with cards linking to feature deep-dives

**Sections:**
1. Hero with feature grid preview
2. Property Management deep-dive
3. Calendar & Booking deep-dive
4. Cashflow & Reports deep-dive
5. Mobile Experience highlights
6. Coming Soon / Roadmap teaser
7. CTA to start free

---

### 6.3 Pricing Page

**URL:** /pricing

**Purpose:** Dedicated pricing comparison for decision-stage visitors

**Layout:** Centered pricing cards with feature comparison table below

**Sections:**
1. Plan comparison cards (same as landing page section)
2. Full feature comparison table
3. FAQ specific to pricing
4. CTA to start free

---

### 6.4 About Page

**URL:** /about

**Purpose:** Build trust through company story and mission

**Layout:** Narrative with team photos and mission statement

**Sections:**
1. Mission statement hero
2. Our story (why we built RP-Partner)
3. Team section (founders/key team)
4. Philippine-first philosophy
5. Contact information
6. CTA to start free

---

### 6.5 Contact Page

**URL:** /contact

**Purpose:** Support and business inquiries

**Layout:** Split layout - Contact form + Contact info

**Form Fields:**
- Name (required)
- Email (required)
- Subject (dropdown: General Inquiry, Support, Partnership, Press)
- Message (required)

**Contact Info:**
- Email: hello@rp-partner.com
- Support: support@rp-partner.com
- Address: (If applicable)
- Social links

---

## 7. SEO Strategy

### 7.1 Target Keywords

#### Primary Keywords (High Intent)
| Keyword | Search Volume (Est.) | Difficulty | Target Page |
|---------|---------------------|------------|-------------|
| property management app philippines | 1,000/mo | Medium | Home |
| rental property management software | 2,400/mo | High | Home |
| airbnb management app | 1,600/mo | Medium | Features |
| condo rental management | 500/mo | Low | Home |
| property management software free | 1,800/mo | Medium | Pricing |

#### Secondary Keywords (Informational)
| Keyword | Search Volume (Est.) | Target Page |
|---------|---------------------|-------------|
| how to manage rental property philippines | 400/mo | Blog |
| rental income tracking app | 600/mo | Features/Cashflow |
| property booking calendar | 300/mo | Features/Calendar |
| landlord expense tracker | 500/mo | Features/Cashflow |

#### Long-Tail Keywords
- "best property management app for filipino landlords"
- "free rental management software philippines"
- "condo rental tracker app"
- "how to track rental income and expenses"
- "airbnb host tools philippines"

### 7.2 On-Page SEO Requirements

#### Meta Tags Template

**Homepage:**
```html
<title>RP-Partner | Property Management App for Filipino Landlords | Free</title>
<meta name="description" content="Manage your rental properties like a pro.
Track bookings, finances, and guests with the free property management app
built for Filipino property owners. Start free today.">
<meta name="keywords" content="property management app, rental property software,
Philippines, landlord app, Airbnb management, condo rental">

<!-- Open Graph -->
<meta property="og:title" content="RP-Partner | Property Management Made Simple">
<meta property="og:description" content="The all-in-one app to manage your
rental properties. Free to start, built for Filipinos.">
<meta property="og:image" content="https://rp-partner.com/og-image.png">
<meta property="og:url" content="https://rp-partner.com">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RP-Partner | Property Management Made Simple">
<meta name="twitter:description" content="Track bookings, manage finances,
and grow your rental business. Free to start.">
<meta name="twitter:image" content="https://rp-partner.com/twitter-card.png">
```

#### URL Structure
- Use lowercase, hyphenated URLs
- Keep URLs short and descriptive
- Example: /features/cashflow-tracking (not /features/cashflow_tracking_page)

#### Heading Hierarchy
- One H1 per page (containing primary keyword)
- H2s for major sections
- H3s for subsections
- Use keywords naturally in headings

#### Image Optimization
- Descriptive filenames: property-management-dashboard.png
- Alt text with keywords: "RP-Partner property management dashboard showing 3 rental properties"
- WebP format with JPEG fallback
- Lazy loading for below-fold images

### 7.3 Technical SEO

#### Schema Markup

**Organization Schema (Homepage):**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "RP-Partner",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "iOS, Android, Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "PHP"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "500"
  }
}
```

**FAQ Schema (Pricing/FAQ sections):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is RP-Partner free?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes! RP-Partner offers a free plan forever with 1 property..."
    }
  }]
}
```

#### Sitemap & Robots.txt

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/
Sitemap: https://rp-partner.com/sitemap.xml
```

**Sitemap requirements:**
- XML sitemap auto-generated
- Include all public pages
- Update on content changes
- Submit to Google Search Console

### 7.4 Local SEO (Philippines)

- Register Google Business Profile (if applicable)
- Include "Philippines" and city names in content naturally
- Create location-specific landing pages (Phase 2):
  - /locations/manila
  - /locations/cebu
  - /locations/davao
- Philippine business directories submission

### 7.5 Content Strategy (Phase 2)

**Blog Topics:**
1. "How to Calculate Your Rental Property ROI in the Philippines"
2. "Airbnb vs. Long-Term Rental: Which is Better for Your Condo?"
3. "5 Tax Deductions Filipino Landlords Often Miss"
4. "How to Screen Tenants: A Guide for Filipino Property Owners"
5. "Rental Pricing Guide: Metro Manila Condo Rates 2026"

---

## 8. Technical Requirements

### 8.1 Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ | SEO (SSG/SSR), performance, React ecosystem |
| Styling | Tailwind CSS | Rapid development, consistent design system |
| Animation | Framer Motion | Smooth animations, scroll-triggered effects |
| Hosting | Vercel | Easy deployment, edge caching, analytics |
| Analytics | Google Analytics 4 + Plausible | Compliance + privacy-friendly option |
| Forms | React Hook Form + Supabase | Consistent with app, validation |
| CMS | Contentful or Sanity (Phase 2) | Blog content management |

### 8.2 Performance Requirements

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Lighthouse Performance | > 90 | Chrome DevTools |
| First Contentful Paint (FCP) | < 1.5s | Web Vitals |
| Largest Contentful Paint (LCP) | < 2.5s | Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Web Vitals |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Total Page Size | < 2MB | DevTools |

### 8.3 Browser Support

- Chrome 90+ (Desktop & Mobile)
- Safari 14+ (Desktop & iOS)
- Firefox 90+
- Edge 90+
- Samsung Internet 15+

### 8.4 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: Mobile (0-639px) */
/* sm: 640px - Tablet portrait */
/* md: 768px - Tablet landscape */
/* lg: 1024px - Desktop */
/* xl: 1280px - Large desktop */
/* 2xl: 1536px - Extra large */
```

### 8.5 Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1
- Focus indicators visible
- Alt text for all images
- Form labels and error messages

### 8.6 Security Requirements

- HTTPS everywhere (SSL/TLS)
- CSP headers configured
- No mixed content
- Form CSRF protection
- Rate limiting on contact form
- No sensitive data in URLs

---

## 9. Performance & Analytics

### 9.1 Analytics Setup

**Google Analytics 4 Events:**
```javascript
// Key conversion events
gtag('event', 'sign_up_click', { location: 'hero' });
gtag('event', 'sign_up_click', { location: 'pricing' });
gtag('event', 'sign_up_click', { location: 'final_cta' });
gtag('event', 'app_store_click', { platform: 'ios' });
gtag('event', 'app_store_click', { platform: 'android' });
gtag('event', 'pricing_view', { plan: 'free' });
gtag('event', 'pricing_view', { plan: 'premium' });
gtag('event', 'faq_expand', { question: 'is_free_forever' });
```

### 9.2 Conversion Tracking

**Primary Conversion:** Click on "Get Started Free" → App signup
**Micro-conversions:**
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page (30s, 60s, 120s)
- Feature section views
- FAQ interactions
- App store badge clicks

### 9.3 A/B Testing Plan

**Test 1: Hero CTA Copy**
- Variant A: "Get Started Free"
- Variant B: "Start Managing Free"
- Variant C: "Try Free Now"

**Test 2: Pricing Card Emphasis**
- Variant A: Free tier highlighted
- Variant B: Premium tier highlighted
- Variant C: Equal emphasis

**Test 3: Social Proof Placement**
- Variant A: Below hero
- Variant B: Within hero
- Variant C: Floating sidebar

---

## 10. Launch Checklist

### Pre-Launch

- [ ] All pages built and reviewed
- [ ] Responsive design tested on all breakpoints
- [ ] Cross-browser testing completed
- [ ] Lighthouse scores meet targets
- [ ] All forms tested and working
- [ ] Analytics and conversion tracking verified
- [ ] SEO meta tags and schema implemented
- [ ] Sitemap generated and submitted
- [ ] SSL certificate configured
- [ ] 404 page created
- [ ] Favicon and app icons added
- [ ] Open Graph images created
- [ ] Legal pages (Privacy, Terms) finalized
- [ ] Copy reviewed for spelling/grammar
- [ ] All links verified working
- [ ] App store links confirmed

### Launch Day

- [ ] DNS configured for production domain
- [ ] Verify HTTPS working
- [ ] Submit sitemap to Google Search Console
- [ ] Announce on social media
- [ ] Monitor error logs
- [ ] Check analytics data flowing

### Post-Launch (Week 1)

- [ ] Monitor Core Web Vitals in Search Console
- [ ] Review initial analytics data
- [ ] Check for crawl errors
- [ ] Gather team feedback
- [ ] Start A/B tests
- [ ] Monitor conversion rates

---

## Appendix A: App Screenshot Specifications

### Required Screenshots (In Device Mockups)

| Screen | Section Usage | Notes |
|--------|---------------|-------|
| Properties Dashboard | Hero, Features | Show 2-3 properties with varied status |
| Property Detail | Features | Show property with photos, details |
| Calendar View | Features | Show month view with bookings |
| Cashflow Overview | Features | Show income/expense breakdown |
| Reservation Detail | Features | Show guest info, payment status |
| Add Property Form | How It Works | Show partially filled form |

### Screenshot Guidelines

1. Use production app with real-looking (but fake) data
2. Remove any real personal information
3. Export at 2x resolution (retina)
4. Format: PNG with transparency for mockup compositing
5. Consistent time shown in status bar (e.g., 9:41 AM)
6. Full battery, strong signal indicators

### Device Mockup Specifications

**iPhone Mockup:**
- Model: iPhone 15 Pro style (rounded corners, Dynamic Island)
- Frame color: Space Black or Navy (#1a365d)
- Shadow: Large, soft, navy-tinted

**Android Mockup:**
- Model: Generic modern Android (thin bezels, rounded corners)
- Frame color: Graphite or Navy
- Used sparingly (iOS primary)

---

## Appendix B: Animation Library Reference

### Scroll-Triggered Animations (Framer Motion)

```jsx
// Fade up on scroll
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Staggered children
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Scale in
const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};
```

### Micro-Interactions

```jsx
// Button hover
const buttonHover = {
  scale: 1.02,
  boxShadow: "0 6px 20px rgba(56, 178, 172, 0.5)",
  transition: { duration: 0.2 }
};

// Card hover
const cardHover = {
  y: -5,
  boxShadow: "0 20px 40px rgba(26, 54, 93, 0.15)",
  transition: { duration: 0.3 }
};

// Phone tilt on hover
const phoneTilt = {
  rotateY: -5,
  rotateX: 5,
  scale: 1.02,
  transition: { duration: 0.4 }
};
```

---

## Appendix C: Copywriting Guidelines

### Voice & Tone

**Brand Voice:** Friendly, professional, empowering, Filipino-aware

**Do:**
- Use simple, clear language
- Address the reader directly ("you", "your")
- Focus on benefits, not features
- Include Filipino context (Peso, local payment methods)
- Be encouraging and supportive

**Don't:**
- Use jargon or technical terms unnecessarily
- Be condescending or overly formal
- Make claims we can't back up
- Ignore the Philippine context

### CTA Button Copy

| Context | Primary CTA | Secondary CTA |
|---------|-------------|---------------|
| Hero | Get Started Free → | See How It Works |
| Features | Start Free Today → | Learn More |
| Pricing | Start Free → | Upgrade to Premium → |
| Final | Get Started Free → | Download the App |

### Headline Formulas

1. **[Action] Your [Object] Like a [Desirable Outcome]**
   - "Manage Your Properties Like a Pro"

2. **[Adjective] [Object] for [Target Audience]**
   - "Simple Property Management for Filipino Landlords"

3. **[Question addressing pain point]?**
   - "Tired of Tracking Bookings in Spreadsheets?"

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | Product Team | Initial PRD |

---

*End of Document*
