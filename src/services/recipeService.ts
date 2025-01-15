import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

// Importowanie danych z pliku JSON
import recipesJsonData from "../data/recipes.json"; // Dostosuj ścieżkę do pliku

const RECIPES_STORAGE_KEY = "@recipes";

export type Difficulty = "easy" | "medium" | "hard";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image: string;
  cookingTime: number;
  servings: number;
  difficulty: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

class RecipeService {
  private recipes: Recipe[] = [];
  private readonly IMAGES_DIR = `${FileSystem.documentDirectory}recipe_images/`;

  constructor() {
    console.log("Initializing RecipeService...");
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Sprawdź, czy katalog na zdjęcia istnieje
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, {
          intermediates: true,
        });
      }

      // Sprawdź, czy są zapisane przepisy w AsyncStorage
      const storedRecipes = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
      console.log("Stored recipes:", storedRecipes);

      if (storedRecipes) {
        const parsedRecipes = JSON.parse(storedRecipes);
        this.recipes = parsedRecipes.map(this.validateRecipe);
      } else {
        // Jeśli nie ma zapisanych przepisów, wczytaj dane z pliku JSON
        console.log("Loading recipes from JSON file");
        this.recipes = recipesJsonData.recipes.map(this.validateRecipe);
        await this.saveToStorage(); // Zapisz dane do AsyncStorage po załadowaniu
      }

      console.log("Recipes initialized:", this.recipes);
    } catch (error) {
      console.error("Error initializing storage:", error);
      // Fallback do danych z pliku JSON w przypadku błędu
      this.recipes = recipesJsonData.recipes.map(this.validateRecipe);
    }
  }

  private validateRecipe(recipe: any): Recipe {
    // Walidacja pól przepisu
    return {
      ...recipe,
      createdAt: recipe.createdAt || new Date().toISOString(),
      updatedAt: recipe.updatedAt || new Date().toISOString(),
    };
  }

  private async saveToStorage() {
    try {
      await AsyncStorage.setItem(
        RECIPES_STORAGE_KEY,
        JSON.stringify(this.recipes)
      );
      console.log("Recipes saved to AsyncStorage:", this.recipes);
    } catch (error) {
      console.error("Error saving recipes:", error);
    }
  }

  // Nowa metoda do pobierania przepisu po ID
  async getById(id: string): Promise<Recipe | undefined> {
    console.log("Getting recipe by ID:", id);
    return this.recipes.find((recipe) => recipe.id === id);
  }

  async getAll(params?: { search?: string }): Promise<Recipe[]> {
    console.log("Getting all recipes with params:", params);

    let filteredRecipes = [...this.recipes];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower)
      );
    }

    return filteredRecipes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async create(
    data: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "authorId">
  ): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...data,
      id: Date.now().toString(),
      authorId: "1", // Załóżmy, że autor to "1"
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.recipes.push(newRecipe);
    await this.saveToStorage(); // Zapisz dane po dodaniu nowego przepisu
    return newRecipe;
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    const index = this.recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      throw new Error("Recipe not found");
    }

    const updatedRecipe = this.validateRecipe({
      ...this.recipes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    });

    this.recipes[index] = updatedRecipe;
    await this.saveToStorage(); // Zapisz dane po edycji przepisu
    return updatedRecipe;
  }

  async delete(id: string): Promise<void> {
    this.recipes = this.recipes.filter((recipe) => recipe.id !== id);
    await this.saveToStorage(); // Zapisz dane po usunięciu przepisu
  }
}

// Utwórz jedną instancję serwisu, która będzie używana w całej aplikacji
const recipeService = new RecipeService();
export { recipeService, RecipeService };
export default recipeService;
