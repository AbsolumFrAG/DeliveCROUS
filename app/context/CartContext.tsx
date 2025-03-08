import { createContext, ReactNode, useContext, useReducer } from "react";
import { Dish } from "../types";

export interface CartItem extends Dish {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: Dish }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextInterface {
  items: CartItem[];
  totalAmount: number;
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextInterface | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const dish = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === dish.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };

        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
        };
      } else {
        const newItem: CartItem = {
          ...dish,
          quantity: 1,
        };

        return {
          ...state,
          items: [...state.items, newItem],
          totalAmount: calculateTotalAmount([...state.items, newItem]),
        };
      }
    }

    case "REMOVE_FROM_CART": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      return {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotalAmount(updatedItems),
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_FROM_CART", payload: id });
      }

      const existingItemIndex = state.items.findIndex((item) => item.id === id);

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity,
        };

        return {
          ...state,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems),
        };
      }

      return state;
    }

    case "CLEAR_CART":
      return {
        items: [],
        totalAmount: 0,
      };

    default:
      return state;
  }
}

function calculateTotalAmount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalAmount: 0,
  });

  const addToCart = (dish: Dish) => {
    dispatch({ type: "ADD_TO_CART", payload: dish });
  };

  const removeFromCart = (dishId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: dishId });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: dishId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const totalItems = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalAmount: state.totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
