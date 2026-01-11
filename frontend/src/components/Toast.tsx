import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

export const Toast = ({ id, type, message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "info":
        return <AlertCircle size={20} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "toast-success";
      case "error":
        return "toast-error";
      case "info":
        return "toast-info";
    }
  };

  return (
    <div className={`toast ${getStyles()}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button onClick={() => onClose(id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};
