import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tuknang.com"),
  title: "Tuknang | Property Management App for Filipino Landlords | Free",
  description:
    "Manage your rental properties like a pro. Track bookings, finances, and guests with the free property management app built for Filipino property owners. Start free today.",
  keywords: [
    "property management app",
    "rental property software",
    "Philippines",
    "landlord app",
    "Airbnb management",
    "condo rental",
    "tuknang",
  ],
  authors: [{ name: "Tuknang" }],
  openGraph: {
    title: "Tuknang | Property Management Made Simple",
    description:
      "The all-in-one app to manage your rental properties. Free to start, built for Filipinos.",
    url: "https://tuknang.com",
    siteName: "Tuknang",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuknang | Property Management Made Simple",
    description:
      "Track bookings, manage finances, and grow your rental business. Free to start.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
