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
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

// Dodany typ dla plików w React Native
export interface ImageFile {
  uri: string;
  type: string;
  name: string;
}
