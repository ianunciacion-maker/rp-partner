import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I add a new property?',
    answer: 'Go to the Properties tab and tap the "+" button. Fill in your property details including name, location, and pricing.',
  },
  {
    question: 'How do I create a reservation?',
    answer: 'Open a property, go to its calendar, and tap on a date to create a new reservation. Fill in guest details and confirm.',
  },
  {
    question: 'How do I track my income and expenses?',
    answer: 'Use the Cashflow tab to view and manage your financial records. You can add income from reservations or manual entries, and track expenses.',
  },
  {
    question: 'What is included in the Premium subscription?',
    answer: 'Premium includes unlimited calendar history, unlimited report exports, and the ability to manage up to 10 properties.',
  },
  {
    question: 'How do I upgrade to Premium?',
    answer: 'Go to More > Subscription and tap "Upgrade". Follow the payment instructions to activate your Premium subscription.',
  },
  {
    question: 'Can I share my calendar with guests?',
    answer: 'Yes! Open a property calendar and tap the share icon to generate a public link that shows your availability.',
  },
];

export default function HelpScreen() {
  const handleEmail = () => {
    Linking.openURL('mailto:support@rp-partner.com?subject=Help Request');
  };

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ title: 'Help & Support', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container}>
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Pressable style={styles.contactCard} onPress={handleEmail}>
            <Text style={styles.contactIcon}>📧</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactDescription}>
                Get help from our support team
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tuknang helps Filipino property owners manage their rental properties with ease.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral.gray500,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.lg,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  contactDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
  arrow: {
    fontSize: 20,
    color: Colors.neutral.gray400,
  },
  faqItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  faqAnswer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  infoLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
    fontWeight: '500',
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
