"use client";

import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";

export type SocketConnectionStatus = "connected" | "connecting" | "disconnected";

export function useSocketStatus() {
  const [status, setStatus] = useState<SocketConnectionStatus>(() => {
    const socket = getSocket();
    if (socket?.connected) return "connected";
    if (socket) return "connecting";
    return "disconnected";
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      setStatus("disconnected");
      return;
    }

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleConnectError = () => setStatus("connecting");
    const handleReconnectAttempt = () => setStatus("connecting");

    // Initialize immediate state
    if (socket.connected) {
      setStatus("connected");
    } else {
      setStatus("connecting");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("reconnect", handleConnect);

    // Periodic safety check
    const interval = setInterval(() => {
      const currentSocket = getSocket();
      if (!currentSocket) {
        setStatus("disconnected");
      } else if (currentSocket.connected) {
        setStatus("connected");
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("reconnect", handleConnect);
    };
  }, []);

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
  };
}
