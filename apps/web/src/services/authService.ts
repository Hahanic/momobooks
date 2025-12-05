import { type IUser } from "@momobooks/shared";

import api from "../lib/api";

interface AuthResponse {
  message: string;
  data: IUser & { token: string };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return await api.post("/auth/login", { email, password });
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    return await api.post("/auth/register", { email, password });
  },
};
