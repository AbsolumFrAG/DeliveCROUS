import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../components/auth-wizard/LoginScreen";
import RegisterScreen from "../components/auth-wizard/RegisterScreen";
import FavoritesScreen from "../components/favorites/FavoritesScreen";
import DishDetail from "../components/menu/DishDetail";
import DishList from "../components/menu/DishList";
import OrderDetail from "../components/order-detail/OrderDetail";
import OrderHistory from "../components/order/OrderHistory";
import OrderScreen from "../components/order/OrderScreen";
import useAuth from "../context/AuthContext";

// Types pour les paramètres des navigateurs
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DishList: undefined;
  Favorites: undefined;
  DishDetail: { dishId: string };
  Order: { dishId: string };
  MainTabs: undefined;
  OrderHistory: undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Menu: undefined;
  Favorites: undefined;
  OrderHistory: undefined;
};

// Initialisation des navigateurs
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Configuration de la navigation par onglets pour les utilisateurs authentifiés
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Configuration des icônes pour chaque onglet
          if (route.name === "Menu") {
            return <FontAwesome name="list" size={size} color={color} />;
          } else if (route.name === "Favorites") {
            return (
              <FontAwesome
                name={focused ? "star" : "star-o"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "OrderHistory") {
            return <FontAwesome name="history" size={size} color={color} />;
          }
          return <FontAwesome name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0066CC",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Menu"
        component={DishList}
        options={{
          title: "Menu",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favoris",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="OrderHistory"
        component={OrderHistory}
        options={{
          title: "Commandes",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Navigateur principal de l'application avec gestion conditionnelle
 * des écrans selon l'état d'authentification
 */
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        // Écrans pour utilisateurs authentifiés
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DishDetail"
            component={DishDetail}
            options={{ title: "Détail du plat" }}
          />
          <Stack.Screen
            name="Order"
            component={OrderScreen}
            options={{ title: "Commander" }}
          />
          <Stack.Screen
            name="OrderHistory"
            component={OrderHistory}
            options={{ title: "Historique des commandes" }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetail}
            options={{ title: "Détail de la commande" }}
          />
        </>
      ) : (
        // Écrans d'authentification pour utilisateurs non connectés
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Connexion" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Inscription" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
