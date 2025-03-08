import { RootStackParamList } from "@/app/navigation/AppNavigator"; 
import { fetchDishById, createOrder, fetchUniversities, fetchRooms } from "@/app/services/api";
import { Dish, University, Room } from "@/app/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal} from "react-native";

type OrderScreenRouteProp = RouteProp<RootStackParamList, "Order">;
type OrderScreenNavigationProp = StackNavigationProp<RootStackParamList, "Order">;

export default function OrderScreen() {
  const navigation = useNavigation<OrderScreenNavigationProp>(); 
  const route = useRoute<OrderScreenRouteProp>();
  const { dishId } = route.params; 

  const [dish, setDish] = useState<Dish | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("");
  const [selectedUniversityName, setSelectedUniversityName] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>("1234");
  const [universityModalVisible, setUniversityModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  const filteredRooms = allRooms.filter(
    (room) => room.universityId === selectedUniversity
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const dishData = await fetchDishById(dishId);
        setDish(dishData);
        const universitiesData = await fetchUniversities();
        setUniversities(universitiesData);
        const roomsData = await fetchRooms();
        setAllRooms(roomsData);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de récupérer les données nécessaires.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dishId]);

  useEffect(() => {
    setSelectedRoom("");
    setSelectedRoomName("");
  }, [selectedUniversity]);

  const selectUniversity = (id: string, name: string) => {
    setSelectedUniversity(id);
    setSelectedUniversityName(name);
    setUniversityModalVisible(false);
  };

  const selectRoom = (id: string, name: string) => {
    setSelectedRoom(id);
    setSelectedRoomName(name);
    setRoomModalVisible(false);
  };

  async function handleOrder() {
    if (!selectedUniversity || !selectedRoom) {
      Alert.alert("Erreur", "Veuillez sélectionner une université et une salle de livraison.");
      return;
    }
    if (!dish) {
      Alert.alert("Erreur", "Le plat sélectionné est introuvable.");
      return;
    }
    if (!userId) {
      Alert.alert("Erreur", "Utilisateur non identifié.");
      return;
    }
    
    try {
      setIsLoading(true);
      const deliveryLocation = `${selectedUniversityName} - ${selectedRoomName}`;
      const order = await createOrder(userId, dish, deliveryLocation);
      Alert.alert("Commande réussie", `Votre commande pour ${dish.name} sera livrée à ${deliveryLocation}.`);
      navigation.navigate("OrderHistory");
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la commande.");
    } finally {
      setIsLoading(false);
    }
  }

  const renderAllergens = (allergens?: string[]) => {
    if (!allergens || allergens.length === 0) return null;
    
    return (
      <View style={styles.allergensContainer}>
        <Text style={styles.allergensTitle}>Allergènes :</Text>
        <Text style={styles.allergensText}>{allergens.join(", ")}</Text>
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      {dish ? (
        <>
          <Text style={styles.title}>Commander {dish.name}</Text>
          {dish.allergens && renderAllergens(dish.allergens)}
          <Text style={styles.subtitle}>Sélectionnez votre université :</Text>
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => setUniversityModalVisible(true)}
          >
            <Text style={selectedUniversity ? styles.selectButtonTextSelected : styles.selectButtonText}>
              {selectedUniversityName || "Sélectionnez une université"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.subtitle}>Sélectionnez votre salle de livraison :</Text>
          <TouchableOpacity 
            style={[styles.selectButton, !selectedUniversity && styles.selectButtonDisabled]}
            onPress={() => {
              if (selectedUniversity) {
                setRoomModalVisible(true);
              } else {
                Alert.alert("Information", "Veuillez d'abord sélectionner une université");
              }
            }}
          >
            <Text style={selectedRoom ? styles.selectButtonTextSelected : styles.selectButtonText}>
              {selectedRoomName || (selectedUniversity ? "Sélectionnez une salle" : "Sélectionnez d'abord une université")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.orderButton, 
              (!selectedUniversity || !selectedRoom) && styles.orderButtonDisabled
            ]}
            onPress={handleOrder}
            disabled={!selectedUniversity || !selectedRoom}
          >
            <Text style={styles.orderButtonText}>Commander</Text>
          </TouchableOpacity>
          
          <Modal
            animationType="fade"
            transparent={true}
            visible={universityModalVisible}
            onRequestClose={() => setUniversityModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sélectionnez une université</Text>
                
                <ScrollView style={styles.modalScrollView}>
                  {universities.map((univ) => (
                    <TouchableOpacity
                      key={univ.id}
                      style={styles.modalItem}
                      onPress={() => selectUniversity(univ.id, univ.name)}
                    >
                      <Text style={styles.modalItemText}>{univ.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setUniversityModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <Modal
            animationType="fade"
            transparent={true}
            visible={roomModalVisible}
            onRequestClose={() => setRoomModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sélectionnez une salle</Text>
                
                <ScrollView style={styles.modalScrollView}>
                  {filteredRooms.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      style={styles.modalItem}
                      onPress={() => selectRoom(room.id, room.name)}
                    >
                      <Text style={styles.modalItemText}>{room.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setRoomModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.errorText}>Impossible de charger les informations du plat.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#fff' 
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: "center",
    fontWeight: "bold"
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 8,
    marginTop: 16
  },
  allergensContainer: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D'
  },
  allergensTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16
  },
  allergensText: {
    fontSize: 15
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    backgroundColor: '#f9f9f9'
  },
  selectButtonDisabled: {
    backgroundColor: '#f1f1f1',
    borderColor: '#ccc'
  },
  selectButtonText: {
    color: '#888'
  },
  selectButtonTextSelected: {
    color: '#000'
  },
  orderButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32
  },
  orderButtonDisabled: {
    backgroundColor: '#B0BEC5'
  },
  orderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorText: { 
    textAlign: "center", 
    color: "red", 
    fontSize: 16, 
    marginTop: 20 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalItemText: {
    fontSize: 16
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center'
  },
  modalCloseButtonText: {
    color: '#f44336',
    fontWeight: 'bold'
  },
  modalScrollView: {
    maxHeight: '90%',
  }
});
