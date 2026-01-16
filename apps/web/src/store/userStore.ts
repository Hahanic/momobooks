import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authService } from "../services/authService";
import type { IUser, IUserCredentials } from "../types/index.ts";

interface UserState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: IUserCredentials) => void;
  register: (credentials: IUserCredentials) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (credentials: IUserCredentials) => {
        const response = await authService.login(credentials.email, credentials.password);
        localStorage.setItem("token", response.data.token);
        set({ user: response.data, token: response.data.token, isAuthenticated: true });
      },
      register: async (credentials: IUserCredentials) => {
        const response = await authService.register(credentials.email, credentials.password);
        localStorage.setItem("token", response.data.token);
        set({ user: response.data, token: response.data.token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
