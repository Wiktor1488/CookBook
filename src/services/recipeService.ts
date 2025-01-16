import { Recipe, CreateRecipeData, UpdateRecipeData } from "../types/api";
import { recipes } from "../api/config";

class RecipeService {
  constructor() {
    console.log("Initializing RecipeService...");
  }

  async getById(id: string): Promise<Recipe | undefined> {
    try {
      console.log("Getting recipe by ID:", id);
      const response = await recipes.getById(id);
      return response;
    } catch (error) {
      console.error("Error getting recipe:", error);
      throw error;
    }
  }

  async getAll(params?: { search?: string }): Promise<Recipe[]> {
    try {
      console.log("Getting all recipes with params:", params);
      const response = await recipes.getAll(params);
      return response;
    } catch (error) {
      console.error("Error getting recipes:", error);
      throw error;
    }
  }

  async create(data: CreateRecipeData): Promise<Recipe> {
    try {
      const response = await recipes.create(data);
      return response;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    try {
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

const recipeService = new RecipeService();
export { recipeService, RecipeService };
export default recipeService;
