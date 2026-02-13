import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useEnterSubmit } from '@/hooks/useEnterSubmit';

const isWeb = Platform.OS === 'web';

const showNotification = (title: string, message: string, onOk?: () => void) => {
  if (isWeb) {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
        })
        .eq('id', authUser?.id);

      if (error) throw error;

      showNotification('Success', 'Profile updated successfully!', () => {
        router.back();
      });
    } catch (error: any) {
      showNotification('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const enterSubmit = useEnterSubmit(handleSave, isLoading);

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ title: 'Edit Profile', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{form.full_name.charAt(0) || '?'}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Input
            label="Full Name *"
            placeholder="Your full name"
            value={form.full_name}
            onChangeText={(v) => updateForm('full_name', v)}
            error={errors.full_name}
            autoCapitalize="words"
          />
          <Input
            label="Phone Number"
            placeholder="+63 912 345 6789"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v)}
            keyboardType="phone-pad"
            {...enterSubmit}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subscription</Text>
            <Text style={[styles.infoValue, styles.statusBadge]}>
              {user?.subscription_status || 'free'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            fullWidth
          />
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.neutral.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.neutral.white,
  },
  email: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  infoSection: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral.gray500,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
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
  statusBadge: {
    color: Colors.primary.teal,
    textTransform: 'capitalize',
  },
  buttonContainer: {
    padding: Spacing.lg,
  },
});
