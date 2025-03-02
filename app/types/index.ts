export interface Dish {
  id: string;
  name: string;
  description: string;
  allergens: string[];
  price: number;
  image: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}
