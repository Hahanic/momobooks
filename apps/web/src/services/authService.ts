import { type IUser } from "@momobooks/shared";

import api from "../lib/api";

interface AuthResponse {
  message: string;
  data: IUser & { token: string };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  },

  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", { email, password });
    return response.data;
  },
};
