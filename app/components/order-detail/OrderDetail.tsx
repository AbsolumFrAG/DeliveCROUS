import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { cancelOrder, fetchOrderById, Order } from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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

type OrderDetailRouteProp = RouteProp<RootStackParamList, "OrderDetail">;
type OrderDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OrderDetail"
>;

export default function OrderDetail() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation<OrderDetailNavigationProp>();
  const { orderId } = route.params;

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        setIsLoading(true);
        const orderData = await fetchOrderById(orderId);
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement de la commande:", err);
        setError("Impossible de charger les détails de la commande");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrderDetails();
  }, [orderId]);

  const navigateToOrderHistory = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "MainTabs",
        params: { screen: "OrderHistoryTab" },
      })
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Annuler la commande",
      "Êtes-vous sûr de vouloir annuler cette commande ?",
      [
        {
          text: "Non",
          style: "cancel",
        },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
              setIsCancelling(true);

              const updatedOrder = await cancelOrder(orderId);
              setOrder(updatedOrder);

              // Notification de succès
              Alert.alert(
                "Commande annulée",
                "Votre commande a été annulée avec succès",
                [
                  {
                    text: "OK",
                    onPress: () => navigateToOrderHistory(),
                  },
                ]
              );
            } catch (err) {
              console.error("Erreur lors de l'annulation:", err);
              Alert.alert(
                "Erreur",
                "Impossible d'annuler la commande. Veuillez réessayer."
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error || "Commande non trouvée"}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Formatage de la date pour l'affichage
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderIdText}>Commande #{order.id}</Text>
          <Text style={styles.dateText}>
            {formattedDate} à {formattedTime}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            order.status === "en cours"
              ? styles.pendingStatus
              : order.status === "annulée"
              ? styles.cancelledStatus
              : styles.completedStatus,
          ]}
        >
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de livraison</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.detailText}>{order.deliveryLocation}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Articles commandés</Text>
        {order.dishes.map((dish) => (
          <View key={dish.id} style={styles.dishCard}>
            {dish.image && (
              <Image source={{ uri: dish.image }} style={styles.dishImage} />
            )}
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{dish.name}</Text>
              <Text style={styles.dishDescription} numberOfLines={2}>
                {dish.description}
              </Text>
              <Text style={styles.dishPrice}>{dish.price} €</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>
            {order.totalAmount.toFixed(2)} €
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Frais de livraison</Text>
          <Text style={styles.summaryValue}>0.00 €</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {order.totalAmount.toFixed(2)} €
          </Text>
        </View>
      </View>

      {order.status === "en cours" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.cancelButtonText}>Annuler la commande</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingStatus: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
  },
  completedStatus: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  cancelledStatus: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    marginLeft: 8,
    color: "#333",
  },
  dishCard: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  dishName: {
    fontSize: 15,
    fontWeight: "600",
  },
  dishDescription: {
    fontSize: 13,
    color: "#666",
    marginVertical: 4,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  summarySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
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
  button: {
    backgroundColor: "#0066CC",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
  },
});
