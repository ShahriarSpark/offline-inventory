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

// Initialize default IT electronics products
const initializeProducts = () => {
  const existingProducts = localStorage.getItem(PRODUCTS_KEY);
  if (!existingProducts) {
    const defaultProducts: Product[] = [
      {
        id: 'IT2025-RTR001',
        name: 'TP-Link Archer C6 AC1200 Wireless Router',
        brand: 'TP-Link',
        supplier: 'TP-Link Bangladesh',
        addedDate: '2024-01-15',
        sellpricePerUnit: 3500,
        stock: 25,
        unit: 'piece',
        category: 'Networking',
        rating: 4.7,
        image: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'High-speed dual-band wireless router with 4 Gigabit LAN ports and advanced security features.',
        specifications: {
          'Wireless Standard': '802.11ac',
          'Speed': '1200 Mbps',
          'Frequency': '2.4GHz + 5GHz',
          'Antennas': '4 External',
          'Ports': '4 x Gigabit LAN'
        }
      },
      {
        id: 'IT2025-SSD001',
        name: 'WD Blue 500GB SATA SSD',
        brand: 'Western Digital',
        supplier: 'WD Bangladesh',
        addedDate: '2024-01-20',
        sellpricePerUnit: 4200,
        stock: 40,
        unit: 'piece',
        category: 'Storage',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Fast and reliable 500GB SATA SSD for improved system performance and faster boot times.',
        specifications: {
          'Capacity': '500GB',
          'Interface': 'SATA 6Gb/s',
          'Form Factor': '2.5 inch',
          'Read Speed': '560 MB/s',
          'Write Speed': '530 MB/s'
        }
      },
      {
        id: 'IT2025-MON001',
        name: 'ASUS VA24EHE 24" Full HD Monitor',
        brand: 'ASUS',
        supplier: 'ASUS Bangladesh',
        addedDate: '2024-02-01',
        sellpricePerUnit: 12500,
        stock: 15,
        unit: 'piece',
        category: 'Monitors',
        rating: 4.6,
        image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: '24-inch Full HD IPS monitor with ultra-slim design and eye care technology.',
        specifications: {
          'Screen Size': '24 inches',
          'Resolution': '1920x1080',
          'Panel Type': 'IPS',
          'Refresh Rate': '75Hz',
          'Response Time': '5ms'
        }
      },
      {
        id: 'IT2025-HDD001',
        name: 'Seagate Barracuda 1TB HDD',
        brand: 'Seagate',
        supplier: 'Seagate Bangladesh',
        addedDate: '2024-02-05',
        sellpricePerUnit: 3800,
        stock: 30,
        unit: 'piece',
        category: 'Storage',
        rating: 4.5,
        image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Reliable 1TB internal hard drive with 7200 RPM speed for desktop computers.',
        specifications: {
          'Capacity': '1TB',
          'Interface': 'SATA 6Gb/s',
          'RPM': '7200',
          'Cache': '64MB',
          'Form Factor': '3.5 inch'
        }
      },
      {
        id: 'IT2025-KB001',
        name: 'Logitech MK540 Wireless Keyboard & Mouse',
        brand: 'Logitech',
        supplier: 'Logitech Bangladesh',
        addedDate: '2024-02-10',
        sellpricePerUnit: 4500,
        stock: 20,
        unit: 'set',
        category: 'Accessories',
        rating: 4.4,
        image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Wireless keyboard and mouse combo with long battery life and comfortable typing experience.',
        specifications: {
          'Connection': 'Wireless 2.4GHz',
          'Battery Life': '36 months (keyboard), 18 months (mouse)',
          'Range': '10 meters',
          'Layout': 'Full-size',
          'Special Keys': 'Media keys'
        }
      },
      {
        id: 'IT2025-LAP001',
        name: 'ASUS VivoBook 15 X515EA',
        brand: 'ASUS',
        supplier: 'ASUS Bangladesh',
        addedDate: '2024-02-15',
        sellpricePerUnit: 45000,
        stock: 8,
        unit: 'piece',
        category: 'Computing',
        rating: 4.3,
        image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Lightweight 15.6-inch laptop with Intel Core i3 processor, perfect for everyday computing.',
        specifications: {
          'Processor': 'Intel Core i3-1115G4',
          'RAM': '4GB DDR4',
          'Storage': '256GB SSD',
          'Display': '15.6" Full HD',
          'Graphics': 'Intel UHD Graphics'
        }
      },
      {
        id: 'IT2025-SW001',
        name: 'TP-Link TL-SG1005D 5-Port Switch',
        brand: 'TP-Link',
        supplier: 'TP-Link Bangladesh',
        addedDate: '2024-02-20',
        sellpricePerUnit: 1200,
        stock: 35,
        unit: 'piece',
        category: 'Networking',
        rating: 4.6,
        image: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: '5-port Gigabit desktop switch for expanding network connectivity.',
        specifications: {
          'Ports': '5 x 10/100/1000Mbps',
          'Switching Capacity': '10Gbps',
          'MAC Address Table': '2K',
          'Power': 'External adapter',
          'Dimensions': '99 × 98 × 25 mm'
        }
      },
      {
        id: 'IT2025-RAM001',
        name: 'Corsair Vengeance LPX 8GB DDR4',
        brand: 'Corsair',
        supplier: 'Corsair Bangladesh',
        addedDate: '2024-02-25',
        sellpricePerUnit: 2800,
        stock: 50,
        unit: 'piece',
        category: 'Computing',
        rating: 4.8,
        image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'High-performance 8GB DDR4 memory module for gaming and professional applications.',
        specifications: {
          'Capacity': '8GB',
          'Type': 'DDR4',
          'Speed': '3200MHz',
          'Latency': 'CL16',
          'Voltage': '1.35V'
        }
      }
    ];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  }
};

