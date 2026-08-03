import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const TYPE_CLASSES = {
  success: 'bg-success text-white',
  error: 'bg-rose-dark text-white',
  info: 'bg-text-primary text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success', duration = 2500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[70px] z-[400] flex flex-col items-center gap-2 px-4 pt-3 md:top-[80px]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fadeUp rounded-full px-5 py-2.5 text-[0.88rem] font-medium shadow-md ${TYPE_CLASSES[t.type] ?? TYPE_CLASSES.success}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
