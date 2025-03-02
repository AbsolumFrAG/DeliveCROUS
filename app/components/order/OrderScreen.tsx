import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { fetchDishById } from "@/app/services/api";
import { Dish } from "@/app/types";
import { Picker } from "@react-native-picker/picker";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

type OrderScreenRouteProp = RouteProp<RootStackParamList, "Order">;

export default function OrderScreen() {
  const route = useRoute<OrderScreenRouteProp>();
  const { dishId } = route.params;
  const [dish, setDish] = useState<Dish | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const deliveryLocations = [
    "Salle TD1",
    "Salle TD2",
    "Salle TP1",
    "Salle TP2",
  ];

  useEffect(() => {
    async function loadDish() {
      setIsLoading(true);
      try {
        const data = await fetchDishById(dishId);
        setDish(data);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de récupérer les détails du plat.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDish();
  }, [dishId]);

  function handleOrder() {
    if (!deliveryLocation) {
      Alert.alert("Erreur", "Veuillez sélectionner une salle de livraison.");
      return;
    }

    Alert.alert(
      "Commande",
      `Votre commande pour ${dish?.name} sera livrée à ${deliveryLocation}.`
    );
  }

  if (isLoading || !dish) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commander {dish.name}</Text>
      <Text style={styles.subtitle}>
        Sélectionnez votre salle de livraison :
      </Text>
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
      <Button title="Commander" onPress={handleOrder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 16, textAlign: "center" },
  subtitle: { fontSize: 16, marginBottom: 8 },
  picker: { height: 50, marginBottom: 16 },
});
