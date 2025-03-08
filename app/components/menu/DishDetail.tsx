import useCart from "@/app/context/CartContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { fetchDishById } from "@/app/services/api";
import { Dish } from "@/app/types";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DishDetailProps {
  route: { params: { dishId: string } };
}

type DishDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DishDetail"
>;

export default function DishDetail({ route }: DishDetailProps) {
  const { dishId } = route.params;
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigation = useNavigation<DishDetailNavigationProp>();
  const { addToCart, items } = useCart();

  // Vérifier si le plat est déjà dans le panier
  const isInCart = dish ? items.some((item) => item.id === dish.id) : false;
  const cartItemQuantity = dish
    ? items.find((item) => item.id === dish.id)?.quantity || 0
    : 0;

  useEffect(() => {
    async function loadDish() {
      setIsLoading(true);
      try {
        const data = await fetchDishById(dishId);
        setDish(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", "Impossible de charger les détails du plat");
      } finally {
        setIsLoading(false);
      }
    }
    loadDish();
  }, [dishId]);

  const handleAddToCart = async () => {
    if (!dish) return;

    setAddingToCart(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addToCart(dish);
      Alert.alert(
        "Ajouté au panier",
        `${dish.name} a été ajouté à votre panier`,
        [
          { text: "Continuer les achats" },
          {
            text: "Voir le panier",
            onPress: () => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: "MainTabs",
                  params: { screen: "CartTab" },
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      Alert.alert("Erreur", "Impossible d'ajouter ce plat au panier");
    } finally {
      setAddingToCart(false);
    }
  };

  const navigateToCart = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "MainTabs",
        params: { screen: "CartTab" },
      })
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Plat non trouvé</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: dish.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.price}>{dish.price.toFixed(2)} €</Text>
        <Text style={styles.description}>{dish.description}</Text>

        {dish.allergens && dish.allergens.length > 0 && (
          <Text style={styles.allergens}>
            Allergènes: {dish.allergens.join(", ")}
          </Text>
        )}

        {isInCart ? (
          <View style={styles.cartInfo}>
            <Text style={styles.cartInfoText}>
              {cartItemQuantity} {cartItemQuantity > 1 ? "articles" : "article"}{" "}
              dans le panier
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Ajouter un autre</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addButtonText}>Ajouter au panier</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cartButton} onPress={navigateToCart}>
          <Text style={styles.cartButtonText}>Voir mon panier</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  content: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0066CC",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 16,
  },
  allergens: {
    fontSize: 14,
    color: "#f00",
    marginBottom: 24,
  },
  cartInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  cartInfoText: {
    fontSize: 16,
    color: "#0066CC",
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartButton: {
    borderWidth: 1,
    borderColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cartButtonText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "bold",
  },
});
