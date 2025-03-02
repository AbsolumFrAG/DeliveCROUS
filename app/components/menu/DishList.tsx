import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { fetchDishes } from "@/app/services/api";
import { Dish } from "@/app/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

type DishListNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DishList"
>;

export default function DishList() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<DishListNavigationProp>();

  const loadDishes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDishes();
      setDishes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const isFavorite = prev.includes(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return isFavorite ? prev.filter((fav) => fav !== id) : [...prev, id];
    });
  }

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
      {isLoading ? (
        <Text>Chargement...</Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { justifyContent: "space-between" },
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
});
