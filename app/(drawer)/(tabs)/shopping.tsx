import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Icon,
  Checkbox,
  useToast,
  Button,
  Divider,
  ScrollView,
  Pressable,
  Spinner,
  Alert,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { StyleSheet, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface ShoppingItem {
  id: string;
  name: string;
  isChecked: boolean;
  quantity?: string;
  unit?: string;
  fromRecipe?: string;
}

interface Store {
  id: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
}

const initialItems: ShoppingItem[] = [
  {
    id: "1",
    name: "Makaron spaghetti",
    quantity: "500",
    unit: "g",
    isChecked: false,
    fromRecipe: "Spaghetti Bolognese",
  },
  {
    id: "2",
    name: "Mięso mielone",
    quantity: "400",
    unit: "g",
    isChecked: false,
    fromRecipe: "Spaghetti Bolognese",
  },
  {
    id: "3",
    name: "Cebula",
    quantity: "2",
    unit: "szt",
    isChecked: true,
    fromRecipe: "Spaghetti Bolognese",
  },
];

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const toast = useToast();

  useEffect(() => {
    (async () => {
      setIsLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Odmowa dostępu do lokalizacji");
        setIsLoadingLocation(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        fetchNearbyStores(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg("Nie można pobrać lokalizacji");
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const fetchNearbyStores = async (latitude: number, longitude: number) => {
    // Przykładowe dane:
    const mockStores: Store[] = [
      {
        id: "1",
        name: "Biedronka",
        distance: 0.3,
        latitude: latitude + 0.001,
        longitude: longitude + 0.001,
      },
      {
        id: "2",
        name: "Lidl",
        distance: 0.5,
        latitude: latitude - 0.001,
        longitude: longitude - 0.001,
      },
      {
        id: "3",
        name: "Żabka",
        distance: 0.8,
        latitude: latitude + 0.002,
        longitude: longitude + 0.002,
      },
    ];
    setNearbyStores(mockStores);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.show({
        description: "Wpisz nazwę produktu",
        placement: "top",
      });
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      unit: newItemUnit.trim(),
      isChecked: false,
    };

    setItems([newItem, ...items]);
    setNewItemName("");
    setNewItemQuantity("");
    setNewItemUnit("");
  };

  const handleToggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleClearCompleted = () => {
    setItems(items.filter((item) => !item.isChecked));
  };

  const openMapsForStore = (store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    Linking.openURL(url);
  };

  const groupedItems = items.reduce((acc, item) => {
    const fromRecipe = item.fromRecipe || "Inne produkty";
    if (!acc[fromRecipe]) {
      acc[fromRecipe] = [];
    }
    acc[fromRecipe].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <Box flex={1} bg="white" safeArea>
      {/* Input section - fixed at top */}
      <VStack space={4} p={4}>
        <HStack space={2} alignItems="center">
          <VStack flex={1}>
            <Input
              placeholder="Nazwa produktu"
              value={newItemName}
              onChangeText={setNewItemName}
              size="lg"
            />
            <HStack space={2} mt={2}>
              <Input
                placeholder="Ilość"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                flex={1}
                keyboardType="numeric"
              />
              <Input
                placeholder="Jednostka"
                value={newItemUnit}
                onChangeText={setNewItemUnit}
                flex={1}
              />
            </HStack>
          </VStack>
          <IconButton
            icon={<Icon as={Ionicons} name="add" />}
            onPress={handleAddItem}
            borderRadius="lg"
            variant="solid"
            size="lg"
          />
        </HStack>
      </VStack>

      {/* Scrollable content */}
      <ScrollView flex={1}>
        <VStack space={4} p={4}>
          {/* Nearby stores section */}
          <VStack space={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="gray.600">
                Sklepy w pobliżu
              </Text>
              <Button
                size="sm"
                onPress={() => setShowMap(!showMap)}
                leftIcon={
                  <Icon as={Ionicons} name={showMap ? "list" : "map"} />
                }
              >
                {showMap ? "Lista" : "Mapa"}
              </Button>
            </HStack>

            {isLoadingLocation ? (
              <HStack space={2} justifyContent="center" p={4}>
                <Spinner />
                <Text>Wyszukiwanie sklepów...</Text>
              </HStack>
            ) : errorMsg ? (
              <Alert status="error">{errorMsg}</Alert>
            ) : showMap && location ? (
              <Box height={200} borderRadius="lg" overflow="hidden">
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="Twoja lokalizacja"
                    pinColor="blue"
                  />
                  {nearbyStores.map((store) => (
                    <Marker
                      key={store.id}
                      coordinate={{
                        latitude: store.latitude,
                        longitude: store.longitude,
                      }}
                      title={store.name}
                      description={`${store.distance} km`}
                    />
                  ))}
                </MapView>
              </Box>
            ) : (
              <VStack space={2}>
                {nearbyStores.map((store) => (
                  <Pressable
                    key={store.id}
                    onPress={() => openMapsForStore(store)}
                  >
                    <HStack
                      space={2}
                      alignItems="center"
                      bg="gray.50"
                      p={3}
                      borderRadius="lg"
                    >
                      <Icon
                        as={Ionicons}
                        name="location-outline"
                        size="sm"
                        color="gray.500"
                      />
                      <VStack flex={1}>
                        <Text fontSize="md">{store.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {store.distance} km
                        </Text>
                      </VStack>
                      <Icon
                        as={Ionicons}
                        name="navigate-outline"
                        size="sm"
                        color="blue.500"
                      />
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            )}
          </VStack>

          {/* Shopping list items */}
          <VStack space={4}>
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <VStack key={category} space={2}>
                <Text fontSize="lg" fontWeight="bold" color="gray.600">
                  {category}
                </Text>
                {categoryItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleToggleItem(item.id)}
                  >
                    <HStack
                      space={2}
                      alignItems="center"
                      bg="gray.50"
                      p={3}
                      borderRadius="lg"
                    >
                      <Checkbox
                        isChecked={item.isChecked}
                        onChange={() => handleToggleItem(item.id)}
                        value={item.id}
                      />
                      <VStack flex={1}>
                        <Text
                          fontSize="md"
                          strikeThrough={item.isChecked}
                          color={item.isChecked ? "gray.400" : "gray.800"}
                        >
                          {item.name}
                        </Text>
                        {(item.quantity || item.unit) && (
                          <Text fontSize="sm" color="gray.500">
                            {item.quantity} {item.unit}
                          </Text>
                        )}
                      </VStack>
                      <IconButton
                        icon={<Icon as={Ionicons} name="trash-outline" />}
                        variant="ghost"
                        colorScheme="red"
                        onPress={() => handleDeleteItem(item.id)}
                      />
                    </HStack>
                  </Pressable>
                ))}
                <Divider />
              </VStack>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Footer button - fixed at bottom */}
      {items.some((item) => item.isChecked) && (
        <Box p={4}>
          <Button
            onPress={handleClearCompleted}
            variant="outline"
            colorScheme="red"
            leftIcon={<Icon as={Ionicons} name="trash-outline" />}
          >
            Usuń kupione produkty
          </Button>
        </Box>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
