import axios from "axios";
import { Recipe, CreateRecipeData } from "../types/api";
import { recipes } from "../api/config";

class RecipeService {
  private baseUrl = "http://10.0.2.2:3000";

  async getById(id: string): Promise<Recipe | undefined> {
    try {
      const response = await recipes.getById(id);
      return response;
    } catch (error) {
      console.error("Error getting recipe:", error);
      throw error;
    }
  }

  async getAll(params?: { search?: string }): Promise<Recipe[]> {
    try {
      const response = await recipes.getAll(params);
      return response;
    } catch (error) {
      console.error("Error getting recipes:", error);
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

      const response = await axios.post(
        `${this.baseUrl}/recipes/${id}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          transformRequest: (data) => data,
        }
      );

      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  async create(data: CreateRecipeData): Promise<Recipe> {
    try {
      const response = await recipes.create(data);

      if (data.image && data.image.startsWith("file://")) {
        const imageUrl = await this.uploadImage(response.id, data.image);
        return this.update(response.id, { ...response, image: imageUrl });
      }

      return response;
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

      const response = await recipes.update({ id, ...data });
      return response;
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await recipes.delete(id);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  }
}

export const recipeService = new RecipeService();
export default recipeService;
