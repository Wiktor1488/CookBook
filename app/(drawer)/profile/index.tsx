import React, { useState } from "react";
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

interface Recipe {
  id: string;
  title: string;
  image: string;
  likes: number;
  comments: number;
}

interface StatBoxProps {
  label: string;
  value: number;
}

interface RecipeCardProps {
  recipe: Recipe;
}

// Przykładowe dane użytkownika
const mockUserData: UserData = {
  id: "1",
  name: "Jan Kowalski",
  email: "jan.kowalski@example.com",
  bio: "Pasjonat gotowania i dzielenia się przepisami",
  avatar: "https://via.placeholder.com/150",
  stats: {
    recipes: 15,
    followers: 124,
    following: 89,
    favorites: 45,
  },
};

// Przykładowe przepisy użytkownika
const mockUserRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Bolognese",
    image: "https://via.placeholder.com/150",
    likes: 23,
    comments: 5,
  },
  {
    id: "2",
    title: "Kurczak curry",
    image: "https://via.placeholder.com/150",
    likes: 15,
    comments: 3,
  },
];

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
    onPress={() => router.push(`/(tabs)/recipes/edit/${recipe.id}` as any)}
    mb={4}
  >
    <Box
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box height={150}>
        <Avatar source={{ uri: recipe.image }} size="full" />
      </Box>
      <VStack p={3} space={2}>
        <Text fontSize="md" fontWeight="bold">
          {recipe.title}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={3}>
            <HStack space={1} alignItems="center">
              <Icon as={Ionicons} name="heart" size="sm" color="red.500" />
              <Text>{recipe.likes}</Text>
            </HStack>
            <HStack space={1} alignItems="center">
              <Icon
                as={Ionicons}
                name="chatbubble"
                size="sm"
                color="gray.500"
              />
              <Text>{recipe.comments}</Text>
            </HStack>
          </HStack>
          <IconButton
            icon={<Icon as={Ionicons} name="ellipsis-vertical" />}
            variant="ghost"
            size="sm"
          />
        </HStack>
      </VStack>
    </Box>
  </Pressable>
);

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData>(mockUserData);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>(mockUserRecipes);

  const toast = useToast();

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
    // TODO: Przekierowanie do ekranu edycji profilu
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView>
        <VStack space={6} p={4}>
          {/* Header section */}
          <HStack justifyContent="flex-end">
            <IconButton
              icon={<Icon as={Ionicons} name="settings-outline" />}
              onPress={() => router.push("/(tabs)/settings" as any)}
            />
          </HStack>

          {/* Profile info section */}
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

          {/* Stats section */}
          <HStack justifyContent="space-around" p={4}>
            <StatBox label="Przepisy" value={userData.stats.recipes} />
            <StatBox label="Obserwujący" value={userData.stats.followers} />
            <StatBox label="Obserwowani" value={userData.stats.following} />
            <StatBox label="Ulubione" value={userData.stats.favorites} />
          </HStack>

          <Divider />

          {/* Recipes section */}
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                Moje przepisy
              </Text>
              <Button
                variant="ghost"
                endIcon={<Icon as={Ionicons} name="arrow-forward" />}
                onPress={() => {
                  // TODO: Przekierowanie do pełnej listy przepisów
                }}
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
