import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import type { Property, Reservation, CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

interface Stats {
  totalProperties: number;
  totalReservations: number;
  occupancyRate: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  averageDailyRate: number;
  upcomingCheckIns: number;
}

export default function MoreScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch all data
      const [propertiesRes, reservationsRes, cashflowRes] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('reservations').select('*'),
        supabase.from('cashflow_entries').select('*'),
      ]);

      const properties = propertiesRes.data || [];
      const reservations = reservationsRes.data || [];
      const cashflow = cashflowRes.data || [];

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Occupancy rate (last 30 days)
      const recentReservations = reservations.filter((r) =>
        r.check_in >= thirtyDaysAgo &&
        r.check_in <= today &&
        !['cancelled', 'no_show'].includes(r.status)
      );

      const totalNights = recentReservations.reduce((sum, r) => sum + (r.nights || 0), 0);
      const possibleNights = properties.length * 30;
      const occupancyRate = possibleNights > 0 ? Math.round((totalNights / possibleNights) * 100) : 0;

      // Revenue & Expenses (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlyIncome = cashflow
        .filter((e) => e.type === 'income' && e.transaction_date.startsWith(currentMonth))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyExpenses = cashflow
        .filter((e) => e.type === 'expense' && e.transaction_date.startsWith(currentMonth))
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      // ADR (Average Daily Rate)
      const completedReservations = reservations.filter((r) =>
        ['completed', 'checked_in', 'confirmed'].includes(r.status)
      );
      const totalReservationRevenue = completedReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const totalReservationNights = completedReservations.reduce((sum, r) => sum + (r.nights || 0), 0);
      const adr = totalReservationNights > 0 ? Math.round(totalReservationRevenue / totalReservationNights) : 0;

      // Upcoming check-ins
      const upcomingCheckIns = reservations.filter((r) =>
        r.check_in >= today &&
        !['cancelled', 'no_show'].includes(r.status)
      ).length;

      setStats({
        totalProperties: properties.length,
        totalReservations: reservations.filter((r) => !['cancelled', 'no_show'].includes(r.status)).length,
        occupancyRate,
        totalRevenue: monthlyIncome,
        totalExpenses: monthlyExpenses,
        netIncome: monthlyIncome - monthlyExpenses,
        averageDailyRate: adr,
        upcomingCheckIns,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const handleSignOut = async () => {
    if (isWeb) {
      if (window.confirm('Are you sure you want to sign out?')) {
        await signOut();
        router.replace('/(auth)/welcome');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]);
    }
  };

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchStats(); }} />}
    >
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalProperties || 0}</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalReservations || 0}</Text>
            <Text style={styles.statLabel}>Reservations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.tealText]}>{stats?.occupancyRate || 0}%</Text>
            <Text style={styles.statLabel}>Occupancy (30d)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.upcomingCheckIns || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.financialRow}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Revenue</Text>
            <Text style={[styles.financialValue, styles.incomeText]}>
              PHP {(stats?.totalRevenue || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Expenses</Text>
            <Text style={[styles.financialValue, styles.expenseText]}>
              PHP {(stats?.totalExpenses || 0).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.netIncomeRow}>
          <Text style={styles.netIncomeLabel}>Net Income</Text>
          <Text style={[
            styles.netIncomeValue,
            (stats?.netIncome || 0) >= 0 ? styles.incomeText : styles.expenseText
          ]}>
            PHP {(stats?.netIncome || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.adrRow}>
          <Text style={styles.adrLabel}>Average Daily Rate</Text>
          <Text style={styles.adrValue}>PHP {(stats?.averageDailyRate || 0).toLocaleString()}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuIcon}>👤</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuIcon}>💳</Text>
          <Text style={styles.menuText}>Subscription</Text>
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionBadgeText}>{user?.subscription_status || 'trial'}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
        <Text style={styles.versionText}>RP-Partner v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileSection: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.neutral.white },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.neutral.white },
  userName: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  userEmail: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginTop: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray500, textTransform: 'uppercase', marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { width: '47%', backgroundColor: Colors.neutral.gray50, padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  statValue: { fontSize: Typography.fontSize['2xl'], fontWeight: 'bold', color: Colors.neutral.gray900 },
  statLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: Spacing.xs },
  tealText: { color: Colors.primary.teal },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  financialItem: { flex: 1 },
  financialLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
  financialValue: { fontSize: Typography.fontSize.lg, fontWeight: '600', marginTop: Spacing.xs },
  incomeText: { color: Colors.semantic.success },
  expenseText: { color: Colors.semantic.error },
  netIncomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral.gray100 },
  netIncomeLabel: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray900 },
  netIncomeValue: { fontSize: Typography.fontSize.xl, fontWeight: 'bold' },
  adrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral.gray100 },
  adrLabel: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600 },
  adrValue: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.primary.teal },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuText: { flex: 1, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  menuArrow: { fontSize: 20, color: Colors.neutral.gray400 },
  subscriptionBadge: { backgroundColor: Colors.primary.teal + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginRight: Spacing.sm },
  subscriptionBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.primary.teal, fontWeight: '600', textTransform: 'capitalize' },
  signOutSection: { padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.xxl },
  signOutButton: { backgroundColor: Colors.semantic.error, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl, borderRadius: BorderRadius.lg },
  signOutText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.white },
  versionText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray400, marginTop: Spacing.lg },
});
