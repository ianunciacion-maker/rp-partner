import { useState } from 'react';
import { Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { ScrollReveal } from './ScrollReveal';

const faqs = [
  {
    id: 'free-forever',
    question: 'Is the free plan really free forever?',
    answer:
      'Yes! The free plan is not a trial. You can use Tuknang with 1 property forever at no cost. We believe everyone deserves access to professional property management tools.',
  },
  {
    id: 'payment',
    question: 'How do I pay for Premium?',
    answer:
      'We accept GCash, Maya, and bank transfers. No credit card required. Simply submit your payment proof in the app and you\'ll be upgraded within 24 hours.',
  },
  {
    id: 'devices',
    question: 'Can I use this on my computer?',
    answer:
      'Absolutely! Tuknang works on iOS, Android, and any web browser. Your data syncs automatically across all devices.',
  },
  {
    id: 'security',
    question: 'Is my data secure?',
    answer:
      'Yes. We use Supabase (powered by PostgreSQL) with enterprise-grade security. Your data is encrypted and backed up daily. We will never sell your information.',
  },
  {
    id: 'more-properties',
    question: 'What if I have more than 3 properties?',
    answer:
      'Contact us! We offer custom plans for property managers with larger portfolios. Email us at hello@tuknang.com.',
  },
  {
    id: 'export',
    question: 'Can I export my data?',
    answer:
      'Yes! Premium users can export financial reports as PDF. We\'re also working on more export options based on user feedback.',
  },
];

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      backgroundColor: Colors.neutral.white,
      borderRadius: 16,
      border: `1px solid ${Colors.neutral.gray200}`,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
    }}>
      <Pressable onPress={onToggle} style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        gap: 16,
      }}>
        <span style={{
          fontSize: 16,
          fontWeight: 500,
          color: Colors.neutral.gray900,
          flex: 1,
        }}>{question}</span>
        <span style={{
          fontSize: 20,
          color: Colors.neutral.gray400,
          fontWeight: 'bold',
        }}>{isOpen ? '\u2212' : '+'}</span>
      </Pressable>
      {isOpen && (
        <div style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 24,
        }}>
          <p style={{
            fontSize: 16,
            color: Colors.neutral.gray600,
            lineHeight: 1.5,
            margin: 0,
          }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

/**
 * FAQ accordion section.
 */
export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" style={{
      paddingTop: 80,
      paddingBottom: 80,
      backgroundColor: Colors.neutral.gray50,
    }}>
      <div style={{
        maxWidth: 768,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <ScrollReveal>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <h2 style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: Colors.neutral.gray900,
              marginBottom: 16,
              margin: 0,
              marginBottom: 16,
            }}>Frequently Asked Questions</h2>
            <p style={{
              fontSize: 18,
              color: Colors.neutral.gray600,
              margin: 0,
            }}>Got questions? We've got answers.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
