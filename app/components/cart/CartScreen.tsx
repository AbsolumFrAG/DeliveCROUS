import useCart, { CartItem } from "@/app/context/CartContext";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { FontAwesome } from "@expo/vector-icons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useState } from "react";
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

type CartNavigationProp = StackNavigationProp<RootStackParamList, "Cart">;

export default function CartScreen() {
  const navigation = useNavigation<CartNavigationProp>();
  const {
    items,
    totalAmount,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      "Supprimer l'article",
      "Voulez-vous vraiment supprimer cet article du panier ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removeFromCart(id);
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        "Panier vide",
        "Veuillez ajouter des articles à votre panier avant de passer commande."
      );
      return;
    }

    navigation.navigate("Order", { fromCart: true });
  };

  const handleClearCart = () => {
    if (items.length === 0) return;

    Alert.alert(
      "Vider le panier",
      "Voulez-vous vraiment vider votre panier ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearCart();
          },
        },
      ]
    );
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

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
          >
            <FontAwesome name="minus" size={12} color="#333" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          >
            <FontAwesome name="plus" size={12} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemActions}>
        <Text style={styles.itemTotalPrice}>
          {(item.price * item.quantity).toFixed(2)} €
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <FontAwesome name="trash-o" size={20} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="shopping-cart" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Votre panier est vide</Text>
      <TouchableOpacity
        style={styles.continueShopping}
        onPress={navigateToMenu}
      >
        <Text style={styles.continueShoppingText}>Parcourir le menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Panier</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCart}>Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          items.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={EmptyCart}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Articles ({totalItems})</Text>
              <Text style={styles.summaryValue}>
                {totalAmount.toFixed(2)} €
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              <Text style={styles.summaryValue}>0.00 €</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{totalAmount.toFixed(2)} €</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={isProcessing || items.length === 0}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.checkoutButtonText}>
                Commander ({totalAmount.toFixed(2)} €)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clearCart: {
    color: "#ff3b30",
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: "bold",
  },
  itemActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066CC",
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
  checkoutButton: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  continueShoppingText: {
    color: "white",
    fontWeight: "bold",
  },
});
