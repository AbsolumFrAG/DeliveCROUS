import * as apiService from '../services/api';
import fetchMock from 'jest-fetch-mock';
import { CartItem } from "../context/CartContext";

beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

const API_URL = 'http://192.168.1.112:3000';

describe('API Service - Dish Functions', () => {
  // Test pour fetchDishes
  test('fetchDishes should return dishes list when successful', async () => {
    const mockDishes = [
      { id: '1', name: 'Dish 1', description: 'Delicious dish', price: 10.99, image: 'image1.jpg', allergens: ['gluten'] },
      { id: '2', name: 'Dish 2', description: 'Tasty dish', price: 12.99, image: 'image2.jpg', allergens: ['lactose'] }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify(mockDishes));
    
    const dishes = await apiService.fetchDishes();
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/dishes`);
    expect(dishes).toEqual(mockDishes);
  });
  
  // Test pour fetchDishById
  test('fetchDishById should return a dish when successful', async () => {
    const mockDish = { 
      id: '1', 
      name: 'Dish 1', 
      description: 'Delicious dish', 
      price: 10.99, 
      image: 'test.jpg',
      allergens: ['gluten', 'lactose']
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockDish));
    
    const dish = await apiService.fetchDishById('1');
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/dishes/1`);
    expect(dish).toEqual(mockDish);
  });
  
  test('fetchDishes should return empty array on error', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    const dishes = await apiService.fetchDishes();
    
    expect(dishes).toEqual([]);
  });
  
  // Test pour fetchDishById
  test('fetchDishById should return a dish when successful', async () => {
    const mockDish = { id: '1', name: 'Dish 1', price: 10.99 };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockDish));
    
    const dish = await apiService.fetchDishById('1');
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/dishes/1`);
    expect(dish).toEqual(mockDish);
  });
  
  test('fetchDishById should return null on error', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    const dish = await apiService.fetchDishById('1');
    
    expect(dish).toBeNull();
  });
});

describe('API Service - Authentication Functions', () => {
  // Test pour loginUser
  test('loginUser should return user data when credentials are valid', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const credentials = { email: 'test@example.com', password: 'password123' };
    
    fetchMock.mockResponseOnce(JSON.stringify([{ ...mockUser, password: 'password123' }]));
    
    const user = await apiService.loginUser(credentials);
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/users?email=test@example.com`);
    expect(user).toEqual(mockUser);
  });
  
  test('loginUser should throw error for invalid email', async () => {
    const credentials = { email: 'nonexistent@example.com', password: 'password123' };
    
    fetchMock.mockResponseOnce(JSON.stringify([]));
    
    await expect(apiService.loginUser(credentials)).rejects.toThrow('Email ou mot de passe incorrect');
  });
  
  test('loginUser should throw error for invalid password', async () => {
    const credentials = { email: 'test@example.com', password: 'wrongpassword' };
    
    fetchMock.mockResponseOnce(JSON.stringify([
      { id: '1', email: 'test@example.com', password: 'correctpassword' }
    ]));
    
    await expect(apiService.loginUser(credentials)).rejects.toThrow('Email ou mot de passe incorrect');
  });
  
  // Test pour registerUser
  test('registerUser should create and return a new user when email is not taken', async () => {
    const credentials = { email: 'newuser@example.com', password: 'password123' };
    const mockUser = { id: '2', ...credentials };
    
    fetchMock.mockResponseOnce(JSON.stringify([]));
    fetchMock.mockResponseOnce(JSON.stringify(mockUser));
    
    const { password, ...expectedUser } = mockUser;
    const user = await apiService.registerUser(credentials);
    
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_URL}/users?email=newuser@example.com`);
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    expect(user).toEqual(expectedUser);
  });
  
  test('registerUser should throw error when email is already taken', async () => {
    const credentials = { email: 'existing@example.com', password: 'password123' };
    
    fetchMock.mockResponseOnce(JSON.stringify([{ id: '3', email: 'existing@example.com' }]));
    
    await expect(apiService.registerUser(credentials)).rejects.toThrow('Cet email est déjà utilisé');
  });
});

describe('API Service - Favorites Functions', () => {
  // Test pour getFavoritesByUserId
  test('getFavoritesByUserId should return favorite dishes', async () => {
    const mockFavorites = [
      { id: 'fav1', userId: 'user1', dishId: 'dish1' },
      { id: 'fav2', userId: 'user1', dishId: 'dish2' }
    ];
    const mockDish1 = { id: 'dish1', name: 'Favorite Dish 1' };
    const mockDish2 = { id: 'dish2', name: 'Favorite Dish 2' };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockFavorites));
    fetchMock.mockResponseOnce(JSON.stringify(mockDish1));
    fetchMock.mockResponseOnce(JSON.stringify(mockDish2));
    
    const favorites = await apiService.getFavoritesByUserId('user1');
    
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_URL}/favorites?userId=user1`);
    expect(favorites).toEqual([mockDish1, mockDish2]);
  });
  
  test('getFavoritesByUserId should return empty array when user has no favorites', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));
    
    const favorites = await apiService.getFavoritesByUserId('user2');
    
    expect(favorites).toEqual([]);
  });
  
  // Test pour addToFavorites
  test('addToFavorites should add dish to favorites when not already favorite', async () => {
    const mockFavorite = { id: 'fav3', userId: 'user1', dishId: 'dish3' };
    
    fetchMock.mockResponseOnce(JSON.stringify([]));
    fetchMock.mockResponseOnce(JSON.stringify(mockFavorite));
    
    const favorite = await apiService.addToFavorites('user1', 'dish3');
    
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_URL}/favorites?userId=user1&dishId=dish3`);
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user1', dishId: 'dish3' })
    });
    expect(favorite).toEqual(mockFavorite);
  });
  
  test('addToFavorites should return existing favorite when already in favorites', async () => {
    const mockFavorite = { id: 'fav4', userId: 'user1', dishId: 'dish4' };
    
    fetchMock.mockResponseOnce(JSON.stringify([mockFavorite]));
    
    const favorite = await apiService.addToFavorites('user1', 'dish4');
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(favorite).toEqual(mockFavorite);
  });
  
  // Test pour removeFromFavorites
  test('removeFromFavorites should delete favorite when it exists', async () => {
    const mockFavorite = { id: 'fav5', userId: 'user1', dishId: 'dish5' };
    
    fetchMock.mockResponseOnce(JSON.stringify([mockFavorite]));
    fetchMock.mockResponseOnce(JSON.stringify({}));
    
    await apiService.removeFromFavorites('user1', 'dish5');
    
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_URL}/favorites?userId=user1&dishId=dish5`);
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/favorites/fav5`, {
      method: 'DELETE'
    });
  });
  
  test('removeFromFavorites should do nothing when favorite does not exist', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));
    
    await apiService.removeFromFavorites('user1', 'dish6');
    
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  
  // Test pour checkIsFavorite
  test('checkIsFavorite should return true when dish is favorite', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: 'fav7' }]));
    
    const isFavorite = await apiService.checkIsFavorite('user1', 'dish7');
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/favorites?userId=user1&dishId=dish7`);
    expect(isFavorite).toBe(true);
  });
  
  test('checkIsFavorite should return false when dish is not favorite', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));
    
    const isFavorite = await apiService.checkIsFavorite('user1', 'dish8');
    
    expect(isFavorite).toBe(false);
  });
});

