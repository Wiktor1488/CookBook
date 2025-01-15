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
} from "native-base";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

interface CustomTextAreaProps extends Partial<ITextAreaProps> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  numberOfLines?: number;
}

const CustomTextArea = React.forwardRef<any, CustomTextAreaProps>(
  (props, ref) => {
    const baseProps = {
      w: "100%",
      autoCompleteType: undefined,
      onTextInput: () => {},
      tvParallaxProperties: {},
      ...props,
    };

    return <TextArea {...baseProps} ref={ref} />;
  }
);

export default function AddRecipeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast.show({
          description: "Potrzebujemy dostępu do aparatu aby zrobić zdjęcie.",
          placement: "top",
        });
        return false;
      }
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();

    if (!hasPermission) return;

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
      console.error("Błąd podczas robienia zdjęcia:", error);
      toast.show({
        description: "Wystąpił błąd podczas robienia zdjęcia.",
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
      console.error("Błąd podczas wybierania zdjęcia:", error);
      toast.show({
        description: "Wystąpił błąd podczas wybierania zdjęcia.",
        placement: "top",
      });
    }
  };

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
      // TODO: Implementacja wysyłania danych do API

      toast.show({
        description: "Przepis został dodany pomyślnie!",
        placement: "top",
      });
      router.back();
    } catch (error) {
      console.error("Błąd podczas dodawania przepisu:", error);
      toast.show({
        description: "Wystąpił błąd podczas dodawania przepisu.",
        placement: "top",
      });
    } finally {
      setLoading(false);
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
              placeholder="Lista składników..."
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

          <Button onPress={handleSubmit} isLoading={loading} mt={4}>
            Dodaj przepis
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
}
