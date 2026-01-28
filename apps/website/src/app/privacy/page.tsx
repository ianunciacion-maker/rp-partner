import { Metadata } from "next";
import { ScrollReveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Privacy Policy | RP-Partner",
  description:
    "Learn how RP-Partner collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h1 className="text-h1 text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500 mb-12">Last updated: January 22, 2026</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-3xl p-8 md:p-12 space-y-8">
                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">1. Introduction</h2>
                  <p className="text-gray-600">
                    RP-Partner ("we," "our," or "us") is committed to protecting your
                    privacy. This Privacy Policy explains how we collect, use, and
                    safeguard your information when you use our property management
                    application and website.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    2. Information We Collect
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>
                      Account information (name, email address, phone number)
                    </li>
                    <li>
                      Property information (addresses, photos, rental rates)
                    </li>
                    <li>
                      Financial data (income, expenses, payment records)
                    </li>
                    <li>Guest information you choose to store</li>
                    <li>Communications with our support team</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>
                      Analyze usage patterns to improve user experience
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">4. Data Security</h2>
                  <p className="text-gray-600">
                    We implement industry-standard security measures to protect your
                    data. Your information is stored on secure servers provided by
                    Supabase, with encryption at rest and in transit. We perform
                    regular backups and security audits to ensure your data remains
                    safe.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">5. Data Sharing</h2>
                  <p className="text-gray-600">
                    We do not sell, trade, or otherwise transfer your personal
                    information to third parties. We may share information only with
                    service providers who assist in operating our platform (such as
                    hosting and payment processing), and only as necessary to provide
                    our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">6. Your Rights</h2>
                  <p className="text-gray-600 mb-4">You have the right to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    7. Cookies and Tracking
                  </h2>
                  <p className="text-gray-600">
                    We use cookies and similar technologies to improve your
                    experience, analyze site traffic, and understand usage patterns.
                    You can control cookie preferences through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    8. Changes to This Policy
                  </h2>
                  <p className="text-gray-600">
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new policy on this page
                    and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">9. Contact Us</h2>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please
                    contact us at{" "}
                    <a
                      href="mailto:privacy@rp-partner.com"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      privacy@rp-partner.com
                    </a>
                    .
                  </p>
                </section>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
