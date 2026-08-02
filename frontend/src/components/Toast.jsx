import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({
  type = 'info',
  title = '',
  message = '',
  duration = 4000,
  onClose,
}) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success)',
          color: 'var(--color-success)',
          icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: 'var(--color-error-bg)',
          border: 'var(--color-error)',
          color: 'var(--color-error)',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning)',
          color: 'var(--color-warning)',
          icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info)',
          color: 'var(--color-info)',
          icon: Info,
        };
    }
  };

  const config = getTypeStyles();
  const IconComponent = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text-primary)',
        animation: 'slideInRight 250ms ease-out',
        width: '100%',
      }}
    >
      <IconComponent size={20} style={{ color: config.color, marginTop: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{title}</div>}
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: title ? '2px' : 0 }}>
          {message}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
