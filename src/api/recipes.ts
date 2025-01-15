import { api } from "./config";
import { Recipe, CreateRecipeData, UpdateRecipeData } from "../types/api";

export const recipes = {
  getAll: async (params?: { search?: string; filter?: string }) => {
    const response = await api.get<Recipe[]>("/recipes", { params });
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

  uploadImage: async (id: string, imageUri: string) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "recipe.jpg",
    });

    const response = await api.post(`/recipes/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUserRecipes: async (userId: string) => {
    const response = await api.get<Recipe[]>(`/users/${userId}/recipes`);
    return response.data;
  },
};
