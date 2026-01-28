export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FooterLinkGroup {
  title: string;
  links: NavLink[];
}

export interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  avatar?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: "general" | "support" | "partnership" | "press";
  message: string;
}
