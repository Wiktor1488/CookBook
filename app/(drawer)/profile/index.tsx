import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Pressable,
  Icon,
  Button,
  ScrollView,
  useToast,
  IconButton,
  Divider,
  FlatList,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { recipeService } from "../../../src/services/recipeService";
import { Recipe } from "../../../src/types/api";

interface UserStats {
  recipes: number;
  followers: number;
  following: number;
  favorites: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  stats: UserStats;
}

interface StatBoxProps {
  label: string;
  value: number;
}

interface RecipeCardProps {
  recipe: Recipe;
}

//192.168.1.12:3000 < telefon

//10.0.2.2:3000 < emulator

const mockUserData: UserData = {
  id: "1",
  name: "Jan Kowalski",
  email: "jan.kowalski@mail.com",
  bio: "Pasjonat gotowania i dzielenia się przepisami",
  avatar: "http://192.168.1.12:3000/uploads/avatar.jpg",
  stats: {
    recipes: 15,
    followers: 124,
    following: 89,
    favorites: 45,
  },
};

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => (
  <VStack alignItems="center" flex={1}>
    <Text fontWeight="bold" fontSize="lg">
      {value}
    </Text>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
  </VStack>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => (
  <Pressable
    onPress={() => router.push(`/(tabs)/recipes/${recipe.id}` as any)}
    mb={4}
  >
    <Box
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box height={150}>
        <Avatar
          source={{
            uri: recipe.image
              ? `http://192.168.1.12:3000/uploads/${recipe.image
                  .split("/")
                  .pop()}`
              : require("../../../src/uploads/placeholder.png"),
          }}
          size="full"
        />
      </Box>
      <VStack p={3} space={2}>
        <Text fontSize="md" fontWeight="bold">
          {recipe.title}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={3}>
            <HStack space={1} alignItems="center">
              <Icon
                as={Ionicons}
                name="time-outline"
                size="sm"
                color="gray.500"
              />
              <Text>{recipe.cookingTime} min</Text>
            </HStack>
            <HStack space={1} alignItems="center">
              <Icon
                as={Ionicons}
                name="people-outline"
                size="sm"
                color="gray.500"
              />
              <Text>{recipe.servings}</Text>
            </HStack>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  </Pressable>
);

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>(mockUserData);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const toast = useToast();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const recipes = await recipeService.getUserRecipes("1");
        setUserRecipes(recipes);
      } catch (error) {
        toast.show({
          description: "Nie udało się pobrać przepisów",
          placement: "top",
          variant: "error",
        });
      }
    };
    fetchUserRecipes();
  }, []);

  const handleEditAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUserData((prev) => ({
          ...prev,
          avatar: result.assets[0].uri,
        }));
      }
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas zmiany zdjęcia profilowego",
        placement: "top",
      });
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView>
        <VStack space={6} p={4}>
          <HStack justifyContent="flex-end">
            <IconButton
              icon={<Icon as={Ionicons} name="settings-outline" />}
              onPress={() => router.push("/(tabs)/settings" as any)}
            />
          </HStack>

          <VStack space={4} alignItems="center">
            <Pressable onPress={handleEditAvatar}>
              <Avatar size="2xl" source={{ uri: userData.avatar }}>
                <Avatar.Badge bg="green.500" />
              </Avatar>
            </Pressable>
            <VStack alignItems="center" space={1}>
              <Text fontSize="xl" fontWeight="bold">
                {userData.name}
              </Text>
              <Text color="gray.500">{userData.email}</Text>
              <Text textAlign="center" px={8}>
                {userData.bio}
              </Text>
            </VStack>
            <Button
              onPress={handleEditProfile}
              variant="outline"
              leftIcon={<Icon as={Ionicons} name="create-outline" />}
            >
              Edytuj profil
            </Button>
          </VStack>

          <HStack justifyContent="space-around" p={4}>
            <StatBox label="Przepisy" value={userData.stats.recipes} />
            <StatBox label="Obserwujący" value={userData.stats.followers} />
            <StatBox label="Obserwowani" value={userData.stats.following} />
            <StatBox label="Ulubione" value={userData.stats.favorites} />
          </HStack>

          <Divider />

          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                Moje przepisy
              </Text>
              <Button
                variant="ghost"
                endIcon={<Icon as={Ionicons} name="arrow-forward" />}
              >
                Zobacz wszystkie
              </Button>
            </HStack>

            <FlatList
              data={userRecipes}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
