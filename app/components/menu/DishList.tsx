import useAuth from "@/app/context/AuthContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import {
  addToFavorites,
  checkIsFavorite,
  fetchDishes,
  removeFromFavorites,
} from "@/app/services/api";
import { Dish } from "@/app/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Type pour la navigation spécifique à l'écran de liste des plats
type DishListNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DishList"
>;

export default function DishList() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<DishListNavigationProp>();
  const { user } = useAuth();

  /**
   * Charge les plats depuis l'API et vérifie les favoris de l'utilisateur
   */
  const loadDishes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDishes();
      setDishes(data);

      if (user) {
        await loadFavoriteStatus(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des plats:", error);
      Alert.alert("Erreur", "Impossible de charger les plats");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  /**
   * Vérifie quels plats sont en favoris pour l'utilisateur actuel
   */
  const loadFavoriteStatus = async (dishesData: Dish[]) => {
    if (!user) return;

    try {
      const favoriteIds: string[] = [];
      const checkPromises = dishesData.map(async (dish) => {
        const isFavorite = await checkIsFavorite(user.id, dish.id);
        if (isFavorite) {
          favoriteIds.push(dish.id);
        }
      });

      await Promise.all(checkPromises);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Erreur lors du chargement des statuts de favoris:", error);
    }
  };

  // Charge les plats au montage du composant
  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  /**
   * Ajoute ou supprime un plat des favoris
   */
  const toggleFavorite = async (id: string) => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour ajouter des favoris",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Retour haptique pour améliorer l'expérience utilisateur
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isFavorite = favorites.includes(id);

      if (isFavorite) {
        await removeFromFavorites(user.id, id);
        setFavorites((prev) => prev.filter((fav) => fav !== id));
      } else {
        await addToFavorites(user.id, id);
        setFavorites((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Erreur lors de la modification des favoris:", error);
      Alert.alert("Erreur", "Impossible de modifier les favoris");
    }
  };

  // Gère l'actualisation de la liste par "pull-to-refresh"
  const handleRefresh = () => {
    setRefreshing(true);
    loadDishes();
  };

  /**
   * Rendu d'un élément de la liste de plats
   */
  const renderItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DishDetail", { dishId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Text style={styles.favorite}>
          {favorites.includes(item.id) ? "★" : "☆"}
        </Text>
      </TouchableOpacity>
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>{item.price} €</Text>
        </View>
        <Text style={styles.description}>
          {item.description.substring(0, 20)}...
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0066CC"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 5,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  favorite: {
    fontSize: 20,
    color: "#f5c518",
  },
  info: {
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
