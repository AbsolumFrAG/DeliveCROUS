import { Dish } from "../types";
import { User } from "../context/AuthContext";

const API_URL = "http://192.168.1.112:3000";

// Interface pour les erreurs API
interface ApiError extends Error {
  status?: number;
}

interface UserCredentials {
  email: string;
  password: string;
}

// Fonctions liées aux plats
export async function fetchDishes(): Promise<Dish[]> {
  try {
    const response = await fetch(`${API_URL}/dishes`);
    if (!response.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = response.status;
      throw error;
    }
    return response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des plats :", error);
    return [];
  }
}

export async function fetchDishById(id: string): Promise<Dish | null> {
  try {
    const response = await fetch(`${API_URL}/dishes/${id}`);
    if (!response.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = response.status;
      throw error;
    }
    return response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération du plat :", error);
    return null;
  }
}

// Fonctions liées à l'authentification
export async function loginUser(credentials: UserCredentials): Promise<User> {
  try {
    // Vérifier si l'utilisateur existe
    const response = await fetch(`${API_URL}/users?email=${credentials.email}`);
    if (!response.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = response.status;
      throw error;
    }

    const users = await response.json();

    if (users.length === 0) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const userFound = users[0];
    if (userFound.password !== credentials.password) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Utilisateur authentifié - retourner sans le mot de passe
    const { password: _, ...userWithoutPassword } = userFound;
    return userWithoutPassword;
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
}

export async function registerUser(
  credentials: UserCredentials
): Promise<User> {
  try {
    // Vérifier si l'email existe déjà
    const checkResponse = await fetch(
      `${API_URL}/users?email=${credentials.email}`
    );
    if (!checkResponse.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = checkResponse.status;
      throw error;
    }

    const existingUsers = await checkResponse.json();
    if (existingUsers.length > 0) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Créer le nouvel utilisateur
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la création du compte"
      ) as ApiError;
      error.status = response.status;
      throw error;
    }

    const newUser = await response.json();
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    throw error;
  }
}
