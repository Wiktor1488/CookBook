import { Slot } from "expo-router";
import { NativeBaseProvider } from "native-base";
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NativeBaseProvider>
        <Slot />
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}