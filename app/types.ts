// Ten komponent jest wymagany przez expo-router
export default function Types() {
  return null;
}

// Tutaj możesz dodać swoje typy
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image: string | null;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
