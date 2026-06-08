import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useStore from "../store/useStore";
import { disconnectSocket } from "../socket";

export const useSignOut = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useStore((s) => s.clearUser);
  const clearNotifications = useStore((s) => s.clearNotifications);

  return useCallback(() => {
    localStorage.removeItem("token");
    disconnectSocket();
    clearNotifications();
    clearUser();
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [navigate, queryClient, clearUser, clearNotifications]);
};
