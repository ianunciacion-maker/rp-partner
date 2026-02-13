import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

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

export function DesktopGuestScreenMockup() {
  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Reservations</Text>
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
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchPlaceholder}>Search guests...</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Guest</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Property</Text>
          <Text style={[styles.headerCell, { flex: 1.5 }]}>Dates</Text>
          <Text style={[styles.headerCell, { flex: 0.7 }]}>Nights</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Status</Text>
        </View>
        {/* Table Rows */}
        {reservations.map((res) => (
          <View key={res.name + res.dates} style={styles.tableRow}>
            <View style={[styles.guestCell, { flex: 2 }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{res.initials}</Text>
              </View>
              <Text style={styles.guestName}>{res.name}</Text>
            </View>
            <Text style={[styles.cellText, { flex: 1.5 }]}>{res.property}</Text>
            <Text style={[styles.cellText, { flex: 1.5 }]}>{res.dates}</Text>
            <Text style={[styles.cellText, { flex: 0.7 }]}>{res.nights}</Text>
            <Text style={[styles.amountText, { flex: 1, textAlign: 'right' }]}>{res.amount}</Text>
            <View style={[styles.statusCell, { flex: 1 }]}>
              <View style={[styles.statusBadge, { backgroundColor: res.statusBg }]}>
                <Text style={[styles.statusText, { color: res.statusText }]}>{res.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.gray50,
    padding: 16,
    minHeight: 360,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  pillActive: {
    backgroundColor: Colors.primary.teal,
    borderColor: Colors.primary.teal,
  },
  pillText: {
    fontSize: 9,
    color: Colors.neutral.gray600,
  },
  pillTextActive: {
    fontSize: 9,
    color: Colors.neutral.white,
  },
  searchBar: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginBottom: 12,
  },
  searchPlaceholder: {
    fontSize: 10,
    color: Colors.neutral.gray400,
  },
  table: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  headerCell: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  guestCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.primary.navy,
  },
  guestName: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.neutral.gray900,
  },
  cellText: {
    fontSize: 9,
    color: Colors.neutral.gray600,
  },
  amountText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  statusCell: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '500',
  },
});
