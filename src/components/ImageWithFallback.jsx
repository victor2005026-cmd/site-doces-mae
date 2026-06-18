import { useState } from 'react';

export default function ImageWithFallback({
  src,
  alt,
  placeholder = '🍫',
  fill,
  width,
  height,
  className = '',
  wrapperClassName = '',
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`img-fallback ${wrapperClassName}`}
        data-placeholder={placeholder}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading="lazy"
        className={`${fill ? 'absolute inset-0 h-full w-full' : ''} ${className}`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
