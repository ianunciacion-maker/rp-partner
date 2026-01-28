"use client";

import { ScrollReveal } from "@/components/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "free-forever",
    question: "Is the free plan really free forever?",
    answer:
      "Yes! The free plan is not a trial. You can use RP-Partner with 1 property forever at no cost. We believe everyone deserves access to professional property management tools.",
  },
  {
    id: "payment",
    question: "How do I pay for Premium?",
    answer:
      "We accept GCash, Maya, and bank transfers. No credit card required. Simply submit your payment proof in the app and you'll be upgraded within 24 hours.",
  },
  {
    id: "devices",
    question: "Can I use this on my computer?",
    answer:
      "Absolutely! RP-Partner works on iOS, Android, and any web browser. Your data syncs automatically across all devices.",
  },
  {
    id: "security",
    question: "Is my data secure?",
    answer:
      "Yes. We use Supabase (powered by PostgreSQL) with enterprise-grade security. Your data is encrypted and backed up daily. We will never sell your information.",
  },
  {
    id: "more-properties",
    question: "What if I have more than 3 properties?",
    answer:
      "Contact us! We offer custom plans for property managers with larger portfolios. Email us at hello@rp-partner.com.",
  },
  {
    id: "export",
    question: "Can I export my data?",
    answer:
      "Yes! Premium users can export financial reports as PDF. We're also working on more export options based on user feedback.",
  },
];

/**
 * FAQ accordion section.
 */
export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-h2 text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-body-lg text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white rounded-2xl border border-gray-200 px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-gray-900 font-medium py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
