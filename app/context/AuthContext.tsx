import { createContext, ReactNode, useContext, useState } from "react";
import { loginUser, registerUser } from "../services/api";

// Interface décrivant les propriétés d'un utilisateur
export interface User {
  id: string;
  email: string;
}

// Interface définissant les méthodes et propriétés du contexte d'authentification
interface AuthContextInterface {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

/**
 * Provider qui gère l'état d'authentification et expose les méthodes
 * d'authentification à l'application
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authentification d'un utilisateur avec email et mot de passe
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

  // Création d'un nouveau compte utilisateur
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

  // Déconnexion de l'utilisateur
  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * depuis n'importe quel composant de l'application
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
