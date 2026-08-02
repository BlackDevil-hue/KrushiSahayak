import React from 'react';

export default function Card({
  title,
  subtitle,
  headerImage,
  icon: Icon = null,
  actions,
  children,
  elevation = 'shadow-sm',
  padding = 'md',
  onClick,
  hoverable = false,
  className = '',
  style = {},
  ...props
}) {
  const getElevationStyle = () => {
    switch (elevation) {
      case 'flat':
        return { backgroundColor: 'var(--color-surface)', border: 'none' };
      case 'outline':
        return { backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)' };
      case 'shadow-md':
        return { backgroundColor: 'var(--color-surface-elevated)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' };
      case 'shadow-sm':
      default:
        return { backgroundColor: 'var(--color-surface-elevated)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' };
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return 'var(--spacing-sm)';
      case 'lg':
        return 'var(--spacing-lg)';
      case 'md':
      default:
        return 'var(--spacing-md)';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`custom-card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-card)', // 12px border-radius rule
        overflow: 'hidden',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        cursor: onClick || hoverable ? 'pointer' : 'default',
        ...getElevationStyle(),
        ...style,
      }}
      {...props}
    >
      {headerImage && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
          <img src={headerImage} alt={title || 'Card banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {(title || subtitle || Icon || actions) && (
        <div
          style={{
            padding: getPaddingStyle(),
            paddingBottom: children ? '0' : getPaddingStyle(),
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {Icon && (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>
            )}
            <div>
              {title && <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>{title}</h3>}
              {subtitle && <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      {children && <div style={{ padding: getPaddingStyle() }}>{children}</div>}

      <style>{`
        .custom-card.hoverable:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </div>
  );
}
