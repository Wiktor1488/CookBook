// src/screens/RecipeDetailsScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Icon,
  IconButton,
  Spinner,
  useToast,
  Heading,
  Divider,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "../../../../src/types/api";
import recipeService from "../../../../src/services/recipeService";

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const toast = useToast();

  const fetchRecipe = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recipeService.getById(id as string);
      if (!data) {
        throw new Error("Recipe not found");
      }
      setRecipe(data);
    } catch (error) {
      toast.show({
        description: "Nie udało się pobrać przepisu",
        placement: "top",
        variant: "error",
      });
      router.push("/(drawer)/(tabs)/home");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchRecipe();
    }, [fetchRecipe])
  );

  const handleDelete = async () => {
    try {
      await recipeService.delete(id as string);
      toast.show({
        description: "Przepis został usunięty",
        placement: "top",
      });
      router.push("/(drawer)/(tabs)/home");
    } catch (error) {
      toast.show({
        description: "Nie udało się usunąć przepisu",
        placement: "top",
        variant: "error",
      });
    }
  };

  const handleEdit = () => {
    router.push(`/(drawer)/recipes/edit/${recipe?.id}?forceReload=true` as any);
  };

  const handleRefresh = () => {
    fetchRecipe();
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implementacja zapisywania ulubionych w przyszłości
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!recipe) {
    return null;
  }

  const difficultyColor: { [key: string]: string } = {
    easy: "green.500",
    medium: "yellow.500",
    hard: "red.500",
  };

  const difficultyText: { [key: string]: string } = {
    easy: "Łatwy",
    medium: "Średni",
    hard: "Trudny",
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <Box position="relative" height={300}>
        <Image
          source={{
            uri: recipe.image
              ? `http://10.0.2.2:3000/uploads/${recipe.image.split("/").pop()}`
              : require("../../../../src/uploads/placeholder.png"),
          }}
          alt={recipe.title}
          height="100%"
          width="100%"
          resizeMode="cover"
          fallbackElement={
            <Box
              height="100%"
              width="100%"
              bg="gray.100"
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                as={Ionicons}
                name="image-outline"
                size="6xl"
                color="gray.400"
              />
            </Box>
          }
        />

        <HStack
          position="absolute"
          top={4}
          left={4}
          right={4}
          justifyContent="space-between"
        >
          <IconButton
            icon={<Icon as={Ionicons} name="arrow-back" color="white" />}
            onPress={() => router.push("/(drawer)/(tabs)/home")}
            variant="solid"
            bg="rgba(0,0,0,0.5)"
            _pressed={{ bg: "rgba(0,0,0,0.7)" }}
          />
          <HStack space={2}>
            <IconButton
              icon={<Icon as={Ionicons} name="refresh-outline" color="white" />}
              onPress={handleRefresh}
              variant="solid"
              bg="rgba(0,0,0,0.5)"
              _pressed={{ bg: "rgba(0,0,0,0.7)" }}
            />
            <IconButton
              icon={
                <Icon
                  as={Ionicons}
                  name={isFavorite ? "heart" : "heart-outline"}
                  color="white"
                />
              }
              onPress={toggleFavorite}
              variant="solid"
              bg="rgba(0,0,0,0.5)"
              _pressed={{ bg: "rgba(0,0,0,0.7)" }}
            />
          </HStack>
        </HStack>

        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="rgba(0,0,0,0.7)"
          p={4}
        >
          <Heading color="white" size="xl">
            {recipe.title}
          </Heading>
          <Text color="white" mt={1} numberOfLines={2}>
            {recipe.description}
          </Text>
        </Box>
      </Box>

      <ScrollView>
        <VStack p={4} space={6}>
          <HStack justifyContent="space-around">
            <VStack alignItems="center">
              <Icon
                as={Ionicons}
                name="time-outline"
                size="lg"
                color="gray.500"
              />
              <Text fontWeight="bold">{recipe.cookingTime} min</Text>
              <Text fontSize="sm" color="gray.500">
                Czas
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Icon
                as={Ionicons}
                name="people-outline"
                size="lg"
                color="gray.500"
              />
              <Text fontWeight="bold">{recipe.servings}</Text>
              <Text fontSize="sm" color="gray.500">
                Porcje
              </Text>
            </VStack>
            <VStack alignItems="center">
              <Icon
                as={Ionicons}
                name="medal-outline"
                size="lg"
                color={difficultyColor[recipe.difficulty]}
              />
              <Text
                fontWeight="bold"
                color={difficultyColor[recipe.difficulty]}
              >
                {difficultyText[recipe.difficulty]}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Trudność
              </Text>
            </VStack>
          </HStack>

          <Divider my={4} />

          <Heading size="md">Składniki</Heading>
          <VStack space={2} mt={2}>
            {recipe.ingredients?.map((ingredient: string, index: number) => (
              <Text key={index} fontSize="md">
                - {ingredient}
              </Text>
            ))}
          </VStack>

          <Divider my={4} />

          <Heading size="md">Instrukcje</Heading>
          <Text mt={2}>{recipe.instructions}</Text>
        </VStack>
      </ScrollView>
    </Box>
  );
}
