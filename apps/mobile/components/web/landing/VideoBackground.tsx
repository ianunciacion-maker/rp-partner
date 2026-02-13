import { useState } from 'react';
import { Platform } from 'react-native';

interface VideoBackgroundProps {
  src?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

const fill: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function VideoBackground({
  src = '/videos/gradient-bg.mp4',
  overlay = false,
  overlayOpacity = 30,
}: VideoBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (Platform.OS !== 'web') return null;

  return (
    <div style={{ ...fill, overflow: 'hidden', zIndex: 0 }}>
      {!videoFailed && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoFailed(true)}
          style={{
            ...fill,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {videoFailed && (
        <div style={{ ...fill, backgroundColor: '#0c1a2e' }} />
      )}

      {overlay && (
        <div style={{ ...fill, backgroundColor: '#000000', opacity: overlayOpacity / 100 }} />
      )}
    </div>
  );
}
