import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { fetchDishById } from "@/app/services/api";
import { Dish } from "@/app/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Props pour l'écran de détail d'un plat
 */
interface DishDetailProps {
  route: { params: { dishId: string } };
}

// Type pour la navigation spécifique à l'écran de détail
type DishDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DishDetail"
>;

export default function DishDetail({ route }: DishDetailProps) {
  const { dishId } = route.params;
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<DishDetailNavigationProp>();

  // Charge les détails du plat au montage du composant
  useEffect(() => {
    async function loadDish() {
      setIsLoading(true);
      try {
        const data = await fetchDishById(dishId);
        setDish(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDish();
  }, [dishId]);

  // Affichage conditionnel pendant le chargement ou si le plat n'est pas trouvé
  if (isLoading) return <Text>Chargement...</Text>;
  if (!dish) return <Text>Plat non trouvé</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: dish.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.price}>{dish.price} €</Text>
        <Text style={styles.description}>{dish.description}</Text>
        <Text style={styles.allergens}>
          Allergènes: {dish.allergens.join(", ")}
        </Text>
        <Button
          title="Commander ce plat"
          onPress={() => navigation.navigate("Order", { dishId: dish.id })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: "100%", height: 200 },
  content: { padding: 16 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  price: { fontSize: 18, marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 8 },
  allergens: { fontSize: 14, color: "#f00", marginBottom: 16 },
});
