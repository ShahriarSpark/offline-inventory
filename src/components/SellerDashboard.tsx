import React, { useState, useEffect } from "react";
import {
  LogOut,
  Plus,
  ShoppingCart,
  Package,
  TrendingUp,
  Search,
  Filter,
  User,
  Building2,
  BarChart3,
  RefreshCw,
  Shield,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  ShoppingBag,
  SortAsc,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  User as UserType,
  Product,
  SaleRecord,
  ReturnRecord,
  Category,
  DailySales,
  CustomerDetails,
} from "../types";
import {
  getProducts,
  updateStock,
  getSalesLogs,
  getPurchaseLogs,
  getReturnLogs,
  getTodaysSales,
  getCategories,
  getSoldProducts,
} from "../utils/storage";
import TodaysSalesDashboard from "./TodaysSalesDashboard";
import SalesModal from "./SalesModal";
import ReceiptModal from "./ReceiptModal";
import ProductEditModal from "./ProductEditModal";
import ProductDetailModal from "./ProductDetailModal";
import QuantityModal from "./QuantityModal";
import PurchaseQuantityModal from "./PurchaseQuantityModal";
import WarrantyManagement from "./WarrantyManagement";
import BrandManagement from "./BrandManagement";
import PurchaseModal from "./PurchaseModal";
import ReturnModal from "./ReturnModal";

