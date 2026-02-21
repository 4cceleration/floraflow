import React from 'react';

export default function Button({ children, onClick, className = '', disabled, type = 'button' }) {
  return (
    <button 
      type={type}
      className={`magical-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
