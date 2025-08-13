import React, { useState, useEffect } from "react";
import {
  Product,
  SaleRecord,
  PurchaseRecord,
  ReturnRecord,
  User as UserType,
  SaleItem,
  AdminPurchaseItem,
  Category,
} from "../types";
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  deleteCategory,
  updateStock,
  logPurchase,
  logReturn,
  getSalesLogs,
  getPurchaseLogs,
  getReturnLogs,
  getSoldProducts,
  getBrands,
} from "../utils/storage";
import TodaysSalesDashboard from "./TodaysSalesDashboard";
import Profit from "./Profit";
import {
  Monitor,
  LogOut,
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  Shield,
  Filter,
  Building2,
  ShoppingBag,
  Users,
  Trash2,
  DollarSign,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";

// Component imports
import ProductCard from "./ProductCard";
import ProductFilterBar from "./ProductFilterBar";
import SalesModal from "./SalesModal";
import PurchaseModal from "./PurchaseModal";
import ReturnModal from "./ReturnModal";
import ReceiptModal from "./ReceiptModal";
import ProductDetailModal from "./ProductDetailModal";
import ProductEditModal from "./ProductEditModal";
import DataClearModal from "./DataClearModal";
import UserManagementModal from "./UserManagementModal";
import QuantityModal from "./QuantityModal";
import PurchaseQuantityModal from "./PurchaseQuantityModal";
import WarrantyManagement from "./WarrantyManagement";
import BrandManagement from "./BrandManagement";
import SaleDetailModal from "./SaleDetailModal";
import AddItem from "./additem";
import Return_approved from "./Return_approved";
import PurchaseHistory from "./PurchaseHistory";

interface AdminDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showDataClearModal, setShowDataClearModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showPurchaseQuantityModal, setShowPurchaseQuantityModal] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [salesItems, setSalesItems] = useState<SaleItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<AdminPurchaseItem[]>([]);
  const [completedSaleItems, setCompletedSaleItems] = useState<SaleItem[]>([]);
  const [notification, setNotification] = useState<string>("");
  const [lastReceiptNumber, setLastReceiptNumber] = useState("");
  const [lastCustomerDetails, setLastCustomerDetails] = useState<{
    name: string;
    mobile: string;
    email: string;
    address: string;
  } | null>(null);
  const [soldProducts, setSoldProducts] = useState<
    Array<{
      saleId: string;
      productId: string;
      productName: string;
      quantity: number;
      sellpricePerUnit: number;
      totalPrice: number;
      unit: string;
      dateOfSale: string;
      timestamp?: string;
      customerName?: string;
      customerEmail?: string;
      customerMobile?: string;
      customerAddress?: string;
      soldByEmail?: string;
      warrantyEndDate?: string;
    }>
  >([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
    }>
  >([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedSaleItem, setSelectedSaleItem] = useState<{
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    sellpricePerUnit: number;
    totalPrice: number;
    unit: string;
    dateOfSale: string;
    timestamp?: string;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
    soldByEmail?: string;
    warrantyEndDate?: string;
    customerAddress?: string;
  } | null>(null);
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [salesRefreshCounter, setSalesRefreshCounter] = useState(0);
  const [showPurchaseHistoryModal, setShowPurchaseHistoryModal] =
    useState(false);

  useEffect(() => {
    loadData();
    loadBrands();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        productsData,
        categoriesData,
        salesData,
        purchasesData,
        returnsData,
        soldProductsData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getSalesLogs(),
        getPurchaseLogs(),
        getReturnLogs(),
        getSoldProducts(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setSales(salesData);
      setPurchases(purchasesData);
      setReturns(returnsData);
      setSoldProducts(soldProductsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      showNotification("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const brandsData = await getBrands();
      // Deduplicate by name
      const uniqueBrands = Array.from(
        new Set(brandsData.map((b) => b.name))
      ).map((name) => brandsData.find((b) => b.name === name));
      setBrands(uniqueBrands.filter(Boolean));
    } catch {
      setBrands([]);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleProductUpdate = async (updatedProduct: Product) => {
    setLoading(true);
    try {
      const success = await updateProduct(updatedProduct);
      if (success) {
        await loadData();
        showNotification("Product updated successfully");
      } else {
        showNotification("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showNotification("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdd = async (newProduct: Product) => {
    setLoading(true);
    try {
      const success = await addProduct(newProduct);
      if (success) {
        await loadData();
        showNotification("Product added successfully");
        setShowProductEditModal(false);
        setIsEditMode(false);
        setSelectedProduct(null);
      } else {
        showNotification("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      showNotification("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        const success = await deleteProduct(productId);
        if (success) {
          await loadData();
          showNotification("Product deleted successfully");
        } else {
          showNotification("Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        showNotification("Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setShowProductEditModal(true);
  };

  const addToSale = (product: Product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const addToPurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseQuantityModal(true);
    // Mouse square mode will be available in the modal for comprehensive data viewing
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const totalPrice = quantity * selectedProduct.sellpricePerUnit;
    const saleItem: SaleItem = {
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
      `🛒 Added ${quantity} ${selectedProduct.unit} of ${
        selectedProduct.name
      } to sale | Total: ৳${totalPrice.toFixed(2)}`
    );
    setSelectedProduct(null);
  };

  const handlePurchaseQuantityConfirm = (
    quantity: number,
    customBuyPrice?: number,
    customSellPrice?: number
  ) => {
    if (!selectedProduct) return;

    const buypricePerUnit = customBuyPrice || selectedProduct.buypricePerUnit;
    const sellpricePerUnit =
      customSellPrice || selectedProduct.sellpricePerUnit;
    const totalCost = quantity * buypricePerUnit;

    const purchaseItem: AdminPurchaseItem = {
      product: {
        ...selectedProduct,
        buypricePerUnit,
        sellpricePerUnit,
      },
      quantity,
      totalCost,
      buypricePerUnit,
      sellpricePerUnit,
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
      `📦 Added ${quantity} ${selectedProduct.unit} of ${
        selectedProduct.name
      } to purchase cart | Cost: ৳${totalCost.toFixed(
        2
      )} | Buy: ৳${buypricePerUnit} | Sell: ৳${sellpricePerUnit}`
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
    customerDetails?: {
      name: string;
      mobile: string;
      email: string;
      address: string;
    }
  ) => {
    if (salesItems.length === 0) return;

    const receiptNumber = `RCP${Date.now()}`;
    setLastReceiptNumber(receiptNumber);

    try {
      const itemsForReceipt = [...salesItems];

      // Process each sale item with warranty information
      for (const item of salesItems) {
        // Update stock
        await updateStock(item.product.id, item.product.stock - item.quantity);

        // Create sale record with warranty info
        const saleData = {
          productId: item.product.id,
          productName: item.product.name,
          customerId: `customer-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`,
          customerEmail: customerDetails?.email || "",
          customerName: customerDetails?.name || "",
          customerMobile: customerDetails?.mobile || "",
          customerAddress: customerDetails?.address || "",
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
              endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year warranty
              return endDate.toISOString().split("T")[0];
            })(),
          timestamp: customDateTime || new Date().toISOString(),
          soldBy: user.id,
          soldByEmail: user.email,
        };

        // Save sale with warranty information using the new API
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

      setCompletedSaleItems(itemsForReceipt);
      setSalesItems([]);
      setLastCustomerDetails(customerDetails || null);
      await loadData();
      setSalesRefreshCounter((prev) => prev + 1); // Trigger refresh for TodaysSalesDashboard
      setShowSalesModal(false);
      setShowReceiptModal(true);
      showNotification(
        "Sale completed successfully with warranty information!"
      );
    } catch (error) {
      console.error("Error completing sale:", error);
      showNotification("Failed to complete sale. Please try again.");
    }
  };

  const completePurchase = async (customDateTime?: string) => {
    if (purchaseItems.length === 0) return;
    setLoading(true);
    try {
      console.log("🛒 Starting purchase completion process...");

      for (const item of purchaseItems) {
        console.log(`📦 Processing: ${item.product.name}`);
        console.log(`📊 Current stock: ${item.product.stock}`);
        console.log(`➕ Adding quantity: ${item.quantity}`);
        console.log(
          `🎯 New stock should be: ${item.product.stock + item.quantity}`
        );

        // Update stock quantity FIRST
        const stockUpdateSuccess = await updateStock(
          item.product.id,
          item.product.stock + item.quantity
        );
        if (!stockUpdateSuccess) {
          throw new Error(`Failed to update stock for ${item.product.name}`);
        }
        console.log(`✅ Stock updated successfully for ${item.product.name}`);

        // Update product prices if they were customized
        if (
          item.buypricePerUnit !== undefined ||
          item.sellpricePerUnit !== undefined
        ) {
          const updatedProduct = {
            ...item.product,
            stock: item.product.stock + item.quantity, // Ensure stock is also updated in product object
            buypricePerUnit:
              item.buypricePerUnit || item.product.buypricePerUnit,
            sellpricePerUnit:
              item.sellpricePerUnit || item.product.sellpricePerUnit,
          };
          const productUpdateSuccess = await updateProduct(updatedProduct);
          if (!productUpdateSuccess) {
            throw new Error(
              `Failed to update product prices for ${item.product.name}`
            );
          }
          console.log(`💰 Product prices updated for ${item.product.name}`);
        }

        const purchase: PurchaseRecord = {
          productID: item.product.id,
          productName: item.product.name,
          quantityAdded: item.quantity,
          buypricePerUnit: item.buypricePerUnit || item.product.buypricePerUnit,
          sellpricePerUnit:
            item.sellpricePerUnit || item.product.sellpricePerUnit,
          totalCost: item.totalCost,
          timestamp: customDateTime || new Date().toISOString(),
          adminId: user.id,
          supplier: item.product.supplier,
          // Enhanced product details for better tracking and search
          brand: item.product.brand,
          category: item.product.category,
          image: item.product.image,
          commonId: item.product.commonId,
          uniqueId: item.product.uniqueId,
        };

        const purchaseLogSuccess = await logPurchase(purchase);
        if (!purchaseLogSuccess) {
          throw new Error(`Failed to log purchase for ${item.product.name}`);
        }
        console.log(`📝 Purchase logged for ${item.product.name}`);
      }

      console.log("🔄 Refreshing data...");

      // Create detailed summary notification before clearing items
      const totalItems = purchaseItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalCost = purchaseItems.reduce(
        (sum, item) => sum + item.totalCost,
        0
      );
      const uniqueCategories = Array.from(
        new Set(
          purchaseItems.map((item) => item.product.category).filter(Boolean)
        )
      );
      const uniqueBrands = Array.from(
        new Set(purchaseItems.map((item) => item.product.brand).filter(Boolean))
      );

      setPurchaseItems([]);
      await loadData(); // Refresh all data from server

      // Verify stock update by checking the first purchased item
      if (purchaseItems.length > 0) {
        const refreshedProducts = await getProducts();
        const updatedProduct = refreshedProducts.find(
          (p) => p.id === purchaseItems[0].product.id
        );
        if (updatedProduct) {
          console.log(
            `🔍 Verification - ${updatedProduct.name} stock is now: ${updatedProduct.stock}`
          );
        }
      }

      setShowPurchaseModal(false);

      // Enhanced notification with category and brand information
      const categoryInfo =
        uniqueCategories.length > 0
          ? ` | Categories: ${uniqueCategories.join(", ")}`
          : "";
      const brandInfo =
        uniqueBrands.length > 0 ? ` | Brands: ${uniqueBrands.join(", ")}` : "";
      showNotification(
        `✅ Purchase completed! Added ${totalItems} items worth ₹${totalCost.toFixed(
          2
        )} to inventory${categoryInfo}${brandInfo}. All product details including photos, categories, and brands saved to database.`
      );
      console.log("✅ Purchase completion process finished successfully");
    } catch (error) {
      console.error("❌ Error completing purchase:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      showNotification(`❌ Failed to complete purchase: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnProcess = async (
    productId: string,
    quantity: number,
    reason: string,
    customerName?: string,
    customerMobile?: string,
    customerEmail?: string,
    customerAddress?: string
  ) => {
    setLoading(true);
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");
      await updateStock(productId, product.stock + quantity);
      const returnRecord: ReturnRecord = {
        productID: productId,
        productName: product.name,
        quantityReturned: quantity,
        sellpricePerUnit: product.sellpricePerUnit,
        totalRefund: quantity * product.sellpricePerUnit,
        unit: product.unit,
        timestamp: new Date().toISOString(),
        adminId: user.id,
        reason,
        // Store customer details if available
        customerName: customerName,
        customerMobile: customerMobile,
        customerEmail: customerEmail,
        customerAddress: customerAddress,
      };
      await logReturn(returnRecord);
      await loadData();
      setShowReturnModal(false);
      showNotification("Return processed successfully!");
    } catch (error) {
      console.error("Error processing return:", error);
      showNotification("Failed to process return. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdd = async () => {
    if (!newCategoryName.trim()) {
      showNotification("Please enter a category name");
      return;
    }
    setLoading(true);
    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        createdDate: new Date().toISOString().split("T")[0],
      };

      const success = await addCategory(newCategory);
      if (success) {
        await loadData();
        setNewCategoryName("");
        setNewCategoryDescription("");
        showNotification("Category added successfully");
      } else {
        showNotification("Category already exists");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true);
      try {
        const success = await deleteCategory(categoryId);
        if (success) {
          await loadData();
          showNotification("Category deleted successfully");
        } else {
          showNotification("Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        showNotification("Failed to delete category");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setSelectedModel("");
    setSortBy("");
  };

  const filteredProducts = products
    .filter(
      (product) =>
        (!selectedCategory || product.category === selectedCategory) &&
        (!selectedSubcategory ||
          product.subcategory === selectedSubcategory ||
          product.networkItem === selectedSubcategory) &&
        (!selectedBrand || product.brand === selectedBrand) &&
        (!selectedModel || product.model === selectedModel) &&
        (searchTerm.trim() === "" ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + purchase.totalCost,
    0
  );
  const totalReturns = returns.reduce(
    (sum, returnRecord) => sum + returnRecord.totalRefund,
    0
  );
  const netProfit = totalRevenue - totalPurchases - totalReturns;
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  const handleSeeMore = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

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
    { id: "basket", label: "Basket", icon: ShoppingBag },
    ...(user.role === "admin"
      ? [
          { id: "users", label: "Users", icon: Users },
          { id: "data-clear", label: "Data Clear", icon: Trash2 },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {notification && (
          <div className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 border border-green-400/30">
            {notification}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-12 w-12 text-cyan-400 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span className="text-white text-lg font-semibold">
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Monitor className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : "Seller Dashboard"}
                </h1>
                <p className="text-cyan-400">Welcome back, {user.name}</p>
                <p className="text-slate-400 text-sm">
                  FRIENDS IT ZONE Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-cyan-400 font-bold text-lg">
                  {user.role.toUpperCase()}
                </p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-cyan-500/20 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-cyan-500/25"
                  : "text-white hover:bg-white/10 hover:text-cyan-400"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-lg shadow-green-500/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">
                      ৳{totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Purchases</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ৳{totalPurchases.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {products.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-lg shadow-orange-500/10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Net Profit</p>
                    <p
                      className={`text-2xl font-bold ${
                        netProfit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ৳{netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Sales Dashboard */}
            <TodaysSalesDashboard refreshTrigger={salesRefreshCounter} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowSalesModal(true)}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/20"
              >
                <ShoppingCart className="w-8 h-8 text-green-400 mb-3" />
                <h4 className="text-white font-bold">New Sale</h4>
                <p className="text-slate-400 text-sm">Process customer sale</p>
              </button>

              <button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/20"
              >
                <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="text-white font-bold">New Purchase</h4>
                <p className="text-slate-400 text-sm">
                  Add stock inventory • Enhanced data view
                </p>
              </button>

              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/20"
              >
                <RefreshCw className="w-8 h-8 text-orange-400 mb-3" />
                <h4 className="text-white font-bold">Process Return</h4>
                <p className="text-slate-400 text-sm">Handle product returns</p>
              </button>

              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsEditMode(false);
                  setShowProductEditModal(true);
                }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20"
              >
                <Plus className="w-8 h-8 text-purple-400 mb-3" />
                <h4 className="text-white font-bold">Add Product</h4>
                <p className="text-slate-400 text-sm">Create new product</p>
              </button>
            </div>

            {/* Debug Actions (Admin Only) */}

            {/* Profit Section */}
            <Profit
              soldProducts={soldProducts}
              products={products}
              purchases={purchases}
            />
            {/* End Profit Section */}

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6 shadow-lg shadow-red-500/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Low Stock Alert ({lowStockProducts.length} items)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className="bg-slate-800/30 rounded-xl p-4"
                    >
                      <h4 className="text-white font-medium">{product.name}</h4>
                      <p className="text-red-400 text-sm">
                        Only {product.stock} {product.unit} left
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="mb-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h2 className="text-3xl font-extrabold text-white">
                Products Management
              </h2>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsEditMode(false);
                  setShowProductEditModal(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-slate-900 rounded-xl font-bold shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter/Search Bar */}
            <div className="mb-8">
              <ProductFilterBar
                products={products}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                // selectedSubcategory={selectedSubcategory}
                // setSelectedSubcategory={setSelectedSubcategory}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToSale={addToSale}
                  onAddToPurchase={addToPurchase}
                  onSeeMore={handleSeeMore}
                  onEdit={handleProductEdit}
                  onDelete={(product) => handleProductDelete(product.id)}
                  showSellButton={true}
                  showBuyButton={true}
                  showSeeMore={true}
                  showEditButton={true}
                  showDeleteButton={true}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="bg-slate-800/60 border border-cyan-500/20 rounded-2xl p-12 text-center shadow-lg mt-8">
                <Package className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-cyan-300 text-lg">No products found</p>
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-white">
                Sales Management
              </h2>
              <div className="flex space-x-4">
                {salesItems.length > 0 && (
                  <button
                    onClick={() => setShowSalesModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Complete Sale ({salesItems.length} items)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Pending Sales Items */}
            {salesItems.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 shadow-lg shadow-green-500/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-green-400" />
                    Pending Sales ({salesItems.length} items)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Items</p>
                      <p className="text-2xl font-bold text-green-400">
                        {salesItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Products</p>
                      <p className="text-2xl font-bold text-green-400">
                        {salesItems.length}
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <p className="text-slate-400 text-sm">Total Amount</p>
                      <p className="text-2xl font-bold text-green-400">
                        ৳
                        {salesItems
                          .reduce((sum, item) => sum + item.totalPrice, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sales Items List */}
                <div className="space-y-4">
                  {salesItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white/10 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">
                              {item.product.name}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              ID: {item.product.id}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                              <div>
                                <span className="text-slate-400">
                                  Quantity:
                                </span>
                                <p className="text-white">
                                  {item.quantity} {item.product.unit}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Price/Unit:
                                </span>
                                <p className="text-white">
                                  ৳{item.product.sellpricePerUnit}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">Total:</span>
                                <p className="text-green-400 font-bold">
                                  ৳{item.totalPrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromSale(item.product.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Complete Sale Button */}
                <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 shadow-lg shadow-green-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        Ready to Complete Sale
                      </h4>
                      <p className="text-slate-400">
                        Total: ৳
                        {salesItems
                          .reduce((sum, item) => sum + item.totalPrice, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSalesModal(true)}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Complete Sale</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
                <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">
                  No Items in Sale
                </h3>
                <p className="text-slate-400 text-lg mb-6">
                  Add products to sale from the Products tab
                </p>
                <button
                  onClick={() => setActiveTab("products")}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 mx-auto"
                >
                  <Package className="w-5 h-5" />
                  <span>Browse Products</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sold Products Tab */}
        {activeTab === "sold-products" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Sold Products
            </h2>

            {/* Customer Search Box */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-6 shadow-lg shadow-cyan-500/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-cyan-400" />
                🔍 Search Customer
              </h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by customer mobile number or email address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-slate-400">
                  Searching for: "{searchTerm}" in customer mobile numbers and
                  email addresses
                </p>
              )}
            </div>

            {(() => {
              // Filter sold products based on search term
              const filteredSoldProducts = soldProducts
                .filter((item) => {
                  if (!searchTerm.trim()) return true;
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    item.customerMobile?.toLowerCase().includes(searchLower) ||
                    item.customerEmail?.toLowerCase().includes(searchLower) ||
                    item.customerName?.toLowerCase().includes(searchLower) ||
                    item.productName?.toLowerCase().includes(searchLower)
                  );
                })
                // Sort by timestamp/date: newest first (today's recent sales at the top)
                .sort((a, b) => {
                  // Use timestamp for precise time sorting, fall back to dateOfSale if timestamp not available
                  const timeA = a.timestamp
                    ? new Date(a.timestamp)
                    : new Date(a.dateOfSale);
                  const timeB = b.timestamp
                    ? new Date(b.timestamp)
                    : new Date(b.dateOfSale);
                  return timeB.getTime() - timeA.getTime(); // Descending order (most recent first)
                });

              if (filteredSoldProducts.length === 0) {
                return (
                  <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {searchTerm ? "No Results Found" : "No Items Sold"}
                    </h3>
                    <p className="text-slate-400">
                      {searchTerm
                        ? `No customers found matching "${searchTerm}". Try a different search term.`
                        : "No products have been sold yet. Sales will appear here once items are sold."}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setActiveTab("sales")}
                        className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Start Selling</span>
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                      {searchTerm
                        ? `Found ${filteredSoldProducts.length} results for "${searchTerm}"`
                        : `Total Sold Products: ${filteredSoldProducts.length}`}
                    </h3>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-400">
                        ৳
                        {filteredSoldProducts
                          .reduce(
                            (sum, item) =>
                              sum +
                              (typeof item.totalPrice === "number"
                                ? item.totalPrice
                                : 0),
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* Table Design */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1800px]">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-48 min-w-[200px]">
                            Product
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-32 min-w-[120px]">
                            ID
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-28 min-w-[100px]">
                            Quantity
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-24 min-w-[90px]">
                            Price
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-28 min-w-[100px]">
                            Total
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-32 min-w-[120px]">
                            Sale Date & Time
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-40 min-w-[150px]">
                            Customer Name
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-36 min-w-[140px]">
                            Warranty Status
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-36 min-w-[140px]">
                            Customer Mobile
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-48 min-w-[180px]">
                            Customer Email
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-48 min-w-[180px]">
                            Customer Address
                          </th>
                          <th className="text-left text-slate-400 font-medium py-3 px-6 w-44 min-w-[160px]">
                            Sold By
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSoldProducts.map((item) => (
                          <tr
                            key={item.saleId}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedSaleItem(item);
                              setShowSaleDetailModal(true);
                            }}
                          >
                            <td className="py-4 px-6 w-48 min-w-[200px]">
                              <div
                                className="font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis"
                                title={item.productName}
                              >
                                {item.productName}
                              </div>
                            </td>
                            <td className="py-4 px-6 w-32 min-w-[120px]">
                              <span className="text-cyan-400 font-mono text-sm whitespace-nowrap">
                                {item.productId}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-28 min-w-[100px]">
                              <span className="text-white whitespace-nowrap">
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-24 min-w-[90px]">
                              <span className="text-slate-300 whitespace-nowrap">
                                ৳{item.sellpricePerUnit.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-28 min-w-[100px]">
                              <span className="text-green-400 font-semibold whitespace-nowrap">
                                ৳{item.totalPrice.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-32 min-w-[120px]">
                              <span className="text-slate-300 whitespace-nowrap">
                                {item.timestamp
                                  ? new Date(item.timestamp).toLocaleString()
                                  : new Date(
                                      item.dateOfSale
                                    ).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-40 min-w-[150px]">
                              <span
                                className="text-blue-400 whitespace-nowrap overflow-hidden text-ellipsis block"
                                title={item.customerName || "N/A"}
                              >
                                {item.customerName || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-36 min-w-[140px]">
                              {item.warrantyEndDate ? (
                                <div
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                    new Date(item.warrantyEndDate) > new Date()
                                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                      : "bg-red-500/20 text-red-400 border border-red-500/50"
                                  }`}
                                >
                                  {new Date(item.warrantyEndDate) >
                                  new Date() ? (
                                    <>
                                      <Shield className="w-3 h-3 mr-1" />
                                      Available
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Expired
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">
                                  No warranty
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 w-36 min-w-[140px]">
                              <span
                                className="text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis block"
                                title={item.customerMobile || "N/A"}
                              >
                                {item.customerMobile || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-48 min-w-[180px]">
                              <span
                                className="text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis block"
                                title={item.customerEmail || "N/A"}
                              >
                                {item.customerEmail || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-48 min-w-[180px]">
                              <span
                                className="text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis block"
                                title={item.customerAddress || "N/A"}
                              >
                                {item.customerAddress || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6 w-44 min-w-[160px]">
                              <span
                                className="text-orange-400 whitespace-nowrap overflow-hidden text-ellipsis block"
                                title={item.soldByEmail || "N/A"}
                              >
                                {item.soldByEmail || "N/A"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Statistics */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Total Items</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredSoldProducts.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-400">
                        ৳
                        {filteredSoldProducts
                          .reduce(
                            (sum, item) =>
                              sum +
                              (typeof item.totalPrice === "number"
                                ? item.totalPrice
                                : 0),
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Unique Products</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {
                          new Set(
                            filteredSoldProducts.map((item) => item.productId)
                          ).size
                        }
                      </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-sm">Avg. Sale Value</p>
                      <p className="text-2xl font-bold text-purple-400">
                        ৳
                        {filteredSoldProducts.length > 0
                          ? (
                              filteredSoldProducts.reduce(
                                (sum, item) =>
                                  sum +
                                  (typeof item.totalPrice === "number"
                                    ? item.totalPrice
                                    : 0),
                                0
                              ) / filteredSoldProducts.length
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-white">
                Purchase Management
              </h2>
              <div className="flex items-center space-x-4">
                {/* Purchase History Button */}
                <button
                  onClick={() => setShowPurchaseHistoryModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Purchase History</span>
                </button>

                {purchaseItems.length > 0 && (
                  <>
                    <button
                      onClick={() => setPurchaseItems([])}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/25"
                    >
                      <X className="w-5 h-5" />
                      <span>Clear Cart</span>
                    </button>
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        Confirm Purchase ({purchaseItems.length} items)
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Purchase Cart Items */}
            {purchaseItems.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 shadow-lg shadow-blue-500/10">
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center">
                    <ShoppingBag className="w-6 h-6 text-blue-400 mr-3" />
                    Purchase Cart
                  </h3>

                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {purchaseItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-lg truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              Brand: {item.product.brand}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Category: {item.product.category}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Current Stock: {item.product.stock}{" "}
                              {item.product.unit}
                            </p>
                          </div>

                          {/* Quantity and Price */}
                          <div className="text-right">
                            <p className="text-blue-400 font-bold text-lg">
                              {item.quantity} {item.product.unit}
                            </p>
                            <p className="text-slate-300 text-sm">
                              Buy: ৳
                              {item.buypricePerUnit ||
                                item.product.buypricePerUnit}{" "}
                              each
                            </p>
                            <p className="text-slate-400 text-xs">
                              Sell: ৳
                              {item.sellpricePerUnit ||
                                item.product.sellpricePerUnit}{" "}
                              each
                            </p>
                            <p className="text-green-400 font-bold">
                              Total Cost: ৳{item.totalCost}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              setPurchaseItems((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 hover:border-red-500/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                            title="Remove from cart"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-slate-400">Total Items:</span>
                      <span className="text-white font-bold">
                        {purchaseItems.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xl">
                      <span className="text-slate-400">Total Cost:</span>
                      <span className="text-green-400 font-bold">
                        $
                        {purchaseItems
                          .reduce((sum, item) => sum + item.totalCost, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
                <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">
                  Purchase Cart is Empty
                </h3>
                <p className="text-slate-400 text-lg mb-6">
                  Add products to purchase from the Products tab using "Buy
                  Stock" button
                </p>
                <button
                  onClick={() => setActiveTab("products")}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 mx-auto"
                >
                  <Package className="w-5 h-5" />
                  <span>Browse Products</span>
                </button>
              </div>
            )}
          </div>
        )}

        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          purchaseItems={purchaseItems}
          onRemoveItem={removeFromPurchase}
          onCompletePurchase={completePurchase}
        />

        <SalesModal
          isOpen={showSalesModal}
          onClose={() => setShowSalesModal(false)}
          salesItems={salesItems}
          onRemoveItem={removeFromSale}
          onCompleteSale={completeSale}
        />

        <ReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onProcessReturn={handleReturnProcess}
        />

        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          salesItems={completedSaleItems}
          receiptNumber={lastReceiptNumber}
          cashierName={user.name}
          customerDetails={
            lastCustomerDetails
              ? {
                  name: lastCustomerDetails.name,
                  mobile: lastCustomerDetails.mobile,
                  email: lastCustomerDetails.email,
                  address: lastCustomerDetails.address,
                }
              : undefined
          }
        />

        <ProductDetailModal
          isOpen={showProductDetailModal}
          onClose={() => setShowProductDetailModal(false)}
          product={selectedProduct}
          onAddToSale={addToSale}
          showSellButton={true}
        />

        <ProductEditModal
          isOpen={showProductEditModal}
          onClose={() => {
            setShowProductEditModal(false);
            setIsEditMode(false);
            setSelectedProduct(null);
          }}
          product={isEditMode ? selectedProduct : null}
          onSave={isEditMode ? handleProductUpdate : handleProductAdd}
        />

        {activeTab === "data-clear" && user.role === "admin" && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 mb-6 text-center max-w-xl">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Danger Zone: Data Clear
              </h2>
              <p className="text-white mb-4">
                This will <strong>permanently delete</strong> all product,
                sales, brand, basket, revenue, purchase, inventory, and profit
                data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDataClearModal(true)}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/25"
              >
                <Trash2 className="w-6 h-6" />
                <span>Clear All Data</span>
              </button>
            </div>
            <DataClearModal
              isOpen={showDataClearModal}
              onClose={() => setShowDataClearModal(false)}
              adminEmail={user.email}
            />
          </div>
        )}

        <UserManagementModal
          isOpen={showUserManagementModal}
          onClose={() => setShowUserManagementModal(false)}
          currentUser={user}
        />

        <QuantityModal
          isOpen={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          product={selectedProduct}
          onConfirm={handleQuantityConfirm}
        />

        <PurchaseQuantityModal
          isOpen={showPurchaseQuantityModal}
          onClose={() => setShowPurchaseQuantityModal(false)}
          product={selectedProduct}
          onConfirm={handlePurchaseQuantityConfirm}
        />

        {activeTab === "warranty" && <WarrantyManagement user={user} />}

        {activeTab === "returns" && <Return_approved />}

        {activeTab === "categories" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Category Management
            </h2>
            <form
              className="flex flex-col md:flex-row items-center gap-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleCategoryAdd();
              }}
            >
              <input
                type="text"
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              >
                <option value="" className="bg-slate-800">
                  Select Brand (optional)
                </option>
                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.name}
                    className="bg-slate-800"
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-semibold">
                      {category.name}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {category.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCategoryDelete(category.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "brands" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Brand Management
            </h2>
            <BrandManagement user={user} onBrandsChange={loadBrands} />
          </div>
        )}

        {activeTab === "basket" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Basket (Admin Cart)
            </h2>
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-12 shadow-lg shadow-cyan-500/10">
              {/* AddItem component for category input/output */}
              <div className="mb-8">
                <p className="text-slate-300 text-lg mb-4">
                  Add or select a category for admin actions below:
                </p>
                <div className="max-w-lg mx-auto">
                  {/* Import AddItem at the top of this file */}
                  <AddItem />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && user.role === "admin" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              User Management
            </h2>
            <button
              onClick={() => setShowUserManagementModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 mb-6"
            >
              <Users className="w-5 h-5" />
              <span>Add or Edit Users</span>
            </button>
            {/* Optionally, you can list users here if you want a table view */}
            <UserManagementModal
              isOpen={showUserManagementModal}
              onClose={() => setShowUserManagementModal(false)}
              currentUser={user}
            />
          </div>
        )}

        {/* Categories Management */}

        {/* Sale Detail Modal */}
        <SaleDetailModal
          isOpen={showSaleDetailModal}
          onClose={() => {
            setShowSaleDetailModal(false);
            setSelectedSaleItem(null);
          }}
          saleItem={selectedSaleItem}
          products={products}
          onDownloadReceipt={() => {
            // You can implement receipt generation here
            alert("Receipt generation feature coming soon!");
          }}
        />

        {/* Purchase History Modal */}
        <PurchaseHistory
          isOpen={showPurchaseHistoryModal}
          onClose={() => setShowPurchaseHistoryModal(false)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