interface SellerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({
  user,
  onLogout,
}) => {
  // Move all hooks to the top, before any conditional returns
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // Remove unused variables and functions
  // const [setSortBy] = useState('name');
  // const [setSortOrder] = useState<'asc' | 'desc'>('asc');
  // const handleCategoryAdd = async () => { ... };
  // const netProfit = totalRevenue - totalPurchases - totalReturns;
  // const handleSeeMore = (product: Product) => { ... };
  console.log(sales);

  // Enhanced 3-dropdown filter system
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showPurchaseQuantityModal, setShowPurchaseQuantityModal] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salesItems, setSalesItems] = useState<
    Array<{
      product: Product;
      quantity: number;
      totalPrice: number;
    }>
  >([]);
  const [purchaseItems, setPurchaseItems] = useState<
    Array<{
      product: Product;
      quantity: number;
      totalCost: number;
    }>
  >([]);
  const [notification, setNotification] = useState<string>("");
  const [lastReceiptNumber, setLastReceiptNumber] = useState("");
  const [todaysSalesData, setTodaysSalesData] = useState<DailySales>({
    date: new Date().toISOString().split("T")[0],
    sales: [],
    totalAmount: 0,
    totalItems: 0,
  });
  const [completedSaleItems, setCompletedSaleItems] = useState<
    Array<{
      product: Product;
      quantity: number;
      totalPrice: number;
    }>
  >([]);
  const [completedCustomerDetails, setCompletedCustomerDetails] =
    useState<CustomerDetails | null>(null);
  const [salesRefreshCounter, setSalesRefreshCounter] = useState(0);

  // Pagination state for products
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update product types when category changes
  useEffect(() => {
    if (selectedCategory && products.length > 0) {
      // Extract unique product types from products in the selected category
      const categoryProducts = products.filter(
        (p) => p.category === selectedCategory
      );
      const types = [
        ...new Set(categoryProducts.map((p) => p.networkItem).filter(Boolean)),
      ] as string[];
      setProductTypes(types);
      setSelectedProductType("");
      setSelectedBrand("");
      setBrands([]);
    } else {
      setProductTypes([]);
      setSelectedProductType("");
      setSelectedBrand("");
      setBrands([]);
    }
  }, [selectedCategory, products]);

  // Update brands when product type changes
  useEffect(() => {
    if (selectedProductType && products.length > 0) {
      // Extract unique brands from products matching the selected product type
      const typeProducts = products.filter(
        (p) =>
          p.networkItem === selectedProductType ||
          p.name.toLowerCase().includes(selectedProductType.toLowerCase())
      );
      const brandList = [
        ...new Set(typeProducts.map((p) => p.brand).filter(Boolean)),
      ] as string[];
      setBrands(brandList);
      setSelectedBrand("");
    } else {
      setBrands([]);
      setSelectedBrand("");
    }
  }, [selectedProductType, products]);

  // Now check for seller access
  if (!user || user.role !== "seller") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      const [
        productsData,
        categoriesData,
        salesData,
        returnsData,
        todaysSales,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getSoldProducts(),
        // getSalesLogs(),
        // getPurchaseLogs(),
        getReturnLogs(),
        getTodaysSales(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSales(salesData);
      // setPurchases(purchasesData); // Not used in seller dashboard
      setReturns(returnsData);
      setTodaysSalesData(todaysSales);
    } catch (error) {
      console.error("Failed to load data:", error);
      showNotification("Failed to load data");
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleProductUpdate = async (updatedProduct: Product) => {
    try {
      // For sellers, we'll use a simplified update approach
      const success = await updateStock(
        updatedProduct.id,
        updatedProduct.stock
      );
      if (success) {
        await loadData();
        showNotification("Product updated successfully");
      } else {
        showNotification("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showNotification("Failed to update product");
    }
  };

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowProductEditModal(true);
  };

  const addToSale = (product: Product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const addToPurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseQuantityModal(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const totalPrice = quantity * selectedProduct.sellpricePerUnit;
    const saleItem = {
      product: selectedProduct,
      quantity,
      totalPrice,
    };

    setSalesItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === selectedProduct.id
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: item.totalPrice + totalPrice,
              }
            : item
        );
      } else {
        return [...prev, saleItem];
      }
    });

    showNotification(
      `Added ${quantity} ${selectedProduct.unit} of ${selectedProduct.name} to sale`
    );
    setSelectedProduct(null);
  };

  const handlePurchaseQuantityConfirm = (
    quantity: number,
    customPrice?: number
  ) => {
    if (!selectedProduct) return;

    const sellpricePerUnit = customPrice || selectedProduct.sellpricePerUnit;
    const totalCost = quantity * sellpricePerUnit;
    const purchaseItem = {
      product: selectedProduct,
      quantity,
      totalCost,
    };

    setPurchaseItems((prev) => {
      const existingItem = prev.find(
        (item) => item.product.id === selectedProduct.id
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalCost: item.totalCost + totalCost,
              }
            : item
        );
      } else {
        return [...prev, purchaseItem];
      }
    });

    showNotification(
      `Added ${quantity} ${selectedProduct.unit} of ${selectedProduct.name} to purchase`
    );
    setSelectedProduct(null);
  };

  const removeFromSale = (productId: string) => {
    setSalesItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const removeFromPurchase = (productId: string) => {
    setPurchaseItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const completeSale = async (
    customDateTime?: string,
    warrantyInfo?: { dateOfSale: string; warrantyEndDate: string },
    customerDetails?: CustomerDetails
  ) => {
    if (salesItems.length === 0) return;

    const receiptNumber = `RCP${Date.now()}`;
    setLastReceiptNumber(receiptNumber);

    const itemsToProcess = salesItems;

    try {
      for (const item of itemsToProcess) {
        // Update stock
        await updateStock(item.product.id, item.product.stock - item.quantity);

        // Create sale record with seller information
        const saleData = {
          productId: item.product.id,
          productName: item.product.name,
          customerId: user.id,
          customerEmail: user.email,
          quantity: item.quantity,
          sellpricePerUnit: item.product.sellpricePerUnit,
          totalPrice: item.totalPrice,
          unit: item.product.unit,
          currency: "BDT",
          dateOfSale:
            warrantyInfo?.dateOfSale || new Date().toISOString().split("T")[0],
          warrantyEndDate:
            warrantyInfo?.warrantyEndDate ||
            (() => {
              const saleDate = new Date(warrantyInfo?.dateOfSale || new Date());
              const endDate = new Date(saleDate);
              endDate.setFullYear(endDate.getFullYear() + 1);
              return endDate.toISOString().split("T")[0];
            })(),
          timestamp: customDateTime || new Date().toISOString(),
          commonId: item.product.commonId || "",
          uniqueId: item.product.uniqueId || "",
          sellerId: user.id,
          sellerName: user.name,
          sellerRole: user.role,
          customer: customerDetails
            ? {
                mobile: customerDetails.mobile,
                email: customerDetails.email,
                address: customerDetails.address,
              }
            : undefined,
        };

        // Save sale with warranty information
        const result = await fetch(
          "https://offline-inventory-api-with-fs.onrender.com/api/sales",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(saleData),
          }
        );

        if (!result.ok) {
          throw new Error("Failed to save sale with warranty");
        }
      }

      const completedSaleItems = [...itemsToProcess];

      setSalesItems([]);
      await loadData();
      setSalesRefreshCounter((prev) => prev + 1); // Trigger refresh for TodaysSalesDashboard
      setShowSalesModal(false);

      setCompletedSaleItems(completedSaleItems);
      setCompletedCustomerDetails(customerDetails || null);
      setShowReceiptModal(true);
      showNotification("Sale completed successfully!");
    } catch (error) {
      console.error("Error completing sale:", error);
      showNotification("Failed to complete sale. Please try again.");
    }
  };

  const completePurchase = () => {
    showNotification(
      "Purchase completion requires admin access. Please contact administrator."
    );
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "" || product.category === selectedCategory) &&
        (selectedProductType === "" ||
          product.name
            .toLowerCase()
            .includes(selectedProductType.toLowerCase()) ||
          (product.networkItem &&
            product.networkItem
              .toLowerCase()
              .includes(selectedProductType.toLowerCase()))) &&
        (selectedBrand === "" ||
          (product.brand &&
            product.brand.toLowerCase().includes(selectedBrand.toLowerCase())))
    )
    .sort((a, b) => {
      // Default order: Name A-Z when no sort is specified
      if (!sortBy || sortBy === "") {
        return a.name.localeCompare(b.name);
      }

      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.sellpricePerUnit - b.sellpricePerUnit;
        case "price-desc":
          return b.sellpricePerUnit - a.sellpricePerUnit;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        case "newest":
          return (
            new Date(b.addedDate || "").getTime() -
            new Date(a.addedDate || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.addedDate || "").getTime() -
            new Date(b.addedDate || "").getTime()
          );
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= 10);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "sales", label: "Sales", icon: ShoppingCart },
    { id: "sold-products", label: "Sold Products", icon: Package },
    { id: "purchases", label: "Purchases", icon: TrendingUp },
    { id: "returns", label: "Returns", icon: RefreshCw },
    { id: "warranty", label: "Warranty", icon: Shield },
    { id: "categories", label: "Categories", icon: Filter },
    { id: "brands", label: "Brands", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {notification && (
          <div className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 border border-green-400/30">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <User className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Seller Dashboard
                </h1>
                <p className="text-green-400">Welcome back, {user.name}</p>
                <p className="text-slate-400 text-sm">Role: {user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-2 mb-6 shadow-lg shadow-cyan-500/10">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Today's Sales Dashboard */}
            <TodaysSalesDashboard refreshTrigger={salesRefreshCounter} />

            {/* Inventory Overview */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
              <h2 className="text-xl font-bold text-white mb-4">
                Inventory Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Total Products</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {products.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Low Stock (≤ 10)</p>
                  <p className="text-red-400 text-2xl font-bold">
                    {lowStockProducts.length}
                  </p>
                </div>
              </div>
              {lowStockProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Low Stock Products
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="py-2 px-4 text-slate-400">Product</th>
                          <th className="py-2 px-4 text-slate-400">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.slice(0, 5).map((product, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-700/30"
                          >
                            <td className="py-2 px-4 text-white">
                              {product.name}
                            </td>
                            <td className="py-2 px-4 text-slate-300">
                              {product.stock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Product Inventory
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProductEditModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => setShowProductEditModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                >
                  <option value="">All Product Types</option>
                  {productTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                >
                  <option value="">Default Order</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                  <option value="stock-asc">Stock Low to High</option>
                  <option value="stock-desc">Stock High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Pagination Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-400" />
                <div className="text-blue-200">
                  <p className="font-medium">📄 Product Navigation</p>
                  <p className="text-sm text-blue-300">
                    By default, Page 1 shows 20 products. To see more, click{" "}
                    <strong>Next</strong> or select pages{" "}
                    <strong>2, 3, etc.</strong> to view the remaining products.
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)}{" "}
                    of {totalProducts} products
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400">Product</th>
                    <th className="py-3 px-4 text-slate-400">Category</th>
                    <th className="py-3 px-4 text-slate-400">Brand</th>
                    <th className="py-3 px-4 text-slate-400">Stock</th>
                    <th className="py-3 px-4 text-slate-400">Price</th>
                    <th className="py-3 px-4 text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-700/30 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">{product.name}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {product.brand}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 text-green-400 font-bold">
                        ৳{product.sellpricePerUnit}
                      </td>
                      <td className="py-3 px-4 text-slate-400 flex space-x-2">
                        <button
                          onClick={() => handleProductEdit(product)}
                          className="p-2 hover:bg-cyan-500/20 rounded-lg text-cyan-400"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            showNotification(
                              "Product deletion requires admin access. Please contact administrator."
                            )
                          }
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border transition-all duration-300 ${
                          currentPage === page
                            ? "bg-cyan-500/30 text-cyan-400 border-cyan-500/50"
                            : "bg-white/10 text-slate-400 border-white/20 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {paginatedProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Products Found
                </h3>
                <p className="text-slate-400">
                  {searchTerm ||
                  selectedCategory ||
                  selectedProductType ||
                  selectedBrand
                    ? "No products match your current filters. Try adjusting your search criteria."
                    : "No products available in the inventory."}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Sale</h2>
              <button
                onClick={() => setShowSalesModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Complete Sale</span>
              </button>
            </div>

            {salesItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Items in Cart
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Quantity</th>
                        <th className="py-2 px-4 text-slate-400">Price</th>
                        <th className="py-2 px-4 text-slate-400">Total</th>
                        <th className="py-2 px-4 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesItems.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-700/30"
                        >
                          <td className="py-2 px-4 text-white">
                            {item.product.name}
                          </td>
                          <td className="py-2 px-4 text-slate-300">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-4 text-slate-300">
                            ৳{item.product.sellpricePerUnit}
                          </td>
                          <td className="py-2 px-4 text-green-400 font-bold">
                            ৳{item.totalPrice}
                          </td>
                          <td className="py-2 px-4 text-slate-400 flex space-x-2">
                            <button
                              onClick={() => removeFromSale(item.product.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Add Items to Sale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.stock > 0)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-900" />
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            ৳{product.sellpricePerUnit}
                          </div>
                          <div className="text-slate-400 text-sm">
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>
                          {product.category} • {product.brand}
                        </span>
                        <button
                          onClick={() => addToSale(product)}
                          disabled={product.stock === 0}
                          className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Sale
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sold-products" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <h2 className="text-xl font-bold text-white mb-6">Sold Products</h2>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Sales Found
                </h3>
                <p className="text-slate-400">
                  No products have been sold yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="py-3 px-4 text-slate-400">Product</th>
                      <th className="py-3 px-4 text-slate-400">Quantity</th>
                      <th className="py-3 px-4 text-slate-400">Price</th>
                      <th className="py-3 px-4 text-slate-400">Total</th>
                      <th className="py-3 px-4 text-slate-400">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales
                      // Sort by timestamp: most recent sales first (precise time-based sorting)
                      .sort((a, b) => {
                        const dateA = new Date(a.timestamp);
                        const dateB = new Date(b.timestamp);
                        return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
                      })
                      .map((sale, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-700/30 hover:bg-white/5"
                        >
                          <td className="py-3 px-4 text-white">
                            {sale.productName}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {sale.quantitySold}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            ৳{sale.sellpricePerUnit}
                          </td>
                          <td className="py-3 px-4 text-green-400 font-bold">
                            ৳{sale.totalPrice}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {new Date(sale.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Purchase</h2>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Complete Purchase</span>
              </button>
            </div>

            {purchaseItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Items in Cart
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Quantity</th>
                        <th className="py-2 px-4 text-slate-400">Price</th>
                        <th className="py-2 px-4 text-slate-400">Total</th>
                        <th className="py-2 px-4 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-700/30"
                        >
                          <td className="py-2 px-4 text-white">
                            {item.product.name}
                          </td>
                          <td className="py-2 px-4 text-slate-300">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-4 text-slate-300">
                            ৳{item.product.sellpricePerUnit}
                          </td>
                          <td className="py-2 px-4 text-green-400 font-bold">
                            ৳{item.totalCost}
                          </td>
                          <td className="py-2 px-4 text-slate-400 flex space-x-2">
                            <button
                              onClick={() =>
                                removeFromPurchase(item.product.id)
                              }
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Add Items to Purchase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.stock > 0)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-slate-900" />
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            ৳{product.sellpricePerUnit}
                          </div>
                          <div className="text-slate-400 text-sm">
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span>
                          {product.category} • {product.brand}
                        </span>
                        <button
                          onClick={() => addToPurchase(product)}
                          disabled={product.stock === 0}
                          className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Purchase
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Return</h2>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Complete Return</span>
              </button>
            </div>

            {returns.map((returnRecord, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg shadow-cyan-500/10"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  Return #{returnRecord.productID.substring(0, 8)}
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  Date: {new Date(returnRecord.timestamp).toLocaleDateString()}
                </p>
                <p className="text-slate-400 text-sm mb-2">
                  Product: {returnRecord.productName}
                </p>
                <p className="text-slate-400 text-sm mb-2">
                  Reason: {returnRecord.reason || "N/A"}
                </p>
                <p className="text-slate-400 text-sm mb-2">
                  Total Refund: ৳{returnRecord.totalRefund.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() =>
                      showNotification(
                        "Return processing requires admin access. Please contact administrator."
                      )
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Process Return</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "warranty" && <WarrantyManagement user={user} />}

        {activeTab === "categories" && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Category Management
              </h2>
              <button
                onClick={() => setShowProductEditModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400">Category</th>
                    <th className="py-3 px-4 text-slate-400">Description</th>
                    <th className="py-3 px-4 text-slate-400">Created Date</th>
                    <th className="py-3 px-4 text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-700/30 hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">{category.name}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {category.description}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(category.createdDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 flex space-x-2">
                        <button
                          onClick={() =>
                            showNotification(
                              "Category deletion requires admin access. Please contact administrator."
                            )
                          }
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "brands" && <BrandManagement products={products} />}

        {/* Sales Modal */}
        {showSalesModal && (
          <SalesModal
            isOpen={showSalesModal}
            onClose={() => setShowSalesModal(false)}
            salesItems={salesItems}
            onRemoveItem={removeFromSale}
            onCompleteSale={completeSale}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <ReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            salesItems={completedSaleItems}
            receiptNumber={lastReceiptNumber}
            cashierName={user.name}
            customerDetails={completedCustomerDetails || undefined}
          />
        )}

        {/* Product Edit Modal */}
        {showProductEditModal && (
          <ProductEditModal
            isOpen={showProductEditModal}
            onClose={() => setShowProductEditModal(false)}
            product={selectedProduct}
            onSave={handleProductUpdate}
          />
        )}

        {/* Product Detail Modal */}
        {showProductDetailModal && selectedProduct && (
          <ProductDetailModal
            isOpen={showProductDetailModal}
            onClose={() => setShowProductDetailModal(false)}
            product={selectedProduct}
          />
        )}

        {/* Quantity Selection Modal */}
        {showQuantityModal && selectedProduct && (
          <QuantityModal
            isOpen={showQuantityModal}
            onClose={() => setShowQuantityModal(false)}
            product={selectedProduct}
            onConfirm={handleQuantityConfirm}
          />
        )}

        {/* Purchase Quantity Selection Modal */}
        {showPurchaseQuantityModal && selectedProduct && (
          <PurchaseQuantityModal
            isOpen={showPurchaseQuantityModal}
            onClose={() => setShowPurchaseQuantityModal(false)}
            product={selectedProduct}
            onConfirm={handlePurchaseQuantityConfirm}
          />
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            purchaseItems={purchaseItems}
            onRemoveItem={removeFromPurchase}
            onCompletePurchase={completePurchase}
          />
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <ReturnModal
            isOpen={showReturnModal}
            onClose={() => setShowReturnModal(false)}
            onProcessReturn={() =>
              showNotification(
                "Return processing requires admin access. Please contact administrator."
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
