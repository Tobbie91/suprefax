import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Notification } from "../types/api";

interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "suprefax-store",
      partialize: (state) => ({ user: state.user }) as Partial<StoreState>,
    }
  )
);

export default useStore;
