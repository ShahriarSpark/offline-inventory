import { ProductIdValidation } from '../types';

// Store for tracking used unique IDs
let usedUniqueIds: Set<string> = new Set();

// Initialize used IDs from existing data
export const initializeUsedIds = (existingProducts: any[]) => {
  usedUniqueIds.clear();
  existingProducts.forEach(product => {
    if (product.uniqueId) {
      usedUniqueIds.add(product.uniqueId);
    }
  });
};

// Generate a unique ID based on common ID
export const generateUniqueId = (commonId: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${commonId}-${timestamp}-${randomSuffix}`;
};

// Generate a simple incremental unique ID
export const generateIncrementalUniqueId = (commonId: string, existingIds: string[]): string => {
  const existingIdsForCommonId = existingIds.filter(id => id.startsWith(commonId));
  const maxNumber = existingIdsForCommonId.reduce((max, id) => {
    const parts = id.split('-');
    const numberPart = parts[parts.length - 1];
    const number = parseInt(numberPart) || 0;
    return Math.max(max, number);
  }, 0);
  
  const nextNumber = maxNumber + 1;
  return `${commonId}-${nextNumber.toString().padStart(4, '0')}`;
};

// Validate common ID format
export const validateCommonId = (commonId: string): ProductIdValidation => {
  if (!commonId || commonId.trim() === '') {
    return {
      isValid: false,
      message: 'Common ID is required'
    };
  }

  if (commonId.length < 3) {
    return {
      isValid: false,
      message: 'Common ID must be at least 3 characters long'
    };
  }

  if (!/^[A-Z0-9-]+$/i.test(commonId)) {
    return {
      isValid: false,
      message: 'Common ID can only contain letters, numbers, and hyphens'
    };
  }

  return {
    isValid: true,
    message: 'Common ID is valid'
  };
};

// Validate unique ID
export const validateUniqueId = (uniqueId: string, excludeId?: string): ProductIdValidation => {
  if (!uniqueId || uniqueId.trim() === '') {
    return {
      isValid: false,
      message: 'Unique ID is required'
    };
  }

  if (uniqueId.length < 5) {
    return {
      isValid: false,
      message: 'Unique ID must be at least 5 characters long'
    };
  }

  // Check if ID is already used (excluding current item if editing)
  const isDuplicate = usedUniqueIds.has(uniqueId) && uniqueId !== excludeId;
  
  if (isDuplicate) {
    return {
      isValid: false,
      message: 'This Unique ID is already in use',
      isDuplicate: true
    };
  }

  return {
    isValid: true,
    message: 'Unique ID is valid'
  };
};

// Add unique ID to used set
export const addUsedUniqueId = (uniqueId: string) => {
  usedUniqueIds.add(uniqueId);
};

// Remove unique ID from used set (for editing)
export const removeUsedUniqueId = (uniqueId: string) => {
  usedUniqueIds.delete(uniqueId);
};

// Check if unique ID exists
export const isUniqueIdUsed = (uniqueId: string): boolean => {
  return usedUniqueIds.has(uniqueId);
};

// Get all unique IDs for a common ID
export const getUniqueIdsForCommonId = (commonId: string, allProducts: any[]): string[] => {
  return allProducts
    .filter(product => product.commonId === commonId)
    .map(product => product.uniqueId)
    .filter(Boolean);
};

// Format common ID for display
export const formatCommonId = (commonId: string): string => {
  return commonId.toUpperCase();
};

// Format unique ID for display
export const formatUniqueId = (uniqueId: string): string => {
  return uniqueId.toUpperCase();
}; 