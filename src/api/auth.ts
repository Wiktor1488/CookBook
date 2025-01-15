import { api } from "./config";
import { LoginCredentials, RegisterData, AuthResponse } from "../types/api";

export const auth = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  validateToken: async () => {
    const response = await api.get<{ valid: boolean }>("/auth/validate");
    return response.data.valid;
  },
};
