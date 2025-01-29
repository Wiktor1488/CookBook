import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";

// Wydzielony jako osobny komponent funkcyjny
const DrawerButton = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ marginRight: 15 }}>
      <Ionicons name="menu-outline" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerPosition: "right",
        headerLeft: () => null,
        headerRight: () => <DrawerButton />,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Główne menu",
          title: "Książka kucharska",
          drawerIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile/index"
        options={{
          drawerLabel: "Profil",
          title: "Profil",
          drawerIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          drawerLabel: "Ustawienia",
          title: "Ustawienia",
          drawerIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="recipes/settings"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="settings/account"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="recipes/edit/[id]"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
