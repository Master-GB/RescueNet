import React, { useEffect } from 'react';
import { useMissingPersonContext } from '../../contexts/MissingPersonContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContainer = () => {
  const { notifications, markNotificationRead, clearNotifications } = useMissingPersonContext();

  // Debug logging
  console.log('NotificationContainer - All notifications:', notifications);
  const visibleNotifications = notifications.filter(n => !n.read);
  console.log('NotificationContainer - Visible notifications:', visibleNotifications);

  // Auto-dismiss notifications after timeout
  useEffect(() => {
    const timers = notifications.map(notification => {
      if (notification.type !== 'error') {
        return setTimeout(() => {
          markNotificationRead(notification.id);
        }, notification.type === 'warning' ? 4000 : 5000);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [notifications, markNotificationRead]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
            transform transition-all duration-300 ease-in-out
            ${getNotificationStyles(notification.type)}
            ${index === 0 ? 'animate-slide-in-right' : 'opacity-90'}
          `}
          style={{
            animation: index === 0 ? 'slideInRight 0.3s ease-out' : 'none',
            maxWidth: '400px'
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-3">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-xs opacity-90 leading-relaxed">
              {notification.message}
            </p>
            {notification.timestamp && (
              <p className="text-xs opacity-70 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={() => markNotificationRead(notification.id)}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}

      {/* Clear All Button (if multiple notifications) */}
      {visibleNotifications.length > 1 && (
        <button
          onClick={clearNotifications}
          className="text-xs text-gray-600 hover:text-gray-800 underline text-center w-full py-1"
        >
          Clear all notifications
        </button>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;
