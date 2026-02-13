import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

const properties = [
  {
    name: 'Casa Verde',
    location: 'Tagaytay',
    price: '\u20B13,500',
    occupancy: '78%',
    gradientStart: '#2dd4bf',
    gradientEnd: '#10b981',
  },
  {
    name: 'Sunrise Condo',
    location: 'Makati',
    price: '\u20B12,800',
    occupancy: '65%',
    gradientStart: '#fbbf24',
    gradientEnd: '#f97316',
  },
  {
    name: 'Beach House',
    location: 'La Union',
    price: '\u20B14,200',
    occupancy: '82%',
    gradientStart: '#60a5fa',
    gradientEnd: '#06b6d4',
  },
];

export function DesktopPropertiesScreenMockup() {
  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.greeting}>Hello, Maria!</Text>
          <Text style={styles.subtitle}>3 properties</Text>
          <View style={styles.searchBar}>
            <Text style={styles.searchPlaceholder}>Search properties...</Text>
          </View>
          <View style={styles.navItems}>
            {['Properties', 'Calendar', 'Cashflow', 'Guests'].map((item, i) => (
              <View key={item} style={[styles.navItem, i === 0 && styles.navItemActive]}>
                <Text style={[styles.navLabel, i === 0 && styles.navLabelActive]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Main content */}
        <View style={styles.main}>
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>Your Properties</Text>
            <View style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Property</Text>
            </View>
          </View>
          <View style={styles.cardGrid}>
            {properties.map((property) => (
              <View key={property.name} style={styles.card}>
                <View style={[styles.cardImage, { backgroundColor: property.gradientStart }]}>
                  <View style={styles.heartButton}>
                    <Text style={styles.heartIcon}>{'\u2661'}</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.propertyName}>{property.name}</Text>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>{'\u25C9'}</Text>
                    <Text style={styles.locationText}>{property.location}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <Text style={styles.price}>
                      {property.price}
                      <Text style={styles.perNight}>/night</Text>
                    </Text>
                    <Text style={styles.occupancy}>{property.occupancy} occ.</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.gray50,
  },
  layout: {
    flexDirection: 'row',
    minHeight: 360,
  },
  sidebar: {
    width: 160,
    backgroundColor: Colors.neutral.white,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral.gray200,
    padding: 12,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.neutral.gray500,
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 9,
    color: Colors.neutral.gray400,
  },
  navItems: {
    gap: 2,
  },
  navItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  navItemActive: {
    backgroundColor: '#f0fdfa',
  },
  navLabel: {
    fontSize: 10,
    color: Colors.neutral.gray500,
    fontWeight: '500',
  },
  navLabelActive: {
    color: Colors.primary.teal,
  },
  main: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  addButton: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    height: 80,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 12,
    color: Colors.neutral.gray400,
  },
  cardContent: {
    padding: 8,
  },
  propertyName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 8,
    color: Colors.neutral.gray400,
  },
  locationText: {
    fontSize: 9,
    color: Colors.neutral.gray500,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary.teal,
  },
  perNight: {
    fontWeight: '400',
    color: Colors.neutral.gray400,
  },
  occupancy: {
    fontSize: 9,
    color: Colors.neutral.gray500,
  },
});
