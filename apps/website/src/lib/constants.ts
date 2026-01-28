export const SITE_CONFIG = {
  name: "Tuknang",
  description:
    "The all-in-one app for Filipino property owners. Track bookings, manage finances, and grow your rental business—free to start.",
  url: "https://tuknang.com",
  appUrl: "https://app.tuknang.com",
  ogImage: "https://tuknang.com/og-image.png",
  links: {
    appStore: "https://apps.apple.com/app/tuknang",
    playStore: "https://play.google.com/store/apps/details?id=com.tuknang",
    facebook: "https://facebook.com/tuknang",
    instagram: "https://instagram.com/tuknang",
    tiktok: "https://tiktok.com/@tuknang",
    signup: "https://app.tuknang.com/(auth)/register",
    login: "https://app.tuknang.com/(auth)/login",
  },
  contact: {
    email: "hello@tuknang.com",
    support: "support@tuknang.com",
  },
} as const;

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/download", label: "Download App" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
  resources: [
    { href: "https://help.tuknang.com", label: "Help Center", external: true },
    { href: "/blog", label: "Blog" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
} as const;

export const STATS = {
  users: "10,000+",
  properties: "50,000+",
  revenue: "₱100M+",
  rating: "4.8",
} as const;

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    currency: "₱",
    period: "month",
    description: "Perfect for getting started",
    features: [
      "1 Property",
      "Unlimited reservations",
      "2 months calendar history",
      "2 months financial reports",
      "Cashflow tracking",
      "Receipt uploads",
      "iOS, Android, & Web access",
    ],
    cta: "Start Free",
    highlighted: true,
  },
  premium: {
    name: "Premium",
    price: 499,
    currency: "₱",
    period: "month",
    description: "For growing property portfolios",
    features: [
      "Up to 3 Properties",
      "Unlimited reservations",
      "Unlimited calendar history",
      "Unlimited financial reports",
      "Everything in Free",
      "Priority support",
      "Advanced analytics (coming soon)",
    ],
    cta: "Upgrade to Premium",
    highlighted: false,
  },
} as const;
