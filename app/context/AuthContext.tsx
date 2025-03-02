import { createContext, ReactNode, useContext, useState } from "react";
import { loginUser, registerUser } from "../services/api";

export interface User {
  id: string;
  email: string;
}

interface AuthContextInterface {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const authenticatedUser = await loginUser({ email, password });
      setUser(authenticatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setIsLoading(true);
    try {
      await registerUser({ email, password });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
