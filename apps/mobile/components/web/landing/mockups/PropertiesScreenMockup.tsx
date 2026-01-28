import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { MockupStatusBar } from './MockupStatusBar';
import { MockupBottomNav } from './MockupBottomNav';

const properties = [
  {
    name: 'Casa Verde',
    location: 'Tagaytay',
    price: '\u20B13,500',
    gradientStart: '#2dd4bf',
    gradientEnd: '#10b981',
  },
  {
    name: 'Sunrise Condo',
    location: 'Makati',
    price: '\u20B12,800',
    gradientStart: '#fbbf24',
    gradientEnd: '#f97316',
  },
  {
    name: 'Beach House',
    location: 'La Union',
    price: '\u20B14,200',
    gradientStart: '#60a5fa',
    gradientEnd: '#06b6d4',
  },
];

/**
 * Properties screen mockup showing property cards.
 */
export function PropertiesScreenMockup() {
  return (
    <View style={styles.container}>
      <MockupStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Maria!</Text>
        <Text style={styles.subtitle}>3 properties</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>O</Text>
          <Text style={styles.searchPlaceholder}>Search properties...</Text>
        </View>
      </View>

      {/* Property Cards */}
      <View style={styles.cardList}>
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
              <Text style={styles.price}>
                {property.price}
                <Text style={styles.perNight}>/night</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* FAB */}
      <View style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </View>

      <MockupBottomNav activeTab="properties" />
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
    paddingBottom: 6,
  },
  greeting: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  subtitle: {
    fontSize: 8,
    color: Colors.neutral.gray500,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  searchIcon: {
    fontSize: 10,
    color: Colors.neutral.gray400,
  },
  searchPlaceholder: {
    fontSize: 8,
    color: Colors.neutral.gray400,
  },
  cardList: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 6,
  },
  card: {
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
    height: 48,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 10,
    color: Colors.neutral.gray400,
  },
  cardContent: {
    padding: 6,
  },
  propertyName: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationIcon: {
    fontSize: 6,
    color: Colors.neutral.gray400,
  },
  locationText: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
  price: {
    fontSize: 7,
    fontWeight: '600',
    color: Colors.primary.teal,
    marginTop: 2,
  },
  perNight: {
    fontWeight: '400',
    color: Colors.neutral.gray400,
  },
  fab: {
    position: 'absolute',
    bottom: 56,
    right: 12,
    width: 28,
    height: 28,
    backgroundColor: Colors.primary.teal,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 14,
    color: Colors.neutral.white,
    fontWeight: '300',
  },
});
