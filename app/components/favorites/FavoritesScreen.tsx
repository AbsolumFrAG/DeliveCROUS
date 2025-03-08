import useAuth from "@/app/context/AuthContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { getFavoritesByUserId, removeFromFavorites } from "@/app/services/api";
import { Dish } from "@/app/types";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FavoritesNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MainTabs"
>;

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<FavoritesNavigationProp>();
  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const favoriteDishes = await getFavoritesByUserId(user.id);
      setFavorites(favoriteDishes);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
      Alert.alert("Erreur", "Impossible de charger vos plats favoris");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (dishId: string) => {
    if (!user) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await removeFromFavorites(user.id, dishId);
      // Mettre à jour la liste locale des favoris
      setFavorites((currentFavorites) =>
        currentFavorites.filter((dish) => dish.id !== dishId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      Alert.alert("Erreur", "Impossible de supprimer ce plat des favoris");
    }
  };

  const navigateToMenu = () => {
    // Use CommonActions for complex navigation
    navigation.dispatch(
      CommonActions.navigate({
        name: "MainTabs",
        params: { screen: "DishListTab" },
      })
    );
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DishDetail", { dishId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Text style={styles.favorite}>★</Text>
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

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Vous n'avez pas encore de plats favoris
      </Text>
      <TouchableOpacity style={styles.exploreButton} onPress={navigateToMenu}>
        <Text style={styles.exploreButtonText}>Explorer le menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={favorites.length === 0 ? { flex: 1 } : null}
          ListEmptyComponent={EmptyListComponent}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
