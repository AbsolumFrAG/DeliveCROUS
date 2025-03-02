import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import LoginScreen from "../components/auth-wizard/LoginScreen";
import RegisterScreen from "../components/auth-wizard/RegisterScreen";
import DishDetail from "../components/menu/DishDetail";
import DishList from "../components/menu/DishList";
import OrderScreen from "../components/order/OrderScreen";
import useAuth from "../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DishList: undefined;
  DishDetail: { dishId: string };
  Order: { dishId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="DishList"
            component={DishList}
            options={{ title: "Menu principal" }}
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
