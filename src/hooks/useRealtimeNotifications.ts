import { useEffect } from "react";
import { getSocket } from "../socket";
import useStore from "../store/useStore";
import type { Notification } from "../types/api";

export const useRealtimeNotifications = (): void => {
  const addNotification = useStore((state) => state.addNotification);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (data: Notification) => {
      addNotification(data);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [addNotification]);
};
