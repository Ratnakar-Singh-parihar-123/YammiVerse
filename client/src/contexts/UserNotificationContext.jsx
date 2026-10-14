import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import api, { API_BASE_URL } from "../utils/api";
import { getAuthToken, getAuthUser } from "../utils/auth";
import { io } from "socket.io-client";

const UserNotificationContext = createContext(null);

export const useUserNotifications = () => {
  const context = useContext(UserNotificationContext);

  if (!context) {
    throw new Error(
      "useUserNotifications must be inside UserNotificationProvider",
    );
  }

  return context;
};

const getNotificationId = (item) =>
  item?._id || item?.notification?._id || item?.notification;

const getBroadcastId = (item) => {
  const notification = item?.notification || item;
  return notification?._id?.toString?.() || null;
};

const normalizeNotification = (item) => {
  if (!item) return null;

  // Standard UserNotification document from the API.
  if (item.notification && typeof item.notification === "object") {
    return item;
  }

  // A broadcast record received directly through Socket.IO.
  return {
    _id: item.userNotificationId || item._id,
    notification: item,
    isRead: false,
    createdAt: item.sentAt || item.createdAt || new Date().toISOString(),
  };
};

export const UserNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getAuthUser());
  const [currentToken, setCurrentToken] = useState(() => getAuthToken());
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const requestIdRef = useRef(0);
  const notificationsRef = useRef([]);
  const currentUserIdRef = useRef(currentUser?._id || currentUser?.id || null);

  const isUser =
    Boolean(currentUser) &&
    currentUser.role !== "admin" &&
    Boolean(currentToken);

  // Keep refs synchronized for socket callbacks.
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    currentUserIdRef.current = currentUser?._id || currentUser?.id || null;
  }, [currentUser]);

  // Listen for login/logout/account changes.
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getAuthUser());
      setCurrentToken(getAuthToken());
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const fetchNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!currentUser || currentUser.role === "admin" || !currentToken) {
        requestIdRef.current += 1;
        setNotifications([]);
        setUnreadCount(0);
        setError("");
        setLoading(false);
        return;
      }

      const requestId = ++requestIdRef.current;

      if (!silent) setLoading(true);
      setError("");

      try {
        // Keep this URL consistent with your actual backend routes.
        const response = await api.get("/api/user-notifications?limit=30");

        if (requestId !== requestIdRef.current) return;

        const items = response.data?.notifications || [];

        setNotifications(items);
        setUnreadCount(
          Number(
            response.data?.unreadCount ??
              items.filter((item) => !item.isRead).length,
          ),
        );
      } catch (err) {
        if (requestId === requestIdRef.current) {
          console.error("fetchUserNotifications error:", err.message);
          setError(
            err.response?.data?.message || "Unable to load notifications.",
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [currentUser, currentToken],
  );

  // Fetch when the authenticated user changes.
  useEffect(() => {
    fetchNotifications();

    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return false;

      const existing = notificationsRef.current.find((item) => item._id === id);

      if (!existing) return false;
      if (existing.isRead) return true;

      // Optimistically update the UI.
      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));

      try {
        await api.patch(
          `/api/user-notifications/${encodeURIComponent(id)}/read`,
        );

        return true;
      } catch (err) {
        console.error("markUserAsRead error:", err.message);

        await fetchNotifications({ silent: true });
        return false;
      }
    },
    [fetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    const previousNotifications = notificationsRef.current;
    const previousUnreadCount = previousNotifications.filter(
      (item) => !item.isRead,
    ).length;

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await api.patch("/api/user-notifications/mark-all-read");
    } catch (err) {
      console.error("markAllUserRead error:", err.message);

      await fetchNotifications({ silent: true });

      // The refresh retrieves the authoritative read state from the server.
      setError(
        err.response?.data?.message ||
          "Unable to mark all notifications as read.",
      );

      return;
    }
  }, [fetchNotifications]);

  // Authenticated Socket.IO connection.
  useEffect(() => {
    if (!isUser || !currentToken) return undefined;

    const socket = io(API_BASE_URL, {
      auth: { token: currentToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    const handleNewNotification = (payload) => {
      const normalized = normalizeNotification(payload);
      if (!normalized) return;

      const broadcastId = getBroadcastId(normalized);

      const exists = notificationsRef.current.some((item) => {
        const sameRecipientRecord = item._id === normalized._id;

        const sameBroadcast =
          broadcastId && getBroadcastId(item) === broadcastId;

        return sameRecipientRecord || sameBroadcast;
      });

      // The server may emit the same broadcast on more than one event.
      if (exists) return;

      // Refetch to obtain the authoritative recipient-specific record ID.
      // This keeps mark-as-read requests compatible with the backend API.
      fetchNotifications({ silent: true });
    };

    const handleConnectError = (err) => {
      console.warn("User socket connection error:", err.message);
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:broadcast", handleNewNotification);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:broadcast", handleNewNotification);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [isUser, currentToken, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllRead,
    refresh: fetchNotifications,
    getNotificationId,
  };

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
};

export default UserNotificationContext;
