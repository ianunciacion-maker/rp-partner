import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

// Only render on web
if (Platform.OS !== 'web') {
  module.exports = { default: () => null };
}

const FEATURES = [
  {
    icon: '📅',
    title: 'Smart Calendar',
    description: 'Track all your bookings in one place. Never double-book again.',
  },
  {
    icon: '💰',
    title: 'Cashflow Tracking',
    description: 'Monitor income and expenses. Know exactly where your money goes.',
  },
  {
    icon: '👥',
    title: 'Guest Management',
    description: 'Keep guest details organized. Build lasting relationships.',
  },
  {
    icon: '📊',
    title: 'Financial Reports',
    description: 'Export reports for taxes. Stay on top of your finances.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '₱0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['1 Property', 'Unlimited reservations', '2 months history', 'iOS, Android & Web'],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '₱499',
    period: '/month',
    description: 'For growing portfolios',
    features: ['Up to 3 Properties', 'Unlimited history', 'Priority support', 'Advanced analytics'],
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>TK</Text>
            </View>
            <Text style={styles.logoName}>Tuknang</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(auth)/register')} style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Get Started</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🇵🇭 Built for Filipino Property Owners</Text>
          </View>
          <Text style={styles.heroTitle}>Manage Your Rental Properties Like a Pro</Text>
          <Text style={styles.heroSubtitle}>
            The all-in-one app to track bookings, manage finances, and grow your rental business.
            Free to start, no credit card required.
          </Text>
          <View style={styles.heroCTA}>
            <Pressable onPress={() => router.push('/(auth)/register')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started Free →</Text>
            </Pressable>
          </View>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50,000+</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.features}>
        <Text style={styles.sectionTitle}>Everything You Need</Text>
        <Text style={styles.sectionSubtitle}>
          Simple tools to manage your rental properties efficiently
        </Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.pricing}>
        <Text style={styles.sectionTitle}>Simple, Transparent Pricing</Text>
        <Text style={styles.sectionSubtitle}>Start free, upgrade when you're ready</Text>
        <View style={styles.pricingGrid}>
          {PRICING.map((plan) => (
            <View
              key={plan.name}
              style={[styles.pricingCard, plan.highlighted && styles.pricingCardHighlighted]}
            >
              {plan.highlighted && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
              <View style={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.planFeatureRow}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => router.push('/(auth)/register')}
                style={[styles.planButton, plan.highlighted && styles.planButtonHighlighted]}
              >
                <Text
                  style={[
                    styles.planButtonText,
                    plan.highlighted && styles.planButtonTextHighlighted,
                  ]}
                >
                  {plan.highlighted ? 'Start Free' : 'Get Premium'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Text style={styles.paymentNote}>
          Pay via GCash, Maya, or Bank Transfer. No credit card needed.
        </Text>
      </View>

      {/* Final CTA */}
      <View style={styles.finalCTA}>
        <Text style={styles.finalCTATitle}>Ready to Get Started?</Text>
        <Text style={styles.finalCTASubtitle}>
          Join thousands of Filipino property owners who've simplified their rental management.
        </Text>
        <Pressable onPress={() => router.push('/(auth)/register')} style={styles.finalCTAButton}>
          <Text style={styles.finalCTAButtonText}>Start Free Today →</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Tuknang. Made with love in the Philippines.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    minHeight: '100%',
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.navy,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: Colors.primary.navy,
    fontWeight: '500',
  },
  signupButton: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  signupButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Hero
  hero: {
    backgroundColor: Colors.primary.navy,
    paddingTop: 120,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  heroContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 56,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
    maxWidth: 600,
  },
  heroCTA: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Features
  features: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.navy,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  featureGrid: {
    maxWidth: 1000,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.navy,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },

  // Pricing
  pricing: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  pricingGrid: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    width: 320,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pricingCardHighlighted: {
    borderColor: Colors.primary.teal,
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.navy,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary.navy,
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  planFeatures: {
    marginBottom: 24,
    gap: 12,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    color: Colors.primary.teal,
    fontWeight: 'bold',
  },
  planFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  planButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonHighlighted: {
    backgroundColor: Colors.primary.teal,
  },
  planButtonText: {
    fontWeight: '600',
    color: Colors.primary.navy,
  },
  planButtonTextHighlighted: {
    color: '#ffffff',
  },
  paymentNote: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },

  // Final CTA
  finalCTA: {
    backgroundColor: Colors.primary.navy,
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  finalCTATitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  finalCTASubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 500,
  },
  finalCTAButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  finalCTAButtonText: {
    color: Colors.primary.navy,
    fontSize: 18,
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
