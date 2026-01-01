import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Image, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input, Select } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BottomNav } from '@/components/BottomNav';

const isWeb = Platform.OS === 'web';

// Web-compatible notification
const showNotification = (title: string, message: string, onOk?: () => void) => {
  if (isWeb) {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

const PROPERTY_TYPES = [
  { label: 'Villa', value: 'villa' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Condo', value: 'condo' },
  { label: 'House', value: 'house' },
  { label: 'Resort', value: 'resort' },
  { label: 'Other', value: 'other' },
];

export default function AddPropertyScreen() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    province: '',
    property_type: '',
    max_guests: '10',
    base_rate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Property name is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.property_type) newErrors.property_type = 'Property type is required';
    if (!form.base_rate || isNaN(Number(form.base_rate))) newErrors.base_rate = 'Valid base rate is required';
    if (!form.max_guests || isNaN(Number(form.max_guests))) newErrors.max_guests = 'Valid guest count is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadCoverImage = async (propertyId: string) => {
    if (!coverImage) return null;

    try {
      const response = await fetch(coverImage);
      const blob = await response.blob();
      const fileExt = coverImage.split('.').pop() || 'jpg';
      const fileName = `${authUser?.id}/${propertyId}/cover.${fileExt}`;

      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Get the current session to ensure we're authenticated
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);
      console.log('authUser from store:', authUser?.id);

      if (!session?.user) {
        throw new Error('You must be logged in to create a property');
      }

      // Create property first
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          user_id: session.user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim(),
          province: form.province.trim() || null,
          property_type: form.property_type,
          max_guests: parseInt(form.max_guests),
          base_rate: parseFloat(form.base_rate),
        })
        .select()
        .single();

      if (error) throw error;

      // Upload cover image if selected
      if (coverImage && property) {
        const imageUrl = await uploadCoverImage(property.id);
        if (imageUrl) {
          await supabase
            .from('properties')
            .update({ cover_image_url: imageUrl })
            .eq('id', property.id);
        }
      }

      showNotification('Success', 'Property created successfully!', () => {
        if (isWeb) {
          router.replace('/(tabs)/');
        } else {
          router.back();
        }
      });
    } catch (error: any) {
      showNotification('Error', error.message || 'Failed to create property');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ title: 'Add Property', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <Pressable style={styles.imagePickerContainer} onPress={pickImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Tap to add cover image</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input
            label="Property Name *"
            placeholder="e.g., Beach Villa Paradise"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
            error={errors.name}
          />
          <Input
            label="Description"
            placeholder="Describe your property..."
            value={form.description}
            onChangeText={(v) => updateForm('description', v)}
            multiline
            numberOfLines={3}
          />
          <Select
            label="Property Type *"
            placeholder="Select type"
            value={form.property_type}
            options={PROPERTY_TYPES}
            onChange={(v) => updateForm('property_type', v)}
            error={errors.property_type}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Input
            label="Address"
            placeholder="Street address"
            value={form.address}
            onChangeText={(v) => updateForm('address', v)}
          />
          <Input
            label="City *"
            placeholder="e.g., Tagaytay"
            value={form.city}
            onChangeText={(v) => updateForm('city', v)}
            error={errors.city}
          />
          <Input
            label="Province"
            placeholder="e.g., Cavite"
            value={form.province}
            onChangeText={(v) => updateForm('province', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capacity & Pricing</Text>
          <Input
            label="Max Guests *"
            placeholder="10"
            value={form.max_guests}
            onChangeText={(v) => updateForm('max_guests', v)}
            keyboardType="number-pad"
            error={errors.max_guests}
          />
          <Input
            label="Base Rate (PHP) *"
            placeholder="5000"
            value={form.base_rate}
            onChangeText={(v) => updateForm('base_rate', v)}
            keyboardType="decimal-pad"
            error={errors.base_rate}
            hint="Nightly rate in Philippine Pesos"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Property"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
          />
          {isWeb ? (
            <Pressable
              style={[styles.cancelButton, { cursor: 'pointer' } as any]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          ) : (
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          )}
        </View>
      </ScrollView>
      <BottomNav />
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
    backgroundColor: Colors.neutral.gray50,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  imagePickerContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.gray100,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  buttonContainer: {
    padding: Spacing.lg,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  cancelButtonText: {
    color: Colors.primary.teal,
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
});
