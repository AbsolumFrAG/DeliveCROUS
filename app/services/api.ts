import { User } from "../context/AuthContext";
import { CartItem } from "../context/CartContext";
import { Dish, University, Room } from "../types";

const API_URL = "http://192.168.1.112:3000";

// Interface pour les erreurs API
interface ApiError extends Error {
  status?: number;
}

interface UserCredentials {
  email: string;
  password: string;
}

// Types pour les favoris
export interface Favorite {
  id: string;
  userId: string;
  dishId: string;
}

export interface Order {
  id: string;
  userId: string;
  dishes: Dish[];
  totalAmount: number;
  status: string;
  deliveryLocation: string;
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  userId: string,
  dish: Dish,
  deliveryLocation: string
): Promise<Order> {
  try {
    const totalAmount = dish.price;

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        dishes: [
          {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            image: dish.image,
          },
        ],
        totalAmount,
        status: "en cours",
        deliveryLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la création de la commande"
      ) as ApiError;
      (error as ApiError).status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la commande :", error);
    throw error;
  }
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

// Fonctions liées aux favoris
export async function getFavoritesByUserId(userId: string): Promise<Dish[]> {
  try {
    // Récupérer les favoris de l'utilisateur
    const favoritesResponse = await fetch(
      `${API_URL}/favorites?userId=${userId}`
    );
    if (!favoritesResponse.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = favoritesResponse.status;
      throw error;
    }

    const favorites = await favoritesResponse.json();

    if (favorites.length === 0) {
      return [];
    }

    // Récupérer les détails des plats favoris
    const dishPromises = favorites.map((favorite: Favorite) =>
      fetchDishById(favorite.dishId)
    );

    const dishes = await Promise.all(dishPromises);
    // Filtrer les éventuels null (plats qui n'existent plus)
    return dishes.filter((dish) => dish !== null) as Dish[];
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    throw error;
  }
}

export async function addToFavorites(
  userId: string,
  dishId: string
): Promise<Favorite> {
  try {
    // Vérifier si ce plat est déjà dans les favoris
    const checkResponse = await fetch(
      `${API_URL}/favorites?userId=${userId}&dishId=${dishId}`
    );
    if (!checkResponse.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = checkResponse.status;
      throw error;
    }

    const existingFavorites = await checkResponse.json();
    if (existingFavorites.length > 0) {
      // Déjà en favoris, on retourne l'existant
      return existingFavorites[0];
    }

    // Ajouter aux favoris
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, dishId }),
    });

    if (!response.ok) {
      const error = new Error("Erreur lors de l'ajout aux favoris") as ApiError;
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    throw error;
  }
}

export async function removeFromFavorites(
  userId: string,
  dishId: string
): Promise<void> {
  try {
    // Trouver l'ID du favori à supprimer
    const findResponse = await fetch(
      `${API_URL}/favorites?userId=${userId}&dishId=${dishId}`
    );
    if (!findResponse.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = findResponse.status;
      throw error;
    }

    const favorites = await findResponse.json();
    if (favorites.length === 0) {
      // Pas trouvé, rien à faire
      return;
    }

    // Supprimer le favori
    const favoriteId = favorites[0].id;
    const deleteResponse = await fetch(`${API_URL}/favorites/${favoriteId}`, {
      method: "DELETE",
    });

    if (!deleteResponse.ok) {
      const error = new Error(
        "Erreur lors de la suppression du favori"
      ) as ApiError;
      error.status = deleteResponse.status;
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du favori:", error);
    throw error;
  }
}

export async function checkIsFavorite(
  userId: string,
  dishId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/favorites?userId=${userId}&dishId=${dishId}`
    );
    if (!response.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = response.status;
      throw error;
    }

    const favorites = await response.json();
    return favorites.length > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification du favori:", error);
    return false;
  }
}

/**
 * Récupère l'historique des commandes
 * @returns Une liste des commandes
 */
export async function fetchOrderHistory(): Promise<Order[]> {
  try {
    const response = await fetch(`${API_URL}/orders`);

    if (!response.ok) {
      const error = new Error("Erreur réseau") as ApiError;
      error.status = response.status;
      throw error;
    }

    const orders: Order[] = await response.json();
    return orders;
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    throw error;
  }
}

/**
 * Récupère une commande spécifique par son ID
 * @param id L'identifiant de la commande à récupérer
 * @returns Les détails de la commande
 */
export async function fetchOrderById(id: string): Promise<Order> {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`);

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la récupération de la commande"
      ) as ApiError;
      error.status = response.status;
      throw error;
    }

    const order: Order = await response.json();
    return order;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la commande ${id}:`,
      error
    );
    throw error;
  }
}

/**
 * Annule une commande existante
 * @param id L'identifiant de la commande à annuler
 * @returns La commande mise à jour
 */
export async function cancelOrder(id: string): Promise<Order> {
  try {
    // D'abord, récupérer la commande actuelle
    const currentOrder = await fetchOrderById(id);

    // Mettre à jour le statut de la commande
    const updatedOrder = {
      ...currentOrder,
      status: "annulée",
      updatedAt: new Date().toISOString(),
    };

    // Envoyer la mise à jour au serveur
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedOrder),
    });

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de l'annulation de la commande"
      ) as ApiError;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de l'annulation de la commande ${id}:`, error);
    throw error;
  }
}

/**
 * Récupère la liste des universités depuis la base de données
 * @returns Liste des universités
 */
export async function fetchUniversities(): Promise<University[]> {
  try {
    const response = await fetch(`${API_URL}/universities`);

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la récupération des universités"
      ) as ApiError;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des universités:", error);
    throw error;
  }
}

/**
 * Récupère la liste des salles depuis la base de données
 * @returns Liste des salles
 */
export async function fetchRooms(): Promise<Room[]> {
  try {
    const response = await fetch(`${API_URL}/rooms`);

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la récupération des salles"
      ) as ApiError;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des salles:", error);
    throw error;
  }
}

/**
 * Creates a new order from cart items
 * @param userId The ID of the user placing the order
 * @param cartItems Array of items in the cart with quantities
 * @param totalAmount Total order amount
 * @param deliveryLocation Location for delivery
 * @returns The created order
 */
export async function createOrderFromCart(
  userId: string,
  cartItems: CartItem[],
  totalAmount: number,
  deliveryLocation: string
): Promise<Order> {
  try {
    // Format dishes for the order
    const dishes = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        dishes,
        totalAmount,
        status: "en cours",
        deliveryLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = new Error(
        "Erreur lors de la création de la commande"
      ) as ApiError;
      (error as ApiError).status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la commande :", error);
    throw error;
  }
}
