import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

interface VideoBackgroundProps {
  src?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

/**
 * Video background component for web.
 * Falls back to gradient on native or if video fails.
 */
export function VideoBackground({
  src = '/videos/gradient-bg.mp4',
  overlay = false,
  overlayOpacity = 30,
}: VideoBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.gradientFallback} />
        {overlay && (
          <View style={[styles.overlay, { opacity: overlayOpacity / 100 }]} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!videoFailed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {videoFailed && <View style={styles.gradientFallback} />}

      {overlay && (
        <View style={[styles.overlay, { opacity: overlayOpacity / 100 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary.navy,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
});
