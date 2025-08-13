import { User } from '../types';

const STORAGE_KEY = 'friends_it_zone_auth';
const USERS_KEY = 'friends_it_zone_users';

// Initialize default users
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@friendsitzone.com',
        password: 'admin123',
        role: 'admin',
        points: 0,
        purchaseHistory: [],
        name: 'KAJAL BISWAS'
      },
      {
        id: 'admin-2',
        email: 'tanim@friendsitzone.com',
        password: 'admin123',
        role: 'admin',
        points: 0,
        purchaseHistory: [],
        name: 'ASHRAFUL ALAM TANIM'
      },
      {
        id: 'seller-1',
        email: 'seller@friendsitzone.com',
        password: 'seller123',
        role: 'seller',
        points: 0,
        purchaseHistory: [],
        name: 'Store Seller'
      },
      {
        id: 'customer-1',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        points: 250,
        purchaseHistory: [],
        name: 'John Doe'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

export const login = (email: string, password: string): User | null => {
  initializeUsers();
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const register = (email: string, password: string, name: string): User | null => {
  initializeUsers();
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email === email)) {
    return null; // User already exists
  }
  
  const newUser: User = {
    id: `customer-${Date.now()}`,
    email,
    password,
    role: 'customer',
    points: 0,
    purchaseHistory: [],
    name
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const updateUser = (updatedUser: User) => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }
};

export const getAllUsers = (): User[] => {
  initializeUsers();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const createUser = (email: string, password: string, name: string, role: 'customer' | 'admin'): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find(u => u.email === email)) {
    return null;
  }
  
  const newUser: User = {
    id: `${role}-${Date.now()}`,
    email,
    password,
    role,
    points: 0,
    purchaseHistory: [],
    name
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const clearAllData = (): boolean => {
  try {
    // Clear all products
    localStorage.removeItem('friends_it_zone_products');
    
    // Clear all sales logs
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('friends_it_zone_sales_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all purchase logs
    keys.forEach(key => {
      if (key.startsWith('friends_it_zone_purchases_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all return logs
    keys.forEach(key => {
      if (key.startsWith('friends_it_zone_returns_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all categories
    localStorage.removeItem('friends_it_zone_categories');
    
    // Clear all user purchase histories (keep user accounts but clear their purchase data)
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const clearedUsers = users.map(user => ({
      ...user,
      purchaseHistory: [],
      points: 0
    }));
    localStorage.setItem(USERS_KEY, JSON.stringify(clearedUsers));
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
export const deleteUser = (userId: string) => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
};