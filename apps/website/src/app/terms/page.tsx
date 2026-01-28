import { Metadata } from "next";
import { ScrollReveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Terms of Service | RP-Partner",
  description:
    "Read the terms and conditions for using RP-Partner's property management services.",
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h1 className="text-h1 text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-500 mb-12">Last updated: January 22, 2026</p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-3xl p-8 md:p-12 space-y-8">
                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-600">
                    By accessing or using RP-Partner's services, you agree to be
                    bound by these Terms of Service. If you do not agree to these
                    terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-600">
                    RP-Partner provides a property management platform that allows
                    users to track rental properties, manage bookings, record
                    financial transactions, and generate reports. The service is
                    available via web browsers and mobile applications.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    3. User Accounts
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To use our services, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>
                      Notify us immediately of any unauthorized access
                    </li>
                    <li>
                      Be responsible for all activities under your account
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    4. Subscription Plans
                  </h2>
                  <p className="text-gray-600 mb-4">
                    RP-Partner offers the following subscription plans:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>
                      <strong>Free Plan:</strong> Includes 1 property with limited
                      history. Free forever, no credit card required.
                    </li>
                    <li>
                      <strong>Premium Plan:</strong> Includes up to 3 properties
                      with unlimited history. Billed monthly at ₱499.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    5. Payment Terms
                  </h2>
                  <p className="text-gray-600">
                    Premium subscriptions are billed monthly in Philippine Pesos
                    (₱). We accept payments via GCash, Maya, and bank transfer.
                    Subscriptions are activated upon confirmation of payment. You
                    may cancel your subscription at any time, with access
                    continuing until the end of your billing period.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    6. Acceptable Use
                  </h2>
                  <p className="text-gray-600 mb-4">You agree not to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Use the service for any illegal purpose</li>
                    <li>
                      Attempt to gain unauthorized access to our systems
                    </li>
                    <li>Interfere with the proper operation of the service</li>
                    <li>Upload malicious code or content</li>
                    <li>Violate the rights of others</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    7. Data Ownership
                  </h2>
                  <p className="text-gray-600">
                    You retain ownership of all data you input into RP-Partner.
                    We do not claim any ownership rights over your property
                    information, financial records, or other content. You may
                    export your data at any time.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    8. Service Availability
                  </h2>
                  <p className="text-gray-600">
                    We strive to maintain 99.9% uptime but do not guarantee
                    uninterrupted service. We may perform maintenance with
                    advance notice when possible. We are not liable for any
                    losses resulting from service interruptions.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    9. Limitation of Liability
                  </h2>
                  <p className="text-gray-600">
                    RP-Partner is provided "as is" without warranties of any kind.
                    We shall not be liable for any indirect, incidental, special,
                    or consequential damages arising from your use of the service.
                    Our total liability shall not exceed the amount you paid us in
                    the 12 months preceding the claim.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    10. Termination
                  </h2>
                  <p className="text-gray-600">
                    We may terminate or suspend your account at any time for
                    violation of these terms. Upon termination, you will have 30
                    days to export your data before it is permanently deleted.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    11. Changes to Terms
                  </h2>
                  <p className="text-gray-600">
                    We may update these terms from time to time. We will notify
                    you of material changes via email or in-app notification.
                    Continued use of the service after changes constitutes
                    acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">
                    12. Governing Law
                  </h2>
                  <p className="text-gray-600">
                    These terms are governed by the laws of the Republic of the
                    Philippines. Any disputes shall be resolved in the courts of
                    Metro Manila, Philippines.
                  </p>
                </section>

                <section>
                  <h2 className="text-h3 text-gray-900 mb-4">13. Contact</h2>
                  <p className="text-gray-600">
                    For questions about these Terms of Service, please contact us
                    at{" "}
                    <a
                      href="mailto:legal@rp-partner.com"
                      className="text-teal-600 hover:text-teal-700"
                    >
                      legal@rp-partner.com
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
