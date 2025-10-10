import { useState } from 'react';

export function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? "https://via.placeholder.com/400" : src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}
