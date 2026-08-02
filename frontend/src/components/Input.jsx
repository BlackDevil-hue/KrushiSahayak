import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon: Icon = null,
  startAdornment = null,
  endAdornment = null,
  className = '',
  ...props
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {(Icon || startAdornment) && (
          <div style={{
            position: 'absolute',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}>
            {Icon ? <Icon size={18} /> : startAdornment}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-control"
          style={{
            paddingLeft: (Icon || startAdornment) ? '38px' : '16px',
            paddingRight: endAdornment ? '38px' : '16px',
            borderColor: error ? 'var(--color-error)' : undefined,
          }}
          {...props}
        />
        {endAdornment && (
          <div style={{
            position: 'absolute',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
          }}>
            {endAdornment}
          </div>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {!error && helperText && <span className="form-hint">{helperText}</span>}
    </div>
  );
}
