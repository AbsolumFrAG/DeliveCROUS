import Dish from "../types";

export async function fetchDishes(): Promise<Dish[]> {
  try {
    const response = await fetch("http://192.168.10.51:3000/dishes");
    if (!response.ok) throw new Error("Erreur réseau");
    return response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des plats :", error);
    return [];
  }
}

export async function fetchDishById(id: string): Promise<Dish | null> {
  try {
    const response = await fetch(`http://192.168.10.51:3000/dishes/${id}`);
    if (!response.ok) throw new Error("Erreur réseau");
    return response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération du plat :", error);
    return null;
  }
}
