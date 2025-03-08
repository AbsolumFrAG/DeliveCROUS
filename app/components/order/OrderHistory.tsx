import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { fetchOrderHistory, Order } from "@/app/services/api";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import * as Haptics from "expo-haptics";

type OrderHistoryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OrderHistory"
>;

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<OrderHistoryNavigationProp>();

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrderHistory();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      setError("Impossible de récupérer l'historique des commandes");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleOrderPress = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("OrderDetail", { orderId: order.id });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.orderIdText}>Commande #{item.id}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              item.status === "en cours"
                ? styles.statusPending
                : styles.statusCompleted,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={styles.infoLabel}>Livraison:</Text>
        <Text style={styles.infoValue}>{item.deliveryLocation}</Text>
      </View>

      <View style={styles.divider} />

      {item.dishes.map((dish) => (
        <View key={dish.id} style={styles.dishContainer}>
          {dish.image && (
            <Image
              source={{ uri: dish.image }}
              style={styles.dishImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.dishDetails}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.dishDescription} numberOfLines={2}>
              {dish.description}
            </Text>
          </View>
          <Text style={styles.dishPrice}>{dish.price} €</Text>
        </View>
      ))}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{item.totalAmount} €</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Aucune commande passée pour le moment.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("DishList")}
      >
        <Text style={styles.exploreButtonText}>Explorer le menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des commandes</Text>
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadOrders()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0066CC"]}
            />
          }
          contentContainerStyle={
            orders.length === 0
              ? styles.emptyListContainer
              : styles.listContainer
          }
          ListEmptyComponent={EmptyListComponent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusPending: {
    color: "#ff9800",
  },
  statusCompleted: {
    color: "#4caf50",
  },
  deliveryInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  dishContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "center",
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  dishDetails: {
    flex: 1,
    marginLeft: 12,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "600",
  },
  dishDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066CC",
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
    textAlign: "center",
  },
  exploreButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e53935",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OrderHistory;
