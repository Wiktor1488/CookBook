import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

// Klucze do przechowywania danych - tylko znaki alfanumeryczne, ".", "-", i "_"
const USERS_STORAGE_KEY = "cookbook_users";
const CURRENT_USER_KEY = "cookbook_current_user";
const AUTH_TOKEN_KEY = "auth_token";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UserWithPassword extends User {
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private users: UserWithPassword[] = [];

  constructor() {
    this.loadUsers();
  }

  private hashPassword(password: string): string {
    return Buffer.from(password).toString("base64");
  }

  private validatePassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  private async loadUsers() {
    try {
      const encryptedUsers = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
      if (encryptedUsers) {
        this.users = JSON.parse(encryptedUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  private async saveUsers() {
    try {
      await SecureStore.setItemAsync(
        USERS_STORAGE_KEY,
        JSON.stringify(this.users)
      );
    } catch (error) {
      console.error("Error saving users:", error);
      throw new Error("Failed to save user data");
    }
  }

  private generateAuthToken(userId: string): string {
    return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
  }

  async register(data: RegisterData): Promise<User> {
    if (this.users.some((user) => user.email === data.email)) {
      throw new Error("Ten email jest już zajęty");
    }

    if (data.password.length < 6) {
      throw new Error("Hasło musi mieć co najmniej 6 znaków");
    }

    const hashedPassword = this.hashPassword(data.password);

    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    await this.saveUsers();

    const token = this.generateAuthToken(newUser.id);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

    const { password, ...userWithoutPassword } = newUser;
    await this.setCurrentUser(userWithoutPassword);

    return userWithoutPassword;
  }

  async login(data: LoginData): Promise<User> {
    const user = this.users.find((u) => u.email === data.email);

    if (!user || !this.validatePassword(data.password, user.password)) {
      throw new Error("Nieprawidłowy email lub hasło");
    }

    const token = this.generateAuthToken(user.id);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

    const { password, ...userWithoutPassword } = user;
    await this.setCurrentUser(userWithoutPassword);

    return userWithoutPassword;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        return null;
      }

      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  private async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const currentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

      return !!(token && currentUser);
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  async forceLogout(): Promise<void> {
    await this.clearAllData();
  }

  async resetPassword(email: string): Promise<void> {
    const user = this.users.find((u) => u.email === email);
    if (!user) {
      throw new Error("Nie znaleziono użytkownika o podanym adresie email");
    }
    // Tu byłaby logika wysyłania emaila z linkiem do resetu hasła
  }

  // Pomocnicza metoda do debugowania
  async debugStorage(): Promise<void> {
    try {
      const users = await SecureStore.getItemAsync(USERS_STORAGE_KEY);
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const currentUser = await AsyncStorage.getItem(CURRENT_USER_KEY);

      console.log("Użytkownicy:", users ? JSON.parse(users) : []);
      console.log("Token:", token);
      console.log(
        "Aktualny użytkownik:",
        currentUser ? JSON.parse(currentUser) : null
      );
    } catch (error) {
      console.error("Error debugging storage:", error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USERS_STORAGE_KEY);
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      this.users = [];
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw new Error("Failed to clear auth data");
    }
  }
}

export const authService = new AuthService();
