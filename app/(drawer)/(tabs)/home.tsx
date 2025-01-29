import React, { useState, useEffect, useCallback } from "react";
import { RefreshControl } from "react-native";
import {
  Box,
  FlatList,
  Heading,
  Input,
  IconButton,
  VStack,
  HStack,
  Text,
  Pressable,
  Image,
  Icon,
  Spinner,
  Fab,
  useToast,
  Button,
} from "native-base";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { recipeService } from "../../../src/services/recipeService";
import { Recipe } from "../../../src/types/api";
import _ from "lodash";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const imageSource = recipe.image
    ? { uri: `http://192.168.1.12:3000${recipe.image}` }
    : require("../../../src/uploads/placeholder.png");

  return (
    <Pressable onPress={onPress} my={2}>
      <Box
        borderWidth={1}
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
      >
        <Image
          source={imageSource}
          alt={recipe.title}
          height={200}
          width="100%"
          fallbackElement={
            <Box
              height={200}
              bg="gray.100"
              justifyContent="center"
              alignItems="center"
            >
              <Icon
                as={Ionicons}
                name="image-outline"
                size="4xl"
                color="gray.400"
              />
            </Box>
          }
        />
        <VStack p={4} space={2}>
          <Heading size="md">{recipe.title}</Heading>
          <Text numberOfLines={2} color="gray.600">
            {recipe.description}
          </Text>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={4}>
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="time-outline" size="sm" />
                <Text>{recipe.cookingTime} min</Text>
              </HStack>
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="people-outline" size="sm" />
                <Text>{recipe.servings} porcji</Text>
              </HStack>
            </HStack>
            <Text color="gray.500" textTransform="capitalize">
              {recipe.difficulty}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

export default function RecipesScreen() {
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const fetchRecipes = async (search?: string) => {
    console.log("Fetching recipes with search:", search);
    setIsLoading(true);
    try {
      const params = search ? { search: search.trim() } : undefined;
      const data = await recipeService.getAll(params);
      console.log("Fetched recipes:", data);
      setRecipesList(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Nie udało się pobrać przepisów");
      toast.show({
        description: "Wystąpił błąd podczas pobierania przepisów",
        placement: "top",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const debouncedSearch = useCallback(
    _.debounce((query: string) => {
      console.log("Debounced search with query:", query);
      if (query) {
        fetchRecipes(query);
      } else {
        fetchRecipes();
      }
    }, 500),
    []
  );

  useEffect(() => {
    console.log("Component mounted, fetching initial recipes...");
    fetchRecipes();

    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const handleSearch = (query: string) => {
    console.log("Search query changed:", query);
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleRefresh = () => {
    console.log("Refreshing recipes...");
    setIsRefreshing(true);
    fetchRecipes(searchQuery);
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
      <VStack space={4} flex={1} p={4}>
        {/* Search Bar */}
        <HStack space={2}>
          <Input
            flex={1}
            placeholder="Szukaj przepisów..."
            value={searchQuery}
            onChangeText={handleSearch}
            InputLeftElement={
              <Icon
                as={Ionicons}
                name="search"
                size={5}
                ml={2}
                color="gray.400"
              />
            }
          />
          <IconButton
            icon={<Icon as={Ionicons} name="filter" />}
            borderRadius="lg"
            variant="outline"
          />
        </HStack>

        {error ? (
          <VStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            space={4}
          >
            <Icon
              as={Ionicons}
              name="alert-circle-outline"
              size="4xl"
              color="gray.400"
            />
            <Text color="gray.500">{error}</Text>
            <Button onPress={() => fetchRecipes()}>Spróbuj ponownie</Button>
          </VStack>
        ) : (
          <FlatList
            data={recipesList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() =>
                  router.push(`/(drawer)/(tabs)/recipes/${item.id}` as any)
                }
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <Box flex={1} justifyContent="center" alignItems="center" py={10}>
                <Text color="gray.500">
                  {searchQuery
                    ? "Nie znaleziono przepisów"
                    : "Brak przepisów do wyświetlenia"}
                </Text>
              </Box>
            }
          />
        )}
      </VStack>
    </Box>
  );
}
