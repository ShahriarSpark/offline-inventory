import { User } from '../types';
import { apiService } from './apiService';

const STORAGE_KEY = 'friends_it_zone_auth';

// Get current authenticated user from session storage
export const getCurrentUser = (): User | null => {
  try {
    const user = sessionStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Validate current user session
export const validateUserSession = (): boolean => {
  try {
    const user = getCurrentUser();
    if (!user || !user.id || !user.email) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating user session:', error);
    return false;
  }
};

// Save current user to session storage
export const setCurrentUser = (user: User): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Login function
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = await apiService.login(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

// Logout function
export const logout = (): void => {
  try {
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear any cached data in memory
    // Don't force reload, let the app handle the logout gracefully
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if there's an error, try to clear what we can
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (fallbackError) {
      console.error('Fallback logout cleanup failed:', fallbackError);
    }
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await apiService.getUsers();
    const administrators = await apiService.getAdministrators();
    return [...users, ...administrators];
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    return [];
  }
};

// Create new user
export const createUser = async (userData: Omit<User, 'id'>): Promise<boolean> => {
  try {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      points: 0,
      purchaseHistory: []
    };

    let result;
    if (userData.role === 'admin' || userData.role === 'seller') {
      result = await apiService.addAdministrator(newUser);
    } else {
      result = await apiService.addUser(newUser);
    }
    
    return result.success;
  } catch (error) {
    console.error('Failed to create user:', error);
    return false;
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Try to delete from users first
    let result = await apiService.deleteUser(userId);
    if (!result.success) {
      // If not found in users, try administrators
      // Note: You might need to add deleteAdministrator to your API
      console.log('User not found in regular users, might be an administrator');
    }
    return result.success;
  } catch (error) {
    console.error('Failed to delete user:', error);
    return false;
  }
};

// Clear all data (admin only)
export const clearAllData = async (): Promise<boolean> => {
  try {
    const result = await apiService.clearAllData();
    if (result.success) {
      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

// Check if email already exists
export const emailExists = async (email: string): Promise<boolean> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Failed to check email existence:', error);
    return false;
  }
};

// Register new user
export const register = async (userData: Omit<User, 'id' | 'points' | 'purchaseHistory'>): Promise<User | null> => {
  try {
    const emailTaken = await emailExists(userData.email);
    if (emailTaken) {
      throw new Error('Email already exists');
    }

    const userWithDefaults = {
      ...userData,
      points: 0,
      purchaseHistory: []
    };

    const success = await createUser(userWithDefaults);
    if (success) {
      // Log the user in after registration
      return await login(userData.email, userData.password);
    }
    return null;
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
};

// Update user function
export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    // Check if this is an administrator update
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin' && currentUser.id === userId) {
      // Update administrator profile
      const result = await apiService.updateAdministrator(userId, userData);
      if (result.success) {
        // Update current user in session storage
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        return true;
      }
      return false;
    }
    
    // For regular users, this would need to be implemented as an API endpoint
    // For now, just return true as a placeholder
    console.log('Update user not yet implemented in JSON file system');
    return true;
  } catch (error) {
    console.error('Failed to update user:', error);
    return false;
  }
};
