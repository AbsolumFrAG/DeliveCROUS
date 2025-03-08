import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";

const API_URL = "http://localhost:3000/orders"; 

// Définition du type pour une commande, avec les détails des plats
type Dish = {
id: string;
name: string;
description: string;
price: number;
};

type Order = {
id: string;
userId: string;
dishes: Dish[]; 
totalAmount: number;
status: string;
deliveryLocation: string;
createdAt: string;
updatedAt: string;
};

const OrderHistory = () => {
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchOrders = async () => {
    try {
        const response = await fetch(API_URL);
        const data: Order[] = await response.json();
        setOrders(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
    } finally {
        setLoading(false);
    }
    };

    fetchOrders();
}, []);

return (
    <View style={styles.container}>
    {loading ? (
        <ActivityIndicator size="large" color="blue" />
    ) : orders.length === 0 ? (
        <Text style={styles.message}>Aucune commande passée pour le moment.</Text>
    ) : (
        <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.orderItem}>
            <Text style={styles.orderText}>Commande #{item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: {item.totalAmount} €</Text>
            <Text>Livraison: {item.deliveryLocation}</Text>
            <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
            {item.dishes.map((dish) => (
                <View key={dish.id} style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text>{dish.description}</Text>
                <Text>Prix: {dish.price} €</Text>
                </View>
            ))}
            </View>
        )}
        />
    )}
    </View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
},
message: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
},
orderItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
},
orderText: {
    fontSize: 16,
    fontWeight: "bold",
},
dishInfo: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    marginVertical: 5,
},
dishName: {
    fontSize: 14,
    fontWeight: "bold",
},
});

export default OrderHistory;
