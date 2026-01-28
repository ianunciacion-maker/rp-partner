import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* Primary Meta Tags */}
        <title>RP-Partner - Rental Property Management</title>
        <meta name="title" content="RP-Partner - Rental Property Management" />
        <meta name="description" content="Manage your rental properties, reservations, and finances in one place. Built for Filipino property owners." />
        <meta name="keywords" content="rental property, property management, reservations, Philippines, Airbnb management" />
        <meta name="author" content="RP-Partner" />

        {/* Theme Color */}
        <meta name="theme-color" content="#1a365d" />
        <meta name="msapplication-navbutton-color" content="#1a365d" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* PWA Configuration */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="RP-Partner" />
        <meta name="application-name" content="RP-Partner" />
        <meta name="format-detection" content="telephone=no" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tuknang.com/" />
        <meta property="og:title" content="RP-Partner - Rental Property Management" />
        <meta property="og:description" content="Manage your rental properties, reservations, and finances in one place. Built for Filipino property owners." />
        <meta property="og:image" content="/icon-512.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tuknang.com/" />
        <meta property="twitter:title" content="RP-Partner - Rental Property Management" />
        <meta property="twitter:description" content="Manage your rental properties, reservations, and finances in one place. Built for Filipino property owners." />
        <meta property="twitter:image" content="/icon-512.png" />

        {/* Prevent FOUC and set default styles */}
        <ScrollViewStyleReset />

        {/* Web-specific global styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            overflow-y: auto;
            overflow-x: hidden;
          }

          /* Prevent pull-to-refresh on mobile web */
          body {
            overscroll-behavior-y: contain;
          }

          /* Safe area insets for notched devices */
          :root {
            --safe-area-inset-top: env(safe-area-inset-top, 0px);
            --safe-area-inset-right: env(safe-area-inset-right, 0px);
            --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
            --safe-area-inset-left: env(safe-area-inset-left, 0px);
          }

          /* Apply safe area to body (top handled by fixed header) */
          body {
            padding-right: env(safe-area-inset-right, 0px);
            padding-bottom: env(safe-area-inset-bottom, 0px);
            padding-left: env(safe-area-inset-left, 0px);
          }

          /* Ensure fixed elements respect safe areas */
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 0px);
          }

          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }

          /* Hide scrollbar but allow scrolling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }

          /* Focus styles for accessibility */
          *:focus-visible {
            outline: 2px solid #38b2ac;
            outline-offset: 2px;
          }

          /* Disable text selection on buttons */
          button, [role="button"] {
            user-select: none;
            -webkit-user-select: none;
          }

          /* Smooth transitions */
          * {
            -webkit-tap-highlight-color: transparent;
          }

          /* Eliminate 300ms tap delay on mobile browsers */
          html {
            touch-action: manipulation;
          }

          button, a, [role="button"] {
            touch-action: manipulation;
          }

          /* Responsive breakpoint helpers */
          @media (min-width: 640px) {
            .tablet-only { display: block; }
            .mobile-only { display: none; }
          }

          @media (min-width: 1024px) {
            .desktop-only { display: block; }
            .tablet-only { display: none; }
          }

          /* Print styles */
          @media print {
            body {
              background: white;
            }
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
