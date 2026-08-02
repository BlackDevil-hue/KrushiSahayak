import React from 'react';

export default function LoadingSkeleton({
  type = 'text',
  count = 1,
  height,
  width,
  className = '',
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'avatar') {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {items.map((i) => (
          <div
            key={i}
            className={`skeleton-shimmer ${className}`}
            style={{
              width: width || '48px',
              height: height || '48px',
              borderRadius: 'var(--radius-full)',
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: count > 1 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr' }}>
        {items.map((i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="skeleton-shimmer" style={{ width: '100%', height: '140px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton-shimmer" style={{ width: '60%', height: '20px' }} />
            <div className="skeleton-shimmer" style={{ width: '90%', height: '14px' }} />
            <div className="skeleton-shimmer" style={{ width: '40%', height: '14px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div className="skeleton-shimmer" style={{ width: '100%', height: '40px', borderRadius: 'var(--radius-sm)' }} />
        {items.map((i) => (
          <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '32px', borderRadius: 'var(--radius-sm)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: width || '100%' }}>
      {items.map((i) => (
        <div
          key={i}
          className={`skeleton-shimmer ${className}`}
          style={{
            width: i === count - 1 && count > 1 ? '70%' : '100%',
            height: height || '16px',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      ))}
    </div>
  );
}
