export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
export type Difficulty = "easy" | "medium" | "hard";
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeData {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}
