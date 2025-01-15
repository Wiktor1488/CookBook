import React, { useState } from "react";
import { HStack, Input, IconButton, Icon, VStack, Text } from "native-base";
import { Ionicons } from "@expo/vector-icons";

interface IngredientInputProps {
  ingredients: string[];
  onAddIngredient: (ingredient: string) => void;
  onRemoveIngredient: (index: number) => void;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
}) => {
  const [newIngredient, setNewIngredient] = useState("");

  const handleAdd = () => {
    if (newIngredient.trim()) {
      onAddIngredient(newIngredient.trim());
      setNewIngredient("");
    }
  };

  return (
    <VStack space={2}>
      <HStack space={2}>
        <Input
          flex={1}
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder="Np. 200g mąki"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <IconButton
          icon={<Icon as={Ionicons} name="add" />}
          onPress={handleAdd}
          variant="solid"
          colorScheme="blue"
        />
      </HStack>

      <VStack space={2}>
        {ingredients.map((ingredient, index) => (
          <HStack
            key={index}
            space={2}
            alignItems="center"
            bg="gray.50"
            p={2}
            borderRadius="md"
          >
            <Icon as={Ionicons} name="ellipse" size="xs" color="gray.400" />
            <Text flex={1}>{ingredient}</Text>
            <IconButton
              icon={<Icon as={Ionicons} name="trash-outline" />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onPress={() => onRemoveIngredient(index)}
            />
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
