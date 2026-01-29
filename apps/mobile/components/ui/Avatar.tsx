import { memo, useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  size?: AvatarSize;
  imageUrl?: string | null;
  name?: string;
  backgroundColor?: string;
}

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 32,
};

export const Avatar = memo(function Avatar({ size = 'md', imageUrl, name, backgroundColor }: AvatarProps) {
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];
  const initials = useMemo(
    () => name ? name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase() : '?',
    [name]
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: backgroundColor || Colors.primary.teal,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.semibold,
  },
});
