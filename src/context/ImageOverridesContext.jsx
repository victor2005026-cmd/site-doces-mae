import { createContext, useContext, useState } from 'react';

const STORAGE_PREFIX = 'docesdaale:image-override:';
const ImageOverridesContext = createContext(null);

function readAllOverrides() {
  const overrides = {};
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const storageKey = window.localStorage.key(i);
    if (storageKey && storageKey.startsWith(STORAGE_PREFIX)) {
      const key = storageKey.slice(STORAGE_PREFIX.length);
      overrides[key] = window.localStorage.getItem(storageKey);
    }
  }
  return overrides;
}

export function ImageOverridesProvider({ children }) {
  const [overrides, setOverrides] = useState(() => readAllOverrides());

  const setOverride = (key, dataUrl) => {
    window.localStorage.setItem(STORAGE_PREFIX + key, dataUrl);
    setOverrides((prev) => ({ ...prev, [key]: dataUrl }));
  };

  const clearOverride = (key) => {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getSrc = (key, fallbackSrc) => overrides[key] || fallbackSrc;

  return (
    <ImageOverridesContext.Provider value={{ overrides, getSrc, setOverride, clearOverride }}>
      {children}
    </ImageOverridesContext.Provider>
  );
}

export function useImageOverrides() {
  const context = useContext(ImageOverridesContext);
  if (!context) throw new Error('useImageOverrides deve ser usado dentro de um ImageOverridesProvider');
  return context;
}

// Hook de conveniência pra um único componente que só precisa do src resolvido.
export function useImageSrc(key, fallbackSrc) {
  const { getSrc } = useImageOverrides();
  return getSrc(key, fallbackSrc);
}
