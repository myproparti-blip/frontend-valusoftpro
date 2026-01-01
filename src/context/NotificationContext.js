import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, memo } from "react";
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unauthorizedNotificationId, setUnauthorizedNotificationId] = useState(null);
    const timeoutsRef = React.useRef({});

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
            timeoutsRef.current = {};
        };
    }, []);

    const showNotification = useCallback((message, type = "info", duration = 5000) => {
        const id = Date.now() + Math.random(); // Ensure unique ID
        const notification = { id, message, type };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            // Clear any existing timeout for this ID
            if (timeoutsRef.current[id]) {
                clearTimeout(timeoutsRef.current[id]);
            }

            timeoutsRef.current[id] = setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                delete timeoutsRef.current[id];
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        // Clear the timeout if it exists
        if (timeoutsRef.current[id]) {
            clearTimeout(timeoutsRef.current[id]);
            delete timeoutsRef.current[id];
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration = 5000) => {
        return showNotification(message, "success", duration);
    }, [showNotification]);

    const showError = useCallback((message, duration = 5000) => {
        return showNotification(message, "error", duration);
    }, [showNotification]);

    const showWarning = useCallback((message, duration = 5000) => {
        return showNotification(message, "warning", duration);
    }, [showNotification]);

    const showInfo = useCallback((message, duration = 5000) => {
        return showNotification(message, "info", duration);
    }, [showNotification]);

    // Show persistent unauthorized error (no auto-close)
    const showUnauthorizedError = useCallback((message = "Unauthorized – Please login to continue.") => {
        const id = showNotification(message, "error", -1); // -1 means no auto-close
        setUnauthorizedNotificationId(id);
        return id;
    }, [showNotification]);

    // Hide unauthorized error notification
    const hideUnauthorizedError = useCallback(() => {
        if (unauthorizedNotificationId) {
            removeNotification(unauthorizedNotificationId);
            setUnauthorizedNotificationId(null);
        }
    }, [unauthorizedNotificationId, removeNotification]);

    // Memoize context value to prevent unnecessary re-renders of all consumers
    const contextValue = useMemo(() => ({
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        showUnauthorizedError,
        hideUnauthorizedError,
        notifications,
    }), [showNotification, showSuccess, showError, showWarning, showInfo, removeNotification, showUnauthorizedError, hideUnauthorizedError, notifications]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationPanel notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

// Memoized notification item to prevent re-renders of individual notifications
const NotificationItem = memo(({ notification, onRemove }) => {
    const getTypeStyles = (type) => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-800",
                    icon: <FaCheckCircle className="w-5 h-5 text-green-600" />,
                };
            case "error":
                return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-800",
                    icon: <FaExclamationCircle className="w-5 h-5 text-red-600" />,
                };
            case "warning":
                return {
                    bg: "bg-yellow-50",
                    border: "border-yellow-200",
                    text: "text-yellow-800",
                    icon: <FaExclamationCircle className="w-5 h-5 text-yellow-600" />,
                };
            default:
                return {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-800",
                    icon: <FaInfoCircle className="w-5 h-5 text-blue-600" />,
                };
        }
    };

    const styles = getTypeStyles(notification.type);

    return (
        <div
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-right-full`}
        >
            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
            <div className="flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>
                    {notification.message}
                </p>
            </div>
            <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 ml-2"
            >
                <FaTimes className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
        </div>
    );
});

NotificationItem.displayName = "NotificationItem";

const NotificationPanel = memo(({ notifications, onRemove }) => {
    return (
        <div className="fixed right-4 top-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
});

NotificationPanel.displayName = "NotificationPanel";
