import React, { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import FavoritesScreen from '@/app/components/favorites/FavoritesScreen';
import { AuthProvider } from '@/app/context/AuthContext';
import * as api from '@/app/services/api';

const mockUser   = { id: '1', name: 'testUser' };

jest.mock('@/app/services/api', () => ({
  getFavoritesByUserId: jest.fn(),
}));

interface MockAuthProviderProps {
  children: ReactNode;
}

const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const authValue = {
    user: mockUser ,
  };

  return <AuthProvider>{children}</AuthProvider>;
};

describe('FavoritesScreen', () => {
  test('renders without crashing', () => {
    const { getByText } = render(
      <NavigationContainer>
        <MockAuthProvider>
          <FavoritesScreen />
        </MockAuthProvider>
      </NavigationContainer>
    );

    expect(getByText("Mes Favoris")).toBeTruthy();
  });

  test('displays empty message when no favorites', async () => {
    (api.getFavoritesByUserId as jest.Mock).mockResolvedValueOnce([]);

    const { getByText } = render(
      <NavigationContainer>
        <MockAuthProvider>
          <FavoritesScreen />
        </MockAuthProvider>
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText("Vous n'avez pas encore de plats favoris")).toBeTruthy();
    });
  });
});