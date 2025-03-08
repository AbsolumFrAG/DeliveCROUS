import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../components/auth-wizard/LoginScreen";
import RegisterScreen from "../components/auth-wizard/RegisterScreen";
import CartScreen from "../components/cart/CartScreen";
import FavoritesScreen from "../components/favorites/FavoritesScreen";
import DishDetail from "../components/menu/DishDetail";
import DishList from "../components/menu/DishList";
import OrderDetail from "../components/order-detail/OrderDetail";
import OrderHistory from "../components/order/OrderHistory";
import OrderScreen from "../components/order/OrderScreen";
import useAuth from "../context/AuthContext";
import useCart from "../context/CartContext";

// Define all routes at the root level
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: { screen?: string }; // Allow passing a screen parameter to MainTabs
  DishDetail: { dishId: string };
  Order: { dishId?: string; fromCart?: boolean };
  OrderDetail: { orderId: string };
  Cart: undefined;
};

// Define tab routes separately
export type TabParamList = {
  DishListTab: undefined;
  FavoritesTab: undefined; // Renamed to avoid confusion
  OrderHistoryTab: undefined; // Renamed to avoid confusion
  CartTab: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "DishListTab") {
            return <FontAwesome name="list" size={size} color={color} />;
          } else if (route.name === "FavoritesTab") {
            return (
              <FontAwesome
                name={focused ? "star" : "star-o"}
                size={size}
                color={color}
              />
            );
          } else if (route.name === "OrderHistoryTab") {
            return <FontAwesome name="history" size={size} color={color} />;
          } else if (route.name === "CartTab") {
            return (
              <FontAwesome name="shopping-cart" size={size} color={color} />
            );
          }
          return <FontAwesome name="home" size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0066CC",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="DishListTab"
        component={DishList}
        options={{
          title: "Menu",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          title: "Favoris",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="OrderHistoryTab"
        component={OrderHistory}
        options={{
          title: "Commandes",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: "Panier",
          headerShown: false,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
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
            options={{ title: "Commander", headerBackTitle: "Retour" }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetail}
            options={{ title: "Détail de la commande" }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ title: "Mon panier" }}
          />
        </>
      ) : (
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
