import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-surface-variant)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          border: '1.5px solid var(--color-primary)',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-on-accent)',
          border: 'none',
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          border: 'none',
          boxShadow: 'none',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-error)',
          color: '#FFFFFF',
          border: 'none',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          border: 'none',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: 'var(--font-size-sm)', minHeight: '32px' };
      case 'lg':
        return { padding: '14px 24px', fontSize: 'var(--font-size-lg)', minHeight: '48px' };
      case 'md':
      default:
        return { padding: '10px 18px', fontSize: 'var(--font-size-base)', minHeight: '40px' };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`custom-button ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 'var(--font-weight-semibold)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        boxShadow: variant === 'text' || variant === 'outline' ? 'none' : 'var(--shadow-sm)',
        ...variantStyle,
        ...sizeStyle,
      }}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-button:hover:not(:disabled) {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }
        .custom-button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </button>
  );
}
