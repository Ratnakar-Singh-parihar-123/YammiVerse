import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import api from "../utils/api";
import { getAuthToken, getAuthUser } from "../utils/auth";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../utils/api";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const user = getAuthUser();
  const token = getAuthToken();
  const isAdmin = user?.role === "admin";

  // ── Fetch from REST API ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const res = await api.get("/api/notifications?limit=30");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch (err) {
      console.error("fetchNotifications error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // ── Mark single notification as read ────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markAsRead error:", err.message);
    }
  }, []);

  // ── Mark all as read ────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllRead error:", err.message);
    }
  }, []);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin || !token) return;
    fetchNotifications();
  }, [isAdmin, token, fetchNotifications]);

  // ── Socket.IO real-time listener ─────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin || !token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("admin:notification", (notification) => {
      setNotifications((prev) => {
        // Deduplicate
        const exists = prev.find((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev].slice(0, 50);
      });
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("connect_error", (err) => {
      console.warn("Admin socket error:", err.message);
    });

    return () => {
      socket.off("admin:notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAdmin, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
