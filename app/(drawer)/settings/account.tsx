import React, { useState, useRef } from "react";
import {
  Box,
  VStack,
  FormControl,
  Input,
  Button,
  ScrollView,
  useToast,
  AlertDialog,
  Icon,
  Divider,
  Text,
  Avatar,
  Pressable,
  HStack,
} from "native-base";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

interface UserAccount {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
  };
}

export default function AccountSettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [userData, setUserData] = useState<UserAccount>({
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    avatar: "https://via.placeholder.com/150",
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      newsletter: false,
    },
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toast = useToast();
  const cancelRef = useRef(null);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementacja aktualizacji profilu
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.show({
        description: "Profil został zaktualizowany",
        placement: "top",
      });
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas aktualizacji profilu",
        placement: "top",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.show({
        description: "Hasła nie są identyczne",
        placement: "top",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementacja zmiany hasła
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.show({
        description: "Hasło zostało zmienione",
        placement: "top",
      });
      setShowPasswordDialog(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas zmiany hasła",
        placement: "top",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implementacja usuwania konta
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.show({
        description: "Konto zostało usunięte",
        placement: "top",
      });
      router.push("/(auth)/login" as any);
    } catch (error) {
      toast.show({
        description: "Wystąpił błąd podczas usuwania konta",
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
        description: "Wystąpił błąd podczas wybierania zdjęcia",
        placement: "top",
        variant: "error",
      });
    }
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView p={4}>
        <VStack space={6}>
          {/* Avatar section */}
          <VStack alignItems="center" space={2}>
            <Pressable onPress={handlePickImage}>
              <Avatar size="2xl" source={{ uri: userData.avatar || undefined }}>
                {!userData.avatar && (
                  <Icon
                    as={Ionicons}
                    name="person"
                    size="xl"
                    color="gray.400"
                  />
                )}
                <Avatar.Badge bg="green.500" />
              </Avatar>
            </Pressable>
            <Text fontSize="sm" color="gray.500">
              Dotknij aby zmienić zdjęcie
            </Text>
          </VStack>

          <Divider />

          {/* Profile Form */}
          <VStack space={4}>
            <Text fontSize="xl" fontWeight="bold">
              Dane profilu
            </Text>

            <FormControl>
              <FormControl.Label>Imię i nazwisko</FormControl.Label>
              <Input
                value={userData.name}
                onChangeText={(value) =>
                  setUserData((prev) => ({ ...prev, name: value }))
                }
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Email</FormControl.Label>
              <Input
                value={userData.email}
                onChangeText={(value) =>
                  setUserData((prev) => ({ ...prev, email: value }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Telefon</FormControl.Label>
              <Input
                value={userData.phone}
                onChangeText={(value) =>
                  setUserData((prev) => ({ ...prev, phone: value }))
                }
                keyboardType="phone-pad"
              />
            </FormControl>

            <Button
              onPress={handleUpdateProfile}
              isLoading={isLoading}
              leftIcon={<Icon as={Ionicons} name="save-outline" />}
            >
              Zapisz zmiany
            </Button>
          </VStack>

          <Divider />

          {/* Security section */}
          <VStack space={4}>
            <Text fontSize="xl" fontWeight="bold">
              Bezpieczeństwo
            </Text>

            <Button
              variant="outline"
              onPress={() => setShowPasswordDialog(true)}
              leftIcon={<Icon as={Ionicons} name="lock-closed-outline" />}
            >
              Zmień hasło
            </Button>
          </VStack>

          <Divider />

          {/* Danger zone */}
          <VStack space={4}>
            <Text fontSize="xl" fontWeight="bold" color="red.500">
              Strefa niebezpieczna
            </Text>

            <Button
              colorScheme="red"
              variant="outline"
              onPress={() => setShowDeleteDialog(true)}
              leftIcon={<Icon as={Ionicons} name="trash-outline" />}
            >
              Usuń konto
            </Button>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Change Password Dialog */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Zmiana hasła</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={3}>
              <FormControl>
                <FormControl.Label>Obecne hasło</FormControl.Label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>Nowe hasło</FormControl.Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>Potwierdź nowe hasło</FormControl.Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </FormControl>
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowPasswordDialog(false)}
                ref={cancelRef}
              >
                Anuluj
              </Button>
              <Button
                colorScheme="primary"
                onPress={handleChangePassword}
                isLoading={isLoading}
              >
                Zmień hasło
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Usuń konto</AlertDialog.Header>
          <AlertDialog.Body>
            Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można
            cofnąć.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowDeleteDialog(false)}
                ref={cancelRef}
              >
                Anuluj
              </Button>
              <Button colorScheme="red" onPress={handleDeleteAccount}>
                Usuń konto
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
}
