import React, { useState } from "react";
import {
  Box,
  VStack,
  FormControl,
  Input,
  Button,
  useToast,
  Heading,
  Text,
  Link,
} from "native-base";
import { router } from "expo-router";
import { authService } from "../../src/services/authService";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.show({
        description: "Wypełnij wszystkie pola",
        placement: "top",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast.show({
        description: "Hasła nie są identyczne",
        placement: "top",
      });
      return false;
    }

    if (password.length < 6) {
      toast.show({
        description: "Hasło musi mieć co najmniej 6 znaków",
        placement: "top",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.show({
        description: "Podaj prawidłowy adres email",
        placement: "top",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({ name, email, password });
      router.replace("/(tabs)/recipes/index");
    } catch (error: any) {
      toast.show({
        description: error.message || "Błąd podczas rejestracji",
        placement: "top",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box flex={1} p={6} bg="white" justifyContent="center">
      <VStack space={8} alignItems="center">
        <Heading size="lg">Utwórz konto</Heading>

        <VStack space={4} width="100%">
          <FormControl isRequired>
            <FormControl.Label>Imię</FormControl.Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Twoje imię"
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Email</FormControl.Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Twój email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Hasło</FormControl.Label>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 znaków"
              type="password"
            />
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Potwierdź hasło</FormControl.Label>
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Powtórz hasło"
              type="password"
            />
          </FormControl>

          <Button
            onPress={handleRegister}
            isLoading={isLoading}
            isLoadingText="Rejestracja..."
          >
            Zarejestruj się
          </Button>

          <Box alignItems="center">
            <Text>Masz już konto?</Text>
            <Link onPress={() => router.push("/(auth)/login")}>
              <Text color="primary.500" fontWeight="medium">
                Zaloguj się
              </Text>
            </Link>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}
