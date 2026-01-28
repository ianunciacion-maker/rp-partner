import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { MockupStatusBar } from './MockupStatusBar';
import { MockupBottomNav } from './MockupBottomNav';

const reservations = [
  {
    initials: 'JD',
    name: 'Juan Dela Cruz',
    property: 'Casa Verde',
    dates: 'Jan 9-11',
    nights: 3,
    amount: '\u20B110,500',
    status: 'Confirmed',
    statusBg: '#d1fae5',
    statusText: '#047857',
  },
  {
    initials: 'MS',
    name: 'Maria Santos',
    property: 'Sunrise Condo',
    dates: 'Jan 22-24',
    nights: 3,
    amount: '\u20B18,400',
    status: 'Pending',
    statusBg: '#fef3c7',
    statusText: '#b45309',
  },
  {
    initials: 'AR',
    name: 'Ana Reyes',
    property: 'Casa Verde',
    dates: 'Feb 1-3',
    nights: 3,
    amount: '\u20B110,500',
    status: 'Confirmed',
    statusBg: '#d1fae5',
    statusText: '#047857',
  },
  {
    initials: 'PG',
    name: 'Pedro Garcia',
    property: 'Beach House',
    dates: 'Feb 5-8',
    nights: 4,
    amount: '\u20B116,800',
    status: 'Confirmed',
    statusBg: '#d1fae5',
    statusText: '#047857',
  },
  {
    initials: 'LT',
    name: 'Lisa Torres',
    property: 'Sunrise Condo',
    dates: 'Feb 10-12',
    nights: 2,
    amount: '\u20B15,600',
    status: 'Confirmed',
    statusBg: '#d1fae5',
    statusText: '#047857',
  },
];

/**
 * Guest/Reservations screen mockup showing reservation cards.
 */
export function GuestScreenMockup() {
  return (
    <View style={styles.container}>
      <MockupStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reservations</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>O</Text>
          <Text style={styles.searchPlaceholder}>Search guests...</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filters}>
        <View style={[styles.pill, styles.pillActive]}>
          <Text style={styles.pillTextActive}>All</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Confirmed</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Pending</Text>
        </View>
      </View>

      {/* Reservation Cards */}
      <View style={styles.cardList}>
        {reservations.map((reservation) => (
          <View key={reservation.name + reservation.dates} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{reservation.initials}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.guestName}>{reservation.name}</Text>
                <Text style={styles.propertyText}>{reservation.property}</Text>
                <Text style={styles.datesText}>
                  {reservation.dates} {'\u00B7'} {reservation.nights} nights
                </Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.amount}>{reservation.amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: reservation.statusBg }]}>
                    <Text style={[styles.statusText, { color: reservation.statusText }]}>
                      {reservation.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <MockupBottomNav activeTab="guests" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  searchIcon: {
    fontSize: 8,
    color: Colors.neutral.gray400,
  },
  searchPlaceholder: {
    fontSize: 6,
    color: Colors.neutral.gray400,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  pillActive: {
    backgroundColor: Colors.primary.teal,
    borderColor: Colors.primary.teal,
  },
  pillText: {
    fontSize: 6,
    color: Colors.neutral.gray600,
  },
  pillTextActive: {
    fontSize: 6,
    color: Colors.neutral.white,
  },
  cardList: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 4,
  },
  avatar: {
    width: 20,
    height: 20,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 6,
    fontWeight: '600',
    color: Colors.primary.navy,
  },
  cardContent: {
    flex: 1,
  },
  guestName: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  propertyText: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
  datesText: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  amount: {
    fontSize: 7,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 5,
    fontWeight: '500',
  },
});
