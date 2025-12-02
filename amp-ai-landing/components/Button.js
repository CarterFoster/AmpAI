import React from 'react';

export default function Button({ children, variant = 'solid', onClick = () => {}, href = '#' }) {
  const base = "px-12 py-6 rounded-lg text-2xl font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  if (variant === 'solid') {
    return href ? (
      <a href={href} className={`${base} bg-white text-gray-900 shadow-sm`} aria-label={children}>
        {children}
      </a>
    ) : (
      <button className={`${base} bg-white text-gray-900 shadow-sm`} onClick={onClick}>
        {children}
      </button>
    );
  } else {
    return href ? (
      <a href={href} className={`${base} border border-gray-300 text-white`} aria-label={children}>
        {children}
      </a>
    ) : (
      <button className={`${base} border border-gray-300 text-white`} onClick={onClick}>
        {children}
      </button>
    );
  }
}