describe('API Service - Order Functions', () => {
  // Test pour createOrder
  test('createOrder should create a new order', async () => {
    const mockDish = { 
      id: 'dish1', 
      name: 'Test Dish', 
      description: 'Delicious test dish', 
      price: 15.99,
      image: 'test.jpg',
      allergens: ['gluten', 'lactose']
    };
    const mockOrder = { 
      id: 'order1', 
      userId: 'user1', 
      dishes: [mockDish],
      totalAmount: 15.99,
      status: 'en cours',
      deliveryLocation: 'Room 101',
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2023-01-01T12:00:00Z'
    };
    
    const mockDate = new Date('2023-01-01T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    fetchMock.mockResponseOnce(JSON.stringify(mockOrder));
    
    const order = await apiService.createOrder('user1', mockDish, 'Room 101');
    
    expect(order).toEqual(mockOrder);
    
    jest.restoreAllMocks();
  });
  
  // Test pour fetchOrderHistory
  test('fetchOrderHistory should return orders for a specific user', async () => {
    const mockOrders = [
      { id: 'order1', userId: 'user1' },
      { id: 'order2', userId: 'user1' }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify(mockOrders));
    
    const orders = await apiService.fetchOrderHistory('user1');
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/orders?userId=user1`);
    expect(orders).toEqual(mockOrders);
  });
  
  test('fetchOrderHistory should return all orders when no userId is provided', async () => {
    const mockOrders = [
      { id: 'order1', userId: 'user1' },
      { id: 'order2', userId: 'user2' }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify(mockOrders));
    
    const orders = await apiService.fetchOrderHistory();
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/orders`);
    expect(orders).toEqual(mockOrders);
  });
  
  // Test pour fetchOrderById
  test('fetchOrderById should return a specific order', async () => {
    const mockOrder = { id: 'order3', userId: 'user3' };
    
    fetchMock.mockResponseOnce(JSON.stringify(mockOrder));
    
    const order = await apiService.fetchOrderById('order3');
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/orders/order3`);
    expect(order).toEqual(mockOrder);
  });
  
  // Test pour cancelOrder
  test('cancelOrder should update order status to cancelled', async () => {
    const originalOrder = { 
      id: 'order4', 
      userId: 'user4',
      status: 'en cours',
      updatedAt: '2023-01-01T12:00:00Z'
    };
    const updatedOrder = {
      ...originalOrder,
      status: 'annulée',
      updatedAt: '2023-01-02T12:00:00Z'
    };
    
    const mockDate = new Date('2023-01-02T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    fetchMock.mockResponseOnce(JSON.stringify(originalOrder));
    fetchMock.mockResponseOnce(JSON.stringify(updatedOrder));
    
    const order = await apiService.cancelOrder('order4');
    
    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_URL}/orders/order4`);
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_URL}/orders/order4`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...originalOrder,
        status: 'annulée',
        updatedAt: mockDate.toISOString()
      })
    });
    expect(order).toEqual(updatedOrder);
    
    jest.restoreAllMocks();
  });
  
  test('createOrderFromCart should create an order from cart items', async () => {
    const mockCartItems: CartItem[] = [
      { 
        id: 'dish1', 
        name: 'Dish 1', 
        description: 'Description 1', 
        price: 10.99, 
        image: 'image1.jpg',
        quantity: 2,
        allergens: ['gluten', 'lactose']
      },
      { 
        id: 'dish2', 
        name: 'Dish 2', 
        description: 'Description 2', 
        price: 8.99, 
        image: 'image2.jpg',
        quantity: 1,
        allergens: ['fruits de mer'] 
      }
    ];
    const mockOrder = {
      id: 'order5',
      userId: 'user5',
      dishes: mockCartItems,
      totalAmount: 30.97,
      status: 'en cours',
      deliveryLocation: 'Room 202',
      createdAt: '2023-01-03T12:00:00Z',
      updatedAt: '2023-01-03T12:00:00Z'
    };
    
    const mockDate = new Date('2023-01-03T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    fetchMock.mockResponseOnce(JSON.stringify(mockOrder));
    
    const order = await apiService.createOrderFromCart('user5', mockCartItems, 30.97, 'Room 202');
    
    expect(order).toEqual(mockOrder);
    
    jest.restoreAllMocks();
  });
});

describe('API Service - Location Functions', () => {
  // Test pour fetchUniversities
  test('fetchUniversities should return universities list', async () => {
    const mockUniversities = [
      { id: 'uni1', name: 'University 1' },
      { id: 'uni2', name: 'University 2' }
    ];
    

    fetchMock.mockResponseOnce(JSON.stringify(mockUniversities));
    
    const universities = await apiService.fetchUniversities();
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/universities`);
    expect(universities).toEqual(mockUniversities);
  });
  
  // Test pour fetchRooms
  test('fetchRooms should return rooms list', async () => {
    const mockRooms = [
      { id: 'room1', name: 'Room 1', building: 'Building A' },
      { id: 'room2', name: 'Room 2', building: 'Building B' }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify(mockRooms));
    
    const rooms = await apiService.fetchRooms();
    
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/rooms`);
    expect(rooms).toEqual(mockRooms);
  });
});