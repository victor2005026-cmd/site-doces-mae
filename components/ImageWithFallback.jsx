'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Mostra um emoji de placeholder quando a imagem local ainda não foi
 * adicionada em /public/images (equivalente ao onerror do site original).
 */
export default function ImageWithFallback({
  src,
  alt,
  placeholder = '🍫',
  fill,
  width,
  height,
  className = '',
  wrapperClassName = '',
  sizes,
  priority,
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
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
