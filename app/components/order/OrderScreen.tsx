import useCart, { CartItem } from "@/app//context/CartContext";
import useAuth from "@/app/context/AuthContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { createOrderFromCart } from "@/app/services/api";
import { Picker } from "@react-native-picker/picker";
import { CommonActions, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
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

type OrderScreenRouteProp = RouteProp<RootStackParamList, "Order">;
type OrderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Order"
>;

export default function OrderScreen() {
  const navigation = useNavigation<OrderScreenNavigationProp>();
  const route = useRoute<OrderScreenRouteProp>();
  const { fromCart } = route.params || { fromCart: false };

  const [deliveryLocation, setDeliveryLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [redirecting, setRedirecting] = useState(false);

  const deliveryLocations = [
    "Salle TD1",
    "Salle TD2",
    "Salle TP1",
    "Salle TP2",
  ];

  // Si on accède à cet écran sans passer par le panier, rediriger vers le panier
  useEffect(() => {
    if (!fromCart && !redirecting) {
      setRedirecting(true);
      navigation.replace("Cart");
    }
  }, [fromCart, navigation, redirecting]);

  // Si le panier est vide, rediriger vers le menu
  useEffect(() => {
    if (items.length === 0 && !redirecting) {
      setRedirecting(true);
      Alert.alert(
        "Panier vide",
        "Votre panier est vide. Ajoutez des plats avant de commander.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: "MainTabs",
                  params: { screen: "DishListTab" },
                })
              );
            },
          },
        ]
      );
    }
  }, [items.length, navigation, redirecting]);

  if (redirecting || !fromCart || items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  async function handleOrder() {
    if (!deliveryLocation) {
      Alert.alert("Erreur", "Veuillez sélectionner une salle de livraison.");
      return;
    }

    if (!user) {
      Alert.alert("Erreur", "Utilisateur non identifié.");
      return;
    }

    try {
      setIsLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await createOrderFromCart(user.id, items, totalAmount, deliveryLocation);

      clearCart();

      Alert.alert(
        "Commande réussie",
        `Votre commande sera livrée à ${deliveryLocation}.`,
        [
          {
            text: "OK",
            onPress: () => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: "MainTabs",
                  params: { screen: "OrderHistoryTab" },
                })
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la commande.");
    } finally {
      setIsLoading(false);
    }
  }

  const renderOrderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toFixed(2)} € x {item.quantity}
        </Text>
      </View>

      <Text style={styles.itemTotalPrice}>
        {(item.price * item.quantity).toFixed(2)} €
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finaliser la commande</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif de la commande</Text>
        <FlatList
          data={items}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.orderList}
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} €</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lieu de livraison</Text>
        <Text style={styles.subtitle}>
          Sélectionnez votre salle de livraison :
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={deliveryLocation}
            onValueChange={(itemValue) => setDeliveryLocation(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionnez une salle" value="" />
            {deliveryLocations.map((location) => (
              <Picker.Item key={location} label={location} value={location} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !deliveryLocation && styles.disabledButton,
          ]}
          onPress={handleOrder}
          disabled={isLoading || !deliveryLocation}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  orderList: {
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0066CC",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
    color: "#666",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  disabledButton: {
    backgroundColor: "#A0C8E6",
  },
});
