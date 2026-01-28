import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * iOS-style status bar for phone mockups.
 * Shows time, Dynamic Island, and system icons.
 */
export function MockupStatusBar() {
  return (
    <View style={styles.container}>
      {/* Time */}
      <Text style={styles.time}>9:41</Text>

      {/* Dynamic Island */}
      <View style={styles.dynamicIsland} />

      {/* System Icons */}
      <View style={styles.systemIcons}>
        {/* Signal bars */}
        <View style={styles.signalBars}>
          <View style={[styles.signalBar, { height: 4 }]} />
          <View style={[styles.signalBar, { height: 6 }]} />
          <View style={[styles.signalBar, { height: 8 }]} />
          <View style={[styles.signalBar, { height: 10 }]} />
        </View>
        {/* Battery */}
        <View style={styles.battery}>
          <View style={styles.batteryFill} />
        </View>
        <View style={styles.batteryTip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 4,
    backgroundColor: Colors.neutral.gray50,
  },
  time: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    width: 32,
  },
  dynamicIsland: {
    width: 80,
    height: 20,
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  systemIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 32,
    justifyContent: 'flex-end',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  signalBar: {
    width: 2,
    backgroundColor: Colors.neutral.gray900,
    borderRadius: 1,
  },
  battery: {
    width: 16,
    height: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.gray900,
    borderRadius: 2,
    marginLeft: 4,
    padding: 1,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: Colors.neutral.gray900,
    borderRadius: 1,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: Colors.neutral.gray900,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
});
