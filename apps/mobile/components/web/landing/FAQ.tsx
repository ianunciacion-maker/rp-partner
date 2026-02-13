import { useState } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';
import { SectionReveal } from './SectionReveal';
import { PlusIcon, MinusIcon } from './icons';

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
      borderBottom: '1px solid #e7e5e4',
    }}>
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          paddingBottom: 24,
          gap: 16,
        }}
      >
        <span style={{
          fontSize: 16,
          fontWeight: 500,
          color: '#1c1917',
          flex: 1,
        }}>
          {question}
        </span>
        <div style={{
          transition: 'transform 200ms ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>
          {isOpen
            ? <MinusIcon size={20} color="#a8a29e" />
            : <PlusIcon size={20} color="#a8a29e" />
          }
        </div>
      </Pressable>
      <div style={{
        maxHeight: isOpen ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <p style={{
          fontSize: 16,
          color: '#57534e',
          lineHeight: 1.6,
          margin: 0,
          paddingBottom: 24,
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.tablet;

  return (
    <section id="faq" style={{
      paddingTop: isDesktop ? 120 : 80,
      paddingBottom: isDesktop ? 120 : 80,
      backgroundColor: '#ffffff',
    }}>
      <div style={{
        maxWidth: 680,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
      }}>
        <SectionReveal>
          <div style={{ textAlign: 'center', marginBottom: isDesktop ? 64 : 48 }}>
            <span style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#0d9488',
              marginBottom: 16,
            }}>
              FAQ
            </span>
            <h2 style={{
              fontSize: isDesktop ? 52 : 32,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: '#1c1917',
              margin: 0,
              lineHeight: 1.1,
            }}>
              Frequently asked questions
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal delay={100}>
          <div>
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
        </SectionReveal>
      </div>
    </section>
  );
}
