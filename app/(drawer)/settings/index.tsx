import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Pressable,
  Icon,
  useColorMode,
  Select,
  Button,
  Divider,
  useToast,
  AlertDialog,
  ISelectProps,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GestureResponderEvent } from "react-native";

interface SettingsOption {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: "switch" | "select" | "button" | "link";
  value?: boolean | string;
  options?: { label: string; value: string }[];
  onPress?: (event: GestureResponderEvent) => void;
  onToggle?: (value: boolean) => void;
  onSelect?: (value: string) => void;
}

interface SettingsItemProps extends SettingsOption {}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  icon,
  type,
  value,
  options,
  onPress,
  onToggle,
  onSelect,
}) => {
  const renderControl = () => {
    switch (type) {
      case "switch":
        return (
          <Switch isChecked={value as boolean} onToggle={onToggle} size="lg" />
        );
      case "select":
        return (
          <Select
            selectedValue={value as string}
            minWidth={120}
            onValueChange={onSelect}
          >
            {options?.map((option) => (
              <Select.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Select>
        );
      case "link":
        return (
          <Icon
            as={Ionicons}
            name="chevron-forward"
            size="sm"
            color="gray.400"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Pressable onPress={type === "link" ? onPress : undefined} py={4}>
      <HStack space={4} alignItems="center">
        <Icon as={Ionicons} name={icon} size="md" color="gray.500" />
        <VStack flex={1}>
          <Text fontSize="md" fontWeight="medium">
            {title}
          </Text>
          {description && (
            <Text fontSize="sm" color="gray.500">
              {description}
            </Text>
          )}
        </VStack>
        {renderControl()}
      </HStack>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pl");
  const [units, setUnits] = useState("metric");

  const toast = useToast();
  const cancelRef = React.useRef(null);
  const { setColorMode } = useColorMode();

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    router.push("/(auth)/login" as any);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast.show({
      description: "Język został zmieniony",
      placement: "top",
    });
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    setColorMode(value ? "dark" : "light");
  };

  const settingsOptions: SettingsOption[] = [
    {
      id: "notifications",
      title: "Powiadomienia",
      description: "Włącz powiadomienia o nowych przepisach",
      icon: "notifications-outline",
      type: "switch",
      value: notificationsEnabled,
      onToggle: (value) => setNotificationsEnabled(value),
    },
    {
      id: "darkMode",
      title: "Tryb ciemny",
      icon: "moon-outline",
      type: "switch",
      value: darkMode,
      onToggle: handleDarkModeToggle,
    },
    {
      id: "language",
      title: "Język",
      icon: "language-outline",
      type: "select",
      value: language,
      options: [
        { label: "Polski", value: "pl" },
        { label: "English", value: "en" },
      ],
      onSelect: handleLanguageChange,
    },
    {
      id: "units",
      title: "Jednostki miary",
      icon: "scale-outline",
      type: "select",
      value: units,
      options: [
        { label: "Metryczne", value: "metric" },
        { label: "Imperialne", value: "imperial" },
      ],
      onSelect: (value: string) => setUnits(value),
    },
    {
      id: "account",
      title: "Ustawienia konta",
      icon: "person-outline",
      type: "link",
      onPress: () => router.push("/account-settings" as any),
    },
    {
      id: "privacy",
      title: "Prywatność",
      icon: "lock-closed-outline",
      type: "link",
      onPress: () => router.push("/privacy-settings" as any),
    },
  ];

  return (
    <Box flex={1} bg="white" safeArea>
      <VStack p={4} space={2}>
        <VStack space={2} divider={<Divider />}>
          {settingsOptions.map((option) => (
            <SettingsItem key={option.id} {...option} />
          ))}
        </VStack>

        <Button
          onPress={() => setIsLogoutDialogOpen(true)}
          colorScheme="red"
          variant="outline"
          leftIcon={<Icon as={Ionicons} name="log-out-outline" />}
          mt={8}
        >
          Wyloguj się
        </Button>
      </VStack>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Wylogowanie</AlertDialog.Header>
          <AlertDialog.Body>
            Czy na pewno chcesz się wylogować?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setIsLogoutDialogOpen(false)}
                ref={cancelRef}
              >
                Anuluj
              </Button>
              <Button colorScheme="red" onPress={handleLogout}>
                Wyloguj
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
}
