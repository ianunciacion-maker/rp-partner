import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
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
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthStart = `${new Date().toISOString().slice(0, 7)}-01`;

      // Parallel queries with server-side filtering
      const [
        propertiesCountRes,
        recentReservationsRes,
        monthlyIncomeRes,
        monthlyExpensesRes,
        upcomingRes,
        allReservationsForAdrRes,
        totalReservationsRes,
      ] = await Promise.all([
        // Property count
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        // Recent reservations for occupancy (last 30 days)
        supabase
          .from('reservations')
          .select('nights')
          .gte('check_in', thirtyDaysAgo)
          .lte('check_in', today)
          .not('status', 'in', '("cancelled","no_show")'),
        // Monthly income
        supabase
          .from('cashflow_entries')
          .select('amount')
          .eq('type', 'income')
          .gte('transaction_date', monthStart),
        // Monthly expenses
        supabase
          .from('cashflow_entries')
          .select('amount')
          .eq('type', 'expense')
          .gte('transaction_date', monthStart),
        // Upcoming check-ins
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .gte('check_in', today)
          .not('status', 'in', '("cancelled","no_show")'),
        // For ADR calculation - completed/active reservations
        supabase
          .from('reservations')
          .select('total_amount, nights')
          .in('status', ['completed', 'checked_in', 'confirmed']),
        // Total reservations count
        supabase
          .from('reservations')
          .select('id', { count: 'exact', head: true })
          .not('status', 'in', '("cancelled","no_show")'),
      ]);

      const propertyCount = propertiesCountRes.count || 0;
      const recentReservations = (recentReservationsRes.data || []) as { nights: number | null }[];
      const monthlyIncomeData = (monthlyIncomeRes.data || []) as { amount: number | null }[];
      const monthlyExpensesData = (monthlyExpensesRes.data || []) as { amount: number | null }[];
      const upcomingCount = upcomingRes.count || 0;
      const adrReservations = (allReservationsForAdrRes.data || []) as { total_amount: number | null; nights: number | null }[];

      // Calculate occupancy rate
      const totalNights = recentReservations.reduce((sum, r) => sum + (r.nights || 0), 0);
      const possibleNights = propertyCount * 30;
      const occupancyRate = possibleNights > 0 ? Math.round((totalNights / possibleNights) * 100) : 0;

      // Calculate revenue & expenses
      const monthlyIncome = monthlyIncomeData.reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyExpenses = monthlyExpensesData.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate ADR
      const totalReservationRevenue = adrReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const totalReservationNights = adrReservations.reduce((sum, r) => sum + (r.nights || 0), 0);
      const adr = totalReservationNights > 0 ? Math.round(totalReservationRevenue / totalReservationNights) : 0;

      setStats({
        totalProperties: propertyCount,
        totalReservations: totalReservationsRes.count || 0,
        occupancyRate,
        totalRevenue: monthlyIncome,
        totalExpenses: monthlyExpenses,
        netIncome: monthlyIncome - monthlyExpenses,
        averageDailyRate: adr,
        upcomingCheckIns: upcomingCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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
        <Avatar size="xl" name={user?.full_name || 'User'} />
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
        <Pressable style={styles.menuItem} onPress={() => router.push('/settings/profile')}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/settings/notifications')}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🔔</Text>
          </View>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/subscription')}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>💳</Text>
          </View>
          <Text style={styles.menuText}>Subscription</Text>
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionBadgeText}>{user?.subscription_status || 'free'}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/settings/help')}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>❓</Text>
          </View>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </View>

      {/* Sign Out - Outline Style at Bottom */}
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
  userName: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold, color: Colors.neutral.gray900, marginTop: Spacing.md },
  userEmail: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginTop: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.neutral.gray500, textTransform: 'uppercase', marginBottom: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { width: '47%', backgroundColor: Colors.neutral.white, padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', ...Shadows.sm },
  statValue: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.bold, color: Colors.neutral.gray900 },
  statLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: Spacing.xs },
  tealText: { color: Colors.primary.teal },
  financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  financialItem: { flex: 1 },
  financialLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
  financialValue: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.semibold, marginTop: Spacing.xs },
  incomeText: { color: Colors.semantic.success },
  expenseText: { color: Colors.semantic.error },
  netIncomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral.gray100 },
  netIncomeLabel: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.neutral.gray900 },
  netIncomeValue: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold },
  adrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral.gray100 },
  adrLabel: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600 },
  adrValue: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.primary.teal },
  menuItem: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  menuIconContainer: { width: 40, height: 40, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral.gray100, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  menuIcon: { fontSize: 20 },
  menuText: { flex: 1, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  menuArrow: { fontSize: 24, color: Colors.neutral.gray400 },
  subscriptionBadge: { backgroundColor: Colors.primary.teal + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginRight: Spacing.sm },
  subscriptionBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.primary.teal, fontWeight: Typography.fontWeight.semibold, textTransform: 'capitalize' },
  signOutSection: { padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.xxl },
  signOutButton: { backgroundColor: Colors.neutral.white, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.semantic.error },
  signOutText: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.semantic.error },
  versionText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray400, marginTop: Spacing.lg },
});
