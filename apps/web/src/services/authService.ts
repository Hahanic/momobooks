import api from "../lib/api";
import { type IUser } from "../types/index.ts";

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

  searchUsers: async (query: string): Promise<IUser[]> => {
    const res = await api.get(`/auth/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};
