import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAuthToken } from "../utils/auth";
import { API_BASE_URL } from "../utils/api";

let sharedSocket = null;

const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    // Reuse existing connection if valid
    if (sharedSocket && sharedSocket.connected) {
      socketRef.current = sharedSocket;
      setConnected(true);
      return;
    }

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
      setConnected(false);
    });

    sharedSocket = socket;
    socketRef.current = socket;

    return () => {
      // Don't disconnect the shared socket on every unmount
      // Only if we're navigating away from admin section entirely
    };
  }, []);

  return { socket: socketRef.current, connected };
};

export default useSocket;
