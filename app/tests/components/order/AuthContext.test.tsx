import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthProvider } from '@/app/context/AuthContext';
import useAuth from '@/app/context/AuthContext';
import { Text } from 'react-native';

const TestComponent = () => {
  const { user, isLoading } = useAuth();

  return (
    <>
      <Text testID="user">{user ? user.email : 'No user'}</Text>
      <Text testID="loading">{isLoading ? 'Loading...' : 'Not loading'}</Text>
    </>
  );
};

describe('AuthContext', () => {
  test('provides default values', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user').props.children).toBe('No user');
    expect(getByTestId('loading').props.children).toBe('Not loading');
  });
});