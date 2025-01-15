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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        description: "Wypełnij wszystkie pola",
        placement: "top",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ email, password });
      router.replace("/(drawer)/(tabs)/home");
    } catch (error) {
      toast.show({
        description: "Nieprawidłowy email lub hasło",
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
        <Heading size="lg">Zaloguj się</Heading>

        <VStack space={4} width="100%">
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
              placeholder="Twoje hasło"
              type="password"
            />
          </FormControl>

          <Button
            onPress={handleLogin}
            isLoading={isLoading}
            isLoadingText="Logowanie..."
          >
            Zaloguj się
          </Button>

          <Box alignItems="center">
            <Text>Nie masz jeszcze konta?</Text>
            <Link onPress={() => router.push("/(auth)/register")}>
              <Text color="primary.500" fontWeight="medium">
                Zarejestruj się
              </Text>
            </Link>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}
