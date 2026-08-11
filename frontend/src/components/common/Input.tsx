import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`form-control ${error ? 'error' : ''} ${className}`}
            style={icon ? { paddingLeft: '2.4rem' } : undefined}
            {...props}
          />
        </div>
        {error && <span className="form-error">{error}</span>}
        {helperText && !error && <span className="text-muted" style={{ fontSize: '0.78rem' }}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
