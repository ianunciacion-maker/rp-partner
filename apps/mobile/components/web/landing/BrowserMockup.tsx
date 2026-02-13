import { ReactNode } from 'react';

interface BrowserMockupProps {
  children: ReactNode;
  width?: number | string;
}

export function BrowserMockup({ children, width = 900 }: BrowserMockupProps) {
  return (
    <div style={{
      width,
      maxWidth: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e7e5e4',
      backgroundColor: '#ffffff',
    }}>
      {/* Title bar */}
      <div style={{
        height: 36,
        backgroundColor: '#f5f5f4',
        borderBottom: '1px solid #e7e5e4',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 14,
        paddingRight: 14,
        gap: 8,
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#eab308' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' }} />
        </div>
        {/* Address bar */}
        <div style={{
          flex: 1,
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
          height: 22,
          backgroundColor: '#ffffff',
          borderRadius: 6,
          border: '1px solid #d6d3d1',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 10,
          paddingRight: 10,
        }}>
          <span style={{
            fontSize: 11,
            color: '#a8a29e',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            app.tuknang.com
          </span>
        </div>
      </div>
      {/* Content */}
      <div style={{ overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
