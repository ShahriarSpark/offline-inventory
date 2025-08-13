import { Product, SaleRecord, PurchaseRecord, ReturnRecord, DailySales, Category } from '../types';
import { apiService } from './apiService';

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    return await apiService.getProducts();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const addProduct = async (product: Product): Promise<boolean> => {
  try {
    const result = await apiService.addProduct(product);
    return result.success;
  } catch (error) {
    console.error('Failed to add product:', error);
    return false;
  }
};

export const updateProduct = async (product: Product): Promise<boolean> => {
  try {
    const result = await apiService.updateProduct(product.id, product);
    return result.success;
  } catch (error) {
    console.error('Failed to update product:', error);
    return false;
  }
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const result = await apiService.deleteProduct(productId);
    return result.success;
  } catch (error) {
    console.error('Failed to delete product:', error);
    return false;
  }
};

export const updateStock = async (productId: string, newStock: number): Promise<boolean> => {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock = newStock;
      return await updateProduct(product);
    }
    return false;
  } catch (error) {
    console.error('Failed to update stock:', error);
    return false;
  }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    return await apiService.getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const addCategory = async (category: Category): Promise<boolean> => {
  try {
    const result = await apiService.addCategory(category);
    return result.success;
  } catch (error) {
    console.error('Failed to add category:', error);
    return false;
  }
};

export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const result = await apiService.deleteCategory(categoryId);
    return result.success;
  } catch (error) {
    console.error('Failed to delete category:', error);
    return false;
  }
};

// Sales
export const getSalesLogs = async (): Promise<SaleRecord[]> => {
  try {
    return await apiService.getSales();
  } catch (error) {
    console.error('Failed to fetch sales logs:', error);
    return [];
  }
};

export const logSale = async (sale: SaleRecord): Promise<boolean> => {
  try {
    const result = await apiService.addSale(sale);
    return result.success;
  } catch (error) {
    console.error('Failed to log sale:', error);
    return false;
  }
};

// Purchases
export const getPurchaseLogs = async (): Promise<PurchaseRecord[]> => {
  try {
    return await apiService.getPurchases();
  } catch (error) {
    console.error('Failed to fetch purchase logs:', error);
    return [];
  }
};

export const logPurchase = async (purchase: PurchaseRecord): Promise<boolean> => {
  try {
    const result = await apiService.addPurchase(purchase);
    return result.success;
  } catch (error) {
    console.error('Failed to log purchase:', error);
    return false;
  }
};

// Returns
export const getReturnLogs = async (): Promise<ReturnRecord[]> => {
  try {
    return await apiService.getReturns();
  } catch (error) {
    console.error('Failed to fetch return logs:', error);
    return [];
  }
};

export const logReturn = async (returnRecord: ReturnRecord): Promise<boolean> => {
  try {
    const result = await apiService.addReturn(returnRecord);
    return result.success;
  } catch (error) {
    console.error('Failed to log return:', error);
    return false;
  }
};

// Search and filter functions
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterProducts = async (filters: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
    if (filters.minPrice !== undefined && product.sellpricePerUnit < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.sellpricePerUnit > filters.maxPrice) return false;
    return true;
  });
};

// Today's sales calculation
export const getTodaysSales = async (): Promise<DailySales> => {
  const sales = await getSalesLogs();
  const today = new Date().toISOString().split('T')[0];
  
  const todaysSales = sales.filter(sale => 
    sale.timestamp && sale.timestamp.split('T')[0] === today
  );

  return {
    date: today,
    sales: todaysSales,
    totalAmount: todaysSales.reduce((sum, sale) => sum + sale.totalPrice, 0),
    totalItems: todaysSales.reduce((sum, sale) => sum + sale.quantitySold, 0)
  };
};