// Initialize default categories
const initializeCategories = () => {
  const existingCategories = localStorage.getItem(CATEGORIES_KEY);
  if (!existingCategories) {
    const defaultCategories: Category[] = [
      { id: 'cat-1', name: 'Networking', description: 'Routers, switches, and network equipment', createdDate: '2024-01-01' },
      { id: 'cat-2', name: 'Storage', description: 'Hard drives, SSDs, and storage devices', createdDate: '2024-01-01' },
      { id: 'cat-3', name: 'Computing', description: 'Laptops, desktops, and computer components', createdDate: '2024-01-01' },
      { id: 'cat-4', name: 'Monitors', description: 'LCD, LED, and gaming monitors', createdDate: '2024-01-01' },
      { id: 'cat-5', name: 'Accessories', description: 'Keyboards, mice, and other peripherals', createdDate: '2024-01-01' },
      { id: 'cat-6', name: 'Servers', description: 'Server hardware and components', createdDate: '2024-01-01' },
      { id: 'cat-7', name: 'Security', description: 'CCTV cameras and security systems', createdDate: '2024-01-01' },
      { id: 'cat-8', name: 'Printers', description: 'Printers and printing accessories', createdDate: '2024-01-01' }
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }
};

export const getProducts = (): Product[] => {
  initializeProducts();
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
};

export const getCategories = (): Category[] => {
  initializeCategories();
  return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
};

export const addCategory = (category: Category): boolean => {
  const categories = getCategories();
  if (categories.find(c => c.name.toLowerCase() === category.name.toLowerCase())) {
    return false; // Category already exists
  }
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  return true;
};

export const deleteCategory = (categoryId: string): boolean => {
  const categories = getCategories();
  const filteredCategories = categories.filter(c => c.id !== categoryId);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
  return true;
};

export const getProductById = (id: string): Product | null => {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
};

export const searchProducts = (query: string): Product[] => {
  const products = getProducts();
  const lowercaseQuery = query.toLowerCase();
  return products.filter(p => 
    p.id.toLowerCase().includes(lowercaseQuery) ||
    p.name.toLowerCase().includes(lowercaseQuery)
  );
};

export const searchProductsByBrand = (brand: string): Product[] => {
  const products = getProducts();
  const lowercaseBrand = brand.toLowerCase();
  return products.filter(p => 
    p.brand && p.brand.toLowerCase().includes(lowercaseBrand)
  );
};

export const searchProductsBySupplier = (supplier: string): Product[] => {
  const products = getProducts();
  const lowercaseSupplier = supplier.toLowerCase();
  return products.filter(p => 
    p.supplier && p.supplier.toLowerCase().includes(lowercaseSupplier)
  );
};

export const filterProducts = (filters: {
  category?: string;
  priceRange?: { min: number; max: number };
  availability?: 'all' | 'in-stock' | 'out-of-stock';
  brand?: string;
}): Product[] => {
  let products = getProducts();

  if (filters.category && filters.category !== '') {
    products = products.filter(p => p.category === filters.category);
  }

  if (filters.brand && filters.brand !== '') {
    products = products.filter(p => 
      p.brand && p.brand.toLowerCase().includes(filters.brand.toLowerCase())
    );
  }

  if (filters.priceRange) {
    products = products.filter(p => 
      p.sellpricePerUnit >= filters.priceRange!.min && 
      p.sellpricePerUnit <= filters.priceRange!.max
    );
  }

  if (filters.availability === 'in-stock') {
    products = products.filter(p => p.stock > 0);
  } else if (filters.availability === 'out-of-stock') {
    products = products.filter(p => p.stock === 0);
  }

  return products;
};

export const addProduct = (product: Product): boolean => {
  const products = getProducts();
  if (products.find(p => p.id === product.id)) {
    return false; // Product ID already exists
  }
  products.push(product);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return true;
};

export const updateProduct = (product: Product): boolean => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index === -1) return false;
  
  products[index] = product;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return true;
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filteredProducts = products.filter(p => p.id !== id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filteredProducts));
  return true;
};

