import React, { createContext, useContext, useMemo, useState } from "react";

const VolunteerContext = createContext(null);

export const VolunteerProvider = ({ children }) => {
  const [availabilityStatus, setAvailabilityStatus] = useState("OFFLINE");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const next = {
      id: notification?.id || `${Date.now()}-${Math.random()}`,
      type: notification?.type || "info",
      title: notification?.title || "Notification",
      message: notification?.message || "",
      createdAt: notification?.createdAt || new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const duplicate = prev.some(
        (item) =>
          item.type === next.type &&
          item.title === next.title &&
          item.message === next.message &&
          Math.abs(new Date(item.createdAt).getTime() - new Date(next.createdAt).getTime()) < 5000,
      );

      if (duplicate) {
        return prev;
      }

      return [next, ...prev].slice(0, 30);
    });
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = useMemo(
    () => ({
      availabilityStatus,
      setAvailabilityStatus,
      activeTaskId,
      setActiveTaskId,
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
    }),
    [availabilityStatus, activeTaskId, notifications],
  );

  return <VolunteerContext.Provider value={value}>{children}</VolunteerContext.Provider>;
};

export const useVolunteerContext = () => {
  const context = useContext(VolunteerContext);

  if (!context) {
    throw new Error("useVolunteerContext must be used within VolunteerProvider");
  }

  return context;
};

export default VolunteerContext;
