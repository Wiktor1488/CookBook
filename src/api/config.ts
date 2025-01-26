// src/api/config.ts
import axios from "axios";
import { Recipe, CreateRecipeData, UpdateRecipeData } from "../types/api";
import { Platform } from "react-native";

const BASE_URL = "http://192.168.1.12:3000"; // < to dla telefonu
//const BASE_URL = "http://10.0.2.2:3000"; < to dla emulatora

console.log("API Base URL:", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json", //multipart/form-data
  },
});
api.interceptors.request.use(
  (config) => {
    console.log("Request URL:", config.url);
    console.log("Request Method:", config.method);
    console.log("Request Headers:", config.headers);
    console.log("Request Data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Network Error Details:", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error.message,
      config: error?.config?.url,
    });
    return Promise.reject(error);
  }
);
export const recipes = {
  getAll: async (params?: { search?: string; filter?: string }) => {
    console.log("API call: getAll with params:", params);
    const response = await api.get<Recipe[]>("/recipes", { params });
    console.log("API response:", response.data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Recipe>(`/recipes/${id}`);
    return response.data;
  },

  create: async (data: CreateRecipeData) => {
    const response = await api.post<Recipe>("/recipes", data);
    return response.data;
  },

  update: async ({ id, ...data }: UpdateRecipeData) => {
    const response = await api.put<Recipe>(`/recipes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/recipes/${id}`);
  },
};
