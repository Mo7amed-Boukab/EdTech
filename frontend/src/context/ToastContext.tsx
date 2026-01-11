import { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Toast } from "../components/Toast";
import type { ToastType } from "../components/Toast";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const success = useCallback((message: string) => {
    showToast(message, "success");
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast(message, "error");
  }, [showToast]);

  const info = useCallback((message: string) => {
    showToast(message, "info");
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
