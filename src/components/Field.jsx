import { useState } from 'react';
import Icon from './Icon';

/** Labelled input with leading icon, optional password toggle, trailing slot and error text. */
export default function Field({ label, icon, type = 'text', error, prefix, trailing, hint, required, className = '', ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <span className="field-label">
          {label} {required && <i className="req">*</i>}
        </span>
      )}
      <span className="field-box">
        {icon && <Icon name={icon} size={18} className="field-icon" />}
        {prefix && <span className="field-prefix">{prefix}</span>}
        <input type={isPw && show ? 'text' : type} {...props} />
        {isPw && (
          <button type="button" className="field-eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
        {trailing}
      </span>
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
