import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Package, Trash2, Plus, Minus, LogOut, ShoppingBag } from 'lucide-react';
import { getCurrentUser, logout, updateUser, validateUserSession } from '../utils/auth';
import { getProducts, searchProducts, updateStock, logSale } from '../utils/storage';
import { Product, CartItem, User as UserType, SaleRecord, SaleItem, CustomerDetails } from '../types';
import ProductCard from './ProductCard';
import SalesModal from './SalesModal';
import QuantityModal from './QuantityModal';
import ProductDetailModal from './ProductDetailModal';
import ReceiptModal from './ReceiptModal';
import ProductFilterBar from './ProductFilterBar';

interface UserDashboardProps {
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout }) => {
  const [user, setUser] = useState<UserType | null>(getCurrentUser());
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesItems, setSalesItems] = useState<SaleItem[]>([]);
  const [completedSaleItems, setCompletedSaleItems] = useState<SaleItem[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'cart' | 'sales' | 'profile'>('browse');
  const [notification, setNotification] = useState<string>('');
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceiptNumber, setLastReceiptNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setSelectedModel('');
    setSortBy('');
  };

  // Security check - ensure user is authenticated
  useEffect(() => {
    if (!validateUserSession() || !user) {
      console.warn('Unauthorized access attempt to UserDashboard');
      onLogout();
      return;
    }

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (!validateUserSession()) {
        console.warn('Session expired, logging out');
        onLogout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [user, onLogout]);

  // If user is not valid, don't render the dashboard
  if (!validateUserSession() || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  useEffect(() => {
    const loadProducts = async () => {
      const productsData = await getProducts();
      setProducts(productsData);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    performSearch();
  }, [searchQuery]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          showNotification('Cannot add more items than available in stock');
          return prev;
        }
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
    showNotification(`Added ${product.name} to cart`);
  };

  const addToSale = (product: Product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const totalPrice = quantity * selectedProduct.sellpricePerUnit;
    const saleItem: SaleItem = {
      product: selectedProduct,
      quantity,
      totalPrice
    };

    setSalesItems(prev => {
      const existingItem = prev.find(item => item.product.id === selectedProduct.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity, totalPrice: item.totalPrice + totalPrice }
            : item
        );
      } else {
        return [...prev, saleItem];
      }
    });

    showNotification(`Added ${quantity} ${selectedProduct.unit} of ${selectedProduct.name} to sale`);
    setSelectedProduct(null);
  };

  const removeFromSale = (productId: string) => {
    setSalesItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const completeSale = async (_customDateTime?: string, _warrantyInfo?: { dateOfSale: string; warrantyEndDate: string }, _customerDetails?: CustomerDetails) => {
    if (!user || salesItems.length === 0) return;
    const receiptNumber = `RCP${Date.now()}`;
    setLastReceiptNumber(receiptNumber);
    let totalAmount = 0;
    let pointsEarned = 0;

    const itemsForReceipt = [...salesItems];

    for (const item of salesItems) {
      totalAmount += item.totalPrice;
      pointsEarned += Math.floor(item.totalPrice);
      await updateStock(item.product.id, item.product.stock - item.quantity);
      const sale: SaleRecord = {
        productID: item.product.id,
        productName: item.product.name,
        quantitySold: item.quantity,
        sellpricePerUnit: item.product.sellpricePerUnit,
        totalPrice: item.totalPrice,
        unit: item.product.unit,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        commonId: item.product.commonId || item.product.id,
        uniqueId: item.product.uniqueId || item.product.id
      };
      await logSale(sale);
    }
    const updatedUser = {
      ...user,
      points: user.points + pointsEarned,
      purchaseHistory: [
        ...user.purchaseHistory,
        ...salesItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.totalPrice,
          timestamp: new Date().toISOString(),
          pointsEarned: Math.floor(item.totalPrice)
        }))
      ]
    };
    await updateUser(user.id, updatedUser);
    setUser(updatedUser);
    setCompletedSaleItems(itemsForReceipt);
    setSalesItems([]);
    const refreshedProducts = await getProducts();
    setProducts(refreshedProducts);
    setShowSalesModal(false);
    setShowReceiptModal(true);
    showNotification(`Sale completed! Earned ${pointsEarned} points`);
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const checkout = async () => {
    if (!user) return;

    let totalAmount = 0;
    let pointsEarned = 0;

    cart.forEach(item => {
      const itemTotal = item.product.sellpricePerUnit * item.quantity;
      totalAmount += itemTotal;
      pointsEarned += Math.floor(itemTotal);

      updateStock(item.product.id, item.product.stock - item.quantity);

      const sale: SaleRecord = {
        productID: item.product.id,
        productName: item.product.name,
        quantitySold: item.quantity,
        sellpricePerUnit: item.product.sellpricePerUnit,
        totalPrice: itemTotal,
        unit: item.product.unit,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        commonId: item.product.commonId || item.product.id,
        uniqueId: item.product.uniqueId || item.product.id
      };
      logSale(sale);
    });

    const updatedUser = {
      ...user,
      points: user.points + pointsEarned,
      purchaseHistory: [
        ...user.purchaseHistory,
        ...cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.sellpricePerUnit * item.quantity,
          timestamp: new Date().toISOString(),
          pointsEarned: Math.floor(item.product.sellpricePerUnit * item.quantity)
        }))
      ]
    };

    await updateUser(user.id, updatedUser);
    setUser(updatedUser);
    setCart([]);
    const refreshedProducts = await getProducts();
    setProducts(refreshedProducts);
    showNotification(`Purchase complete! Earned ${pointsEarned} points`);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.sellpricePerUnit * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSeeMore = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const filteredProducts = products
    .filter(p =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedSubcategory || p.subcategory === selectedSubcategory || p.networkItem === selectedSubcategory) &&
      (!selectedBrand || p.brand === selectedBrand) &&
      (!selectedModel || p.model === selectedModel) &&
      (searchQuery.trim() === '' || 
       p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Default order: Name A-Z when no sort is specified
      if (!sortBy || sortBy === '') {
        return a.name.localeCompare(b.name);
      }
      
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.sellpricePerUnit - b.sellpricePerUnit;
        case 'price-desc':
          return b.sellpricePerUnit - a.sellpricePerUnit;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'newest':
          return new Date(b.addedDate || '').getTime() - new Date(a.addedDate || '').getTime();
        case 'oldest':
          return new Date(a.addedDate || '').getTime() - new Date(b.addedDate || '').getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {notification && (
          <div className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 border border-green-400/30">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Store Dashboard</h1>
              <p className="text-slate-400">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-lg">{user.points} Points</p>
                <p className="text-slate-400 text-sm">Sales: {user.purchaseHistory.length}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
          {[
            { id: 'browse', label: 'Browse Products', icon: Package },
            { id: 'search', label: 'Search Products', icon: Search },
            { id: 'cart', label: `Shopping Cart (${cartItemCount})`, icon: ShoppingCart },
            { id: 'profile', label: 'Profile', icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-emerald-400 text-slate-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Available Products</h2>
            <ProductFilterBar
              products={products}
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={handleClearFilters}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onSeeMore={handleSeeMore}
                  showAddToCart={true}
                  showSeeMore={true}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Product ID or Name..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                />
              </div>
            </div>

            {searchQuery && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Search Results ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onSeeMore={handleSeeMore}
                      showAddToCart={true}
                      showSeeMore={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Sales Feature Not Available</h2>
              <p className="text-slate-400 text-lg">This feature is only available for administrators.</p>
              <p className="text-slate-500 text-sm mt-2">Please contact an admin to process sales.</p>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Shopping Cart</h2>
            {cart.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 flex items-center space-x-6"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{item.product.name}</h3>
                      <p className="text-slate-400">ID: {item.product.id}</p>
                      <p className="text-emerald-400 font-bold">৳{item.product.sellpricePerUnit}/{item.product.unit}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300"
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">৳{(item.product.sellpricePerUnit * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 hover:text-red-300 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-white">Total: ৳{cartTotal.toFixed(2)}</span>
                    <span className="text-emerald-400">Points to earn: {Math.floor(cartTotal)}</span>
                  </div>
                  <button
                    onClick={checkout}
                    className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    Complete Purchase
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Name</label>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email</label>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Role</label>
                  <p className="text-emerald-400 font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Points Earned</label>
                  <p className="text-green-400 font-bold text-lg">{user.points}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Purchase History</h3>
              {user.purchaseHistory.length === 0 ? (
                <p className="text-slate-400">No purchases yet</p>
              ) : (
                <div className="space-y-3">
                  {user.purchaseHistory.slice(-5).reverse().map((purchase, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium">{purchase.productName}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(purchase.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400">৳{purchase.price.toFixed(2)}</p>
                        <p className="text-green-400 text-sm">+{purchase.pointsEarned} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales Modal */}
        <SalesModal
          isOpen={showSalesModal}
          onClose={() => setShowSalesModal(false)}
          salesItems={salesItems}
          onRemoveItem={removeFromSale}
          onCompleteSale={completeSale}
        />

        {/* Quantity Modal */}
        <QuantityModal
          isOpen={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          product={selectedProduct}
          onConfirm={handleQuantityConfirm}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          product={selectedProduct}
          onAddToCart={addToCart}
          onAddToSale={addToSale}
          showAddToCart={true}
          showSellButton={true}
        />

        {/* Receipt Modal */}
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          salesItems={completedSaleItems}
          receiptNumber={lastReceiptNumber}
          cashierName={user.name}
        />
      </div>
    </div>
  );
};

export default UserDashboard;