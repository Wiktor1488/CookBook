import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Settings, TouchableOpacity } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";

function DrawerButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginRight: 15 }}
    >
      <Ionicons name="menu-outline" size={24} color="black" />
    </TouchableOpacity>
  );
}

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
          drawerItemStyle: { display: "none" }, // Ukrycie tego elementu w menu szuflady
          headerShown: false, // Ukrycie nagłówka
        }}
      />
      <Drawer.Screen
        name="settings/account"
        options={{
          drawerItemStyle: { display: "none" }, // Ukrycie tego elementu w menu szuflady
          headerShown: false, // Ukrycie nagłówka
        }}
      />
      <Drawer.Screen
        name="recipes/[id]"
        options={{
          drawerItemStyle: { display: "none" }, // Ukrycie tego elementu w menu szuflady
          headerShown: false, // Ukrycie nagłówka
        }}
      />
      <Drawer.Screen
        name="recipes/edit/[id]"
        options={{
          drawerItemStyle: { display: "none" }, // Ukrycie tego elementu w menu szuflady
          headerShown: false, // Ukrycie nagłówka
        }}
      />
    </Drawer>
  );
}
