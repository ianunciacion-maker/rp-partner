import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function MoreScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/(auth)/welcome');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.full_name?.charAt(0) || '?'}</Text></View>
        <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50, padding: Spacing.lg },
  profileSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.neutral.white },
  userName: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  userEmail: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  signOutButton: { backgroundColor: Colors.semantic.error, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: 'auto' },
  signOutText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.white },
});
