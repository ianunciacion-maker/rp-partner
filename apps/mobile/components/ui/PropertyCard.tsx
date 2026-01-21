import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Badge } from './Badge';
import type { Property } from '@/types/database';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  badge?: string;
}

const IMAGE_HEIGHT = 200;
const ASPECT_RATIO = 4 / 3;

export function PropertyCard({
  property,
  onPress,
  onFavorite,
  isFavorite = false,
  badge,
}: PropertyCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        {property.cover_image_url && !imageError ? (
          <>
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderInitial}>
                  {property.name.charAt(0)}
                </Text>
              </View>
            )}
            <Image
              source={{ uri: property.cover_image_url }}
              style={[styles.image, !imageLoaded && styles.imageHidden]}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderInitial}>
              {property.name.charAt(0)}
            </Text>
          </View>
        )}

        {/* Heart Icon Overlay */}
        {onFavorite && (
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onFavorite();
            }}
            hitSlop={8}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>
        )}

        {/* Badge Overlay */}
        {badge && (
          <View style={styles.badgeContainer}>
            <Badge label={badge} variant="default" />
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {property.name}
          </Text>
        </View>
        <Text style={styles.location} numberOfLines={1}>
          {property.city || 'Location not set'}
        </Text>
        <Text style={styles.price}>
          ₱{property.base_rate?.toLocaleString()}
          <Text style={styles.perNight}>/night</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.neutral.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageHidden: {
    opacity: 0,
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    fontSize: 64,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.white,
    opacity: 0.8,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  content: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  propertyName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
    flex: 1,
  },
  location: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary.teal,
  },
  perNight: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.neutral.gray500,
  },
});
