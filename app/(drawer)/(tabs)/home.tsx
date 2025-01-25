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

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  return (
    <Pressable onPress={onPress} my={2}>
      <Box
        borderWidth={1}
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
      >
        <Image
          source={
            recipe.image
              ? { uri: recipe.image }
              : require("../../../assets/placeholder.png")
          }
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
    try {
      const data = await recipeService.getAll({ search });
      console.log("Fetched recipes:", data);
      setRecipesList(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Nie udało się pobrać przepisów");
      toast.show({
        description: "Wystąpił błąd podczas pobierania przepisów",
        placement: "top",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    _.debounce((query: string) => {
      fetchRecipes(query);
    }, 500),
    []
  );

  useEffect(() => {
    console.log("Component mounted, fetching recipes...");
    fetchRecipes();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleRefresh = () => {
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
                onPress={() => router.push(`/(tabs)/recipes/${item.id}` as any)}
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

      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        icon={<Icon color="white" as={Ionicons} name="add" size="sm" />}
        onPress={() => router.push("/(tabs)/recipes/edit/new" as any)}
        placement="bottom-right"
      />
    </Box>
  );
}
