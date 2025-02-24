import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { fetchDishes } from "@/app/services/api";
import Dish from "@/app/types";
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
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  }

  const renderItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("DishDetail", { dishId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price} €</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Text style={styles.favorite}>
            {favorites.includes(item.id) ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { flexDirection: "row", marginBottom: 16, alignItems: "center" },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  price: { marginVertical: 4 },
  favorite: { fontSize: 24, color: "#f5c518" },
});
