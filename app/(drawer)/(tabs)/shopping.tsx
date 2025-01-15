import React, { useState } from "react";
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
} from "native-base";
import { Ionicons } from "@expo/vector-icons";

interface ShoppingItem {
  id: string;
  name: string;
  isChecked: boolean;
  quantity?: string;
  unit?: string;
  fromRecipe?: string;
}

// Przykładowe dane
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
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const toast = useToast();

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

        <ScrollView>
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
        </ScrollView>

        {items.some((item) => item.isChecked) && (
          <Button
            onPress={handleClearCompleted}
            variant="outline"
            colorScheme="red"
            leftIcon={<Icon as={Ionicons} name="trash-outline" />}
          >
            Usuń kupione produkty
          </Button>
        )}
      </VStack>
    </Box>
  );
}
