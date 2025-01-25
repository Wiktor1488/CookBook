import React, { useState } from "react";
import { Platform } from "react-native";
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  FormControl,
  Input,
  Button,
  Image,
  IconButton,
  Icon,
  useToast,
  TextArea,
  ITextAreaProps,
  Select,
} from "native-base";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { recipeService } from "../../../src/services/recipeService";
import { CreateRecipeData } from "../../../src/types/api";

interface CustomTextAreaProps extends Partial<ITextAreaProps> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  numberOfLines?: number;
}

const CustomTextArea = React.forwardRef<any, CustomTextAreaProps>(
  (props, ref) => (
    <TextArea
      {...{
        w: "100%",
        autoCompleteType: undefined,
        tvParallaxProperties: {},
        onTextInput: () => {},
        ...props,
      }}
      ref={ref}
    />
  )
);

export default function AddRecipeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [cookingTime, setCookingTime] = useState("30");
  const [servings, setServings] = useState("4");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async () => {
    if (!title || !description || !ingredients || !instructions) {
      toast.show({
        description: "Wypełnij wszystkie wymagane pola.",
        placement: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const recipeData: CreateRecipeData = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        ingredients: ingredients.split("\n").filter((item) => item.trim()),
        instructions,
        cookingTime: parseInt(cookingTime) || 30,
        servings: parseInt(servings) || 4,
        difficulty,
        image: image || "./assets/images/placeholder.png",
        authorId: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Wysyłane dane:", recipeData); // Dodaj logi
      const newRecipe = await recipeService.create(recipeData);
      console.log("Odpowiedź z serwera:", newRecipe); // Dodaj logi
      if (image) {
        console.log("Wysyłanie zdjęcia..."); // Dodaj logi
        const imageUrl = await recipeService.uploadImage(newRecipe.id, image);
        console.log("URL zdjęcia:", imageUrl); // Dodaj logi
        await recipeService.update(newRecipe.id, {
          ...recipeData,
          image: imageUrl,
        });
      }

      toast.show({
        description: "Przepis dodany pomyślnie!",
        placement: "top",
      });
      router.push("/(drawer)/(tabs)/home");
    } catch (error) {
      console.error("Błąd:", error);
      toast.show({
        description: "Wystąpił błąd podczas dodawania przepisu.",
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== "web") {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast.show({
          description: "Potrzebujemy dostępu do aparatu.",
          placement: "top",
        });
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      toast.show({
        description: "Błąd podczas robienia zdjęcia.",
        placement: "top",
      });
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      toast.show({
        description: "Błąd podczas wybierania zdjęcia.",
        placement: "top",
      });
    }
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView p={4}>
        <VStack space={4}>
          <Box
            height={200}
            bg="gray.100"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                alt="Zdjęcie przepisu"
                size="full"
              />
            ) : (
              <Box flex={1} justifyContent="center" alignItems="center">
                <Icon
                  as={Ionicons}
                  name="image-outline"
                  size="6xl"
                  color="gray.400"
                />
              </Box>
            )}
            <HStack position="absolute" bottom={2} right={2} space={2}>
              <IconButton
                icon={<Icon as={Ionicons} name="camera" />}
                onPress={takePhoto}
                bg="white"
                _icon={{ color: "gray.800" }}
              />
              <IconButton
                icon={<Icon as={Ionicons} name="images" />}
                onPress={pickImage}
                bg="white"
                _icon={{ color: "gray.800" }}
              />
            </HStack>
          </Box>

          <FormControl isRequired>
            <FormControl.Label>Nazwa przepisu</FormControl.Label>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Np. Spaghetti Bolognese"
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Krótki opis</FormControl.Label>
            <CustomTextArea
              value={description}
              onChangeText={setDescription}
              placeholder="Krótki opis przepisu..."
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Składniki</FormControl.Label>
            <CustomTextArea
              value={ingredients}
              onChangeText={setIngredients}
              placeholder="Lista składników (każdy w nowej linii)..."
              numberOfLines={4}
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Instrukcje</FormControl.Label>
            <CustomTextArea
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Sposób przygotowania..."
              numberOfLines={6}
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Czas przygotowania (minuty)</FormControl.Label>
            <Input
              value={cookingTime}
              onChangeText={setCookingTime}
              keyboardType="numeric"
              placeholder="Np. 30"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Liczba porcji</FormControl.Label>
            <Input
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholder="Np. 4"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Poziom trudności</FormControl.Label>
            <Select
              selectedValue={difficulty}
              onValueChange={(itemValue: string) =>
                setDifficulty(itemValue as "easy" | "medium" | "hard")
              }
              placeholder="Wybierz poziom trudności"
            >
              <Select.Item label="Łatwy" value="easy" />
              <Select.Item label="Średni" value="medium" />
              <Select.Item label="Trudny" value="hard" />
            </Select>
          </FormControl>

          <Button onPress={handleSubmit} isLoading={loading} mt={4}>
            Dodaj przepis
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
}
