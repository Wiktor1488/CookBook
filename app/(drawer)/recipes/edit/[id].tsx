import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Box,
  VStack,
  FormControl,
  Input,
  Button,
  Image,
  IconButton,
  Icon,
  useToast,
  HStack,
  Text,
  Select,
  Spinner,
  View,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CustomTextArea } from "../../../../components/CustomTextArea";
import {
  Recipe,
  Difficulty,
  CreateRecipeData,
} from "../../../../src/types/api";
import recipeService from "../../../../src/services/recipeService";
interface FormData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image: string | null;
  cookingTime: number;
  servings: number;
  difficulty: Difficulty;
}

const defaultFormData: FormData = {
  title: "",
  description: "",
  ingredients: [],
  instructions: "",
  image: null,
  cookingTime: 30,
  servings: 4,
  difficulty: "medium",
};

export default function RecipeFormScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = id !== "new";
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const toast = useToast();

  useEffect(() => {
    if (isEditing) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const recipe = await recipeService.getById(id as string);
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      setFormData({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        image: recipe.image || null,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty as Difficulty,
      });
    } catch (error) {
      toast.show({
        description: "Nie udało się załadować przepisu",
        placement: "top",
        variant: "error",
      });
      router.replace("/(drawer)/(tabs)/home");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) {
      toast.show({
        description: "Wpisz nazwę składnika",
        placement: "top",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient.trim()],
    }));
    setNewIngredient("");
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const uploadImage = async (uri: string): Promise<string> => {
    // Tymczasowa implementacja upload'u zdjęć
    return uri;
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast.show({
          description: "Potrzebujemy dostępu do aparatu aby zrobić zdjęcie.",
          placement: "top",
          variant: "error",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uploadedImageUri = await uploadImage(result.assets[0].uri);
        setFormData((prev) => ({
          ...prev,
          image: uploadedImageUri,
        }));
      }
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas robienia zdjęcia",
        placement: "top",
        variant: "error",
      });
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uploadedImageUri = await uploadImage(result.assets[0].uri);
        setFormData((prev) => ({
          ...prev,
          image: uploadedImageUri,
        }));
      }
    } catch (error) {
      toast.show({
        description: "Nie udało się wybrać zdjęcia",
        placement: "top",
        variant: "error",
      });
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Nazwa przepisu jest wymagana");
    }

    if (!formData.description.trim()) {
      errors.push("Opis przepisu jest wymagany");
    }

    if (formData.ingredients.length === 0) {
      errors.push("Dodaj przynajmniej jeden składnik");
    }

    if (!formData.instructions.trim()) {
      errors.push("Instrukcje przygotowania są wymagane");
    }

    if (formData.cookingTime <= 0) {
      errors.push("Czas przygotowania musi być większy niż 0");
    }

    if (formData.servings <= 0) {
      errors.push("Liczba porcji musi być większa niż 0");
    }

    if (errors.length > 0) {
      toast.show({
        description: errors.join("\n"),
        placement: "top",
        duration: 4000,
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Konwersja FormData do parametrów Recipe
 const recipeData: CreateRecipeData = {
   title: formData.title,
   description: formData.description,
   ingredients: formData.ingredients,
   instructions: formData.instructions,
   image: formData.image || "",
   cookingTime: formData.cookingTime,
   servings: formData.servings,
   difficulty: formData.difficulty,
   id: Math.random().toString(36).substr(2, 9),
   authorId: "user123", // tymczasowe
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
 };

      if (isEditing) {
        await recipeService.update(id as string, recipeData);
      } else {
        await recipeService.create(recipeData);
      }

      toast.show({
        description: `Przepis został ${
          isEditing ? "zaktualizowany" : "utworzony"
        }`,
        placement: "top",
      });
      router.replace("/(drawer)/(tabs)/home");
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas zapisywania",
        placement: "top",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box flex={1} bg="white" safeArea>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Reszta renderowania bez zmian */}
        </ScrollView>
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
