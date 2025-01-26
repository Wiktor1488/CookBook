import { api } from "../api/config";
import { Recipe, CreateRecipeData } from "../types/api";
import * as Notifications from "expo-notifications";

class RecipeService {
  async getById(id: string): Promise<Recipe | undefined> {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting recipe:", error);
      throw error;
    }
  }

  async getAll(params?: { search?: string }): Promise<Recipe[]> {
    try {
      const response = await api.get("/recipes", { params });
      return response.data; // zwróć response.data zamiast całego wywołania api.get
    } catch (error) {
      console.error("Błąd pobierania przepisów:", error);
      throw error;
    }
  }
  async uploadImage(id: string, imageUri: string) {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "recipe.jpg",
      } as any);

      const response = await api.post(`/recipes/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  async getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
      const response = await api.get(`/users/${userId}/recipes`);
      return response.data;
    } catch (error) {
      console.error("Error getting user recipes:", error);
      throw error;
    }
  }
  async create(data: CreateRecipeData): Promise<Recipe> {
    try {
      const response = await api.post("/recipes", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nowy przepis dodany!",
          body: `Przepis "${data.title}" został pomyślnie dodany.`,
        },
        trigger: null,
      });

      if (data.image && data.image.startsWith("file://")) {
        const imageUrl = await this.uploadImage(response.data.id, data.image);
        return this.update(response.data.id, {
          ...response.data,
          image: imageUrl,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    try {
      if (data.image && data.image.startsWith("file://")) {
        const imageUrl = await this.uploadImage(id, data.image);
        data.image = imageUrl;
      }

      const response = await api.put(`/recipes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/recipes/${id}`);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  }
}

export const recipeService = new RecipeService();
export default recipeService;
