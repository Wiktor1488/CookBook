import axios from "axios";
import { Recipe, CreateRecipeData, UpdateRecipeData } from "../types/api";

const BASE_URL = "http://10.0.2.2:3000";
console.log("API Base URL:", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
