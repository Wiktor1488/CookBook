import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "../src/services/authService";
import { Box, Spinner } from "native-base";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthed = await authService.isAuthenticated();
      setIsAuthenticated(isAuthed);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Redirect
      href={isAuthenticated ? "/(drawer)/(tabs)/home" : "/(auth)/login"}
    />
  );
}
