import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { buildTextPrimary, buildTextSecondary } from '../lib/design-system';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({
  id,
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationProps) {
  const { highContrast } = useTheme();

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, onClose, autoClose, duration]);

  const getNotificationStyles = () => {
    const baseStyles = "bg-white/90 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl";
    const contrastStyles = "bg-black border-2 border-yellow-400";

    switch (type) {
      case 'success':
        return highContrast
          ? `${contrastStyles} border-green-400`
          : `${baseStyles} border-green-200`;
      case 'error':
        return highContrast
          ? `${contrastStyles} border-red-400`
          : `${baseStyles} border-red-200`;
      case 'warning':
        return highContrast
          ? `${contrastStyles} border-orange-400`
          : `${baseStyles} border-orange-200`;
      case 'info':
      default:
        return highContrast
          ? `${contrastStyles} border-blue-400`
          : `${baseStyles} border-blue-200`;
    }
  };

  const getIconStyles = () => {
    if (highContrast) {
      return "text-yellow-400";
    }

    switch (type) {
      case 'success':
        return "text-green-600";
      case 'error':
        return "text-red-600";
      case 'warning':
        return "text-orange-600";
      case 'info':
      default:
        return "text-blue-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`
        ${getNotificationStyles()}
        p-6 max-w-md w-full
        animate-in slide-in-from-right-5 fade-in-0 duration-300
        hover:-translate-y-1 transition-all
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${getIconStyles()}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${buildTextPrimary(highContrast)} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${buildTextSecondary(highContrast)} leading-relaxed`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`
            flex-shrink-0 p-1 rounded-lg
            transition-all duration-200 hover:-translate-y-0.5
            ${highContrast
              ? 'text-yellow-400 hover:bg-yellow-400/10'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
            }
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
  }>;
  onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={onClose}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<
    Array<{
      id: string;
      type: NotificationType;
      title: string;
      message: string;
    }>
  >([]);

  const addNotification = React.useCallback((
    type: NotificationType,
    title: string,
    message: string
  ) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, title, message }]);
    return id;
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}