import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import useAuth from "../context/AuthContext";
import DishList from "../components/menu/DishList";
import DishDetail from "../components/menu/DishDetail";
import LoginScreen from "../components/auth-wizard/LoginScreen";
import OrderScreen from "../components/order/OrderScreen";

export type RootStackParamList = {
  Login: undefined;
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
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Connexion" }}
        />
      )}
    </Stack.Navigator>
  );
}
