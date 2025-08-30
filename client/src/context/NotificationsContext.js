"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const s = io(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}`, {
      withCredentials: true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (user?.email) socket.emit("join", user.email);
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    const handler = (evt) =>
      setNotifications((prev) => [evt, ...prev].slice(0, 50));
    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [socket]);

  return (
    <NotificationsContext.Provider value={{ notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
