import React, { ReactNode } from "react";
import { render, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "@/app/context/AuthContext"; // Assurez-vous d'importer votre AuthProvider
import { CartProvider } from "@/app/context/CartContext"; // Assurez-vous d'importer votre CartProvider
import DishList from "@/app/components/menu/DishList";
import * as api from "@/app/services/api"; // Assurez-vous d'importer votre API

// Mock de l'API
jest.mock("@/app/services/api", () => ({
  fetchDishes: jest.fn(),
  checkIsFavorite: jest.fn(),
}));

const mockUser = { id: "1", name: "testUser " };

const mockDishes = [
  {
    id: "1",
    name: "Plat 1",
    price: 10.0,
    description: "Description du plat 1",
    image: "http://example.com/image1.jpg",
  },
  {
    id: "2",
    name: "Plat 2",
    price: 15.0,
    description: "Description du plat 2",
    image: "http://example.com/image2.jpg",
  },
];

interface MockAuthProviderProps {
  children: ReactNode;
}

const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const authValue = {
    user: mockUser,
  };

  return <AuthProvider>{children}</AuthProvider>;
};

const MockCartProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const cartValue = {
    addToCart: jest.fn(),
    items: [],
  };

  return <CartProvider>{children}</CartProvider>;
};

describe("DishList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    const { getByText } = render(
      <NavigationContainer>
        <MockAuthProvider>
          <MockCartProvider>
            <DishList />
          </MockCartProvider>
        </MockAuthProvider>
      </NavigationContainer>
    );

    expect(true).toBe(true); // Assertion triviale
  });

  test("displays dishes when loaded", async () => {
    (api.fetchDishes as jest.Mock).mockResolvedValueOnce(mockDishes);

    const { getByText } = render(
      <NavigationContainer>
        <MockAuthProvider>
          <MockCartProvider>
            <DishList />
          </MockCartProvider>
        </MockAuthProvider>
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText("Plat 1")).toBeTruthy();
      expect(getByText("Plat 2")).toBeTruthy();
    });
  });
});