export const updateStock = (productId: string, newStock: number): boolean => {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return false;
  
  product.stock = newStock;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return true;
};

export const logSale = (sale: SaleRecord) => {
  const today = new Date().toISOString().split('T')[0];
  const salesKey = `${SALES_KEY}_${today}`;
  const existingSales = JSON.parse(localStorage.getItem(salesKey) || '[]');
  existingSales.push(sale);
  localStorage.setItem(salesKey, JSON.stringify(existingSales));
};

export const logPurchase = (purchase: PurchaseRecord) => {
  const today = new Date().toISOString().split('T')[0];
  const purchasesKey = `${PURCHASES_KEY}_${today}`;
  const existingPurchases = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
  existingPurchases.push(purchase);
  localStorage.setItem(purchasesKey, JSON.stringify(existingPurchases));
};

export const logReturn = (returnRecord: ReturnRecord) => {
  const today = new Date().toISOString().split('T')[0];
  const returnsKey = `${RETURNS_KEY}_${today}`;
  const existingReturns = JSON.parse(localStorage.getItem(returnsKey) || '[]');
  existingReturns.push(returnRecord);
  localStorage.setItem(returnsKey, JSON.stringify(existingReturns));
};

export const getSalesLogs = (): SaleRecord[] => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(SALES_KEY));
  const allSales: SaleRecord[] = [];
  keys.forEach(key => {
    const sales = JSON.parse(localStorage.getItem(key) || '[]');
    allSales.push(...sales);
  });
  return allSales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getPurchaseLogs = (): PurchaseRecord[] => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(PURCHASES_KEY));
  const allPurchases: PurchaseRecord[] = [];
  keys.forEach(key => {
    const purchases = JSON.parse(localStorage.getItem(key) || '[]');
    allPurchases.push(...purchases);
  });
  return allPurchases.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getReturnLogs = (): ReturnRecord[] => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(RETURNS_KEY));
  const allReturns: ReturnRecord[] = [];
  keys.forEach(key => {
    const returns = JSON.parse(localStorage.getItem(key) || '[]');
    allReturns.push(...returns);
  });
  return allReturns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getTodaysSales = (): DailySales => {
  const today = new Date().toISOString().split('T')[0];
  const salesKey = `${SALES_KEY}_${today}`;
  const sales = JSON.parse(localStorage.getItem(salesKey) || '[]');
  
  const totalAmount = sales.reduce((sum: number, sale: SaleRecord) => sum + sale.totalPrice, 0);
  const totalItems = sales.reduce((sum: number, sale: SaleRecord) => sum + sale.quantitySold, 0);
  
  return {
    date: today,
    sales,
    totalAmount,
    totalItems
  };
};

export const downloadSalesData = (sales: SaleRecord[], date: string) => {
  const salesData = {
    date,
    sales,
    totalAmount: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
    totalItems: sales.reduce((sum, sale) => sum + sale.quantitySold, 0),
    generatedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(salesData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${date}_sales.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadPurchaseData = (purchases: PurchaseRecord[], date: string) => {
  const purchaseData = {
    date,
    purchases,
    totalCost: purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0),
    totalItems: purchases.reduce((sum, purchase) => sum + purchase.quantityAdded, 0),
    generatedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(purchaseData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${date}_purchases.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadReturnData = (returns: ReturnRecord[], date: string) => {
  const returnData = {
    date,
    returns,
    totalRefund: returns.reduce((sum, returnRecord) => sum + returnRecord.totalRefund, 0),
    totalItems: returns.reduce((sum, returnRecord) => sum + returnRecord.quantityReturned, 0),
    generatedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(returnData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${date}_returns.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};