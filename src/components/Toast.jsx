import { useEffect } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icon = type === "error" ? "✕" : type === "warning" ? "⚠️" : "✓";

  return (
    <div className={`toast-notification toast-${type}`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close" aria-label="Dismiss toast">
        ✕
      </button>
    </div>
  );
}

export default Toast;
