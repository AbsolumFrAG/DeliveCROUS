import React from 'react';
import { render, act } from '@testing-library/react-native';
import { CartProvider } from '@/app/context/CartContext';
import useCart from '@/app/context/CartContext';
import { Text } from 'react-native';

const TestComponent = () => {
  const { items, totalAmount, totalItems, addToCart, clearCart } = useCart();

  return (
    <>
      <Text testID="totalAmount">{totalAmount}</Text>
      <Text testID="totalItems">{totalItems}</Text>
      <Text testID="itemsCount">{items.length}</Text>
      <Text testID="addToCart" onPress={() => addToCart({
          id: '1', name: 'Dish 1', price: 10,
          description: '',
          allergens: [],
          image: ''
      })}>
        Add Item
      </Text>
      <Text testID="clearCart" onPress={clearCart}>
        Clear Cart
      </Text>
    </>
  );
};

describe('CartContext', () => {
  test('provides default values', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId('totalAmount').props.children).toBe(0);
    expect(getByTestId('totalItems').props.children).toBe(0);
    expect(getByTestId('itemsCount').props.children).toBe(0);
  });

  test('addToCart updates the cart', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addToCart').props.onPress();
    });

    expect(getByTestId('totalAmount').props.children).toBe(10);
    expect(getByTestId('totalItems').props.children).toBe(1);
    expect(getByTestId('itemsCount').props.children).toBe(1);
  });

  test('clearCart resets the cart', async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await act(async () => {
      getByTestId('addToCart').props.onPress();
    });

    await act(async () => {
      getByTestId('clearCart').props.onPress();
    });

    expect(getByTestId('totalAmount').props.children).toBe(0);
    expect(getByTestId('totalItems').props.children).toBe(0);
    expect(getByTestId('itemsCount').props.children).toBe(0);
  });
});