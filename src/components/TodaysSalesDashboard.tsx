/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Filter,
  Download,
  BarChart3,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";
import { getSoldProducts } from "../utils/storage";

// Simple Modal component
type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};
const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-cyan-500/30 w-full max-w-3xl mx-4 relative">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-cyan-500/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

// MonthlySalesOutput component with clickable product rows and detail modal
interface ProductStatWithDates {
  productId?: string;
  productName: string;
  quantity: number;
  total: number;
  dates: string[];
}
interface MonthlySalesOutputProps {
  open: boolean;
  onClose: () => void;
  title: string;
  productStats: ProductStatWithDates[];
  summary: { totalProducts: number; totalRevenue: number };
  allSales?: SaleRecord[]; // Pass all sales for this period
}

const ProductCustomerDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  product: ProductStatWithDates | null;
  sales: SaleRecord[];
}> = ({ open, onClose, product, sales }) => {
  if (!open || !product) return null;
  // Unique customers by email or mobile
  const customers = sales
    .filter((s) => s.productName === product.productName)
    .map((s) => ({
      name: s.customerName || "N/A",
      email: s.customerEmail || "N/A",
      mobile: s.customerMobile || "N/A",
      address: s.customerAddress || "N/A",
      date: s.timestamp
        ? new Date(s.timestamp).toLocaleString()
        : new Date(s.dateOfSale).toLocaleString(),
      soldBy: s.soldByEmail || "N/A",
      saleId: s.saleId,
      quantity: s.quantity,
      total: s.totalPrice,
    }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.productName + " - Details"}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Photo (now left) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="text-lg font-bold text-green-400 mb-4">
            Product Photo
          </h4>
          {product.productId ? (
            <img
              src={`/images/products/${product.productId}.jpg`}
              alt={product.productName}
              className="max-h-64 rounded-xl border border-slate-700 shadow-lg object-contain bg-slate-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/products/default.jpg";
              }}
            />
          ) : (
            <img
              src={`/images/products/${encodeURIComponent(
                product.productName
              )}.jpg`}
              alt={product.productName}
              className="max-h-64 rounded-xl border border-slate-700 shadow-lg object-contain bg-slate-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/products/default.jpg";
              }}
            />
          )}
        </div>
        {/* Product Details (now right) */}
        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="text-lg font-bold text-cyan-400 mb-2">
            Product Details
          </h4>
          <div className="text-white mb-2">
            <span className="font-semibold">Name:</span> {product.productName}
          </div>
          <div className="text-white mb-2">
            <span className="font-semibold">Total Sold:</span>{" "}
            {product.quantity}
          </div>
          <div className="text-white mb-2">
            <span className="font-semibold">Total Sales:</span> ৳
            {product.total.toLocaleString()}
          </div>
          <div className="text-white mb-2">
            <span className="font-semibold">Date(s):</span>{" "}
            {product.dates.join(", ")}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const MonthlySalesOutput: React.FC<MonthlySalesOutputProps> = ({
  open,
  onClose,
  title,
  productStats,
  summary,
  allSales,
}) => {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductStatWithDates | null>(null);
  const [productSales, setProductSales] = React.useState<SaleRecord[]>([]);

  const handleRowClick = (prod: ProductStatWithDates) => {
    setSelectedProduct(prod);
    if (allSales) {
      setProductSales(
        allSales.filter((s) => s.productName === prod.productName)
      );
    } else {
      setProductSales([]);
    }
    setDetailOpen(true);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={title}>
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div className="text-lg font-bold text-cyan-400">
              Total Products Sold:{" "}
              <span className="text-white">{summary.totalProducts}</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              Total Sales:{" "}
              <span className="text-white">
                ৳{summary.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[60vh] min-h-[200px]">
          <div className="overflow-y-auto max-h-[50vh]">
            <table className="w-full min-w-[700px]">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-2 px-4">
                    Product
                  </th>
                  <th className="text-left text-slate-400 font-medium py-2 px-4">
                    Quantity Sold
                  </th>
                  <th className="text-left text-slate-400 font-medium py-2 px-4">
                    Total Sales
                  </th>
                  <th className="text-left text-slate-400 font-medium py-2 px-4">
                    Date(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {productStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-400 py-6">
                      No sales in this period.
                    </td>
                  </tr>
                ) : (
                  productStats.map((prod, idx) => (
                    <tr
                      key={prod.productName + idx}
                      className="border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/40 transition"
                      onClick={() => handleRowClick(prod)}
                    >
                      <td className="py-2 px-4 text-white font-medium">
                        {prod.productName}
                      </td>
                      <td className="py-2 px-4 text-blue-400 font-bold">
                        {prod.quantity}
                      </td>
                      <td className="py-2 px-4 text-green-400 font-bold">
                        ৳{prod.total.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-slate-300 text-sm whitespace-pre-line">
                        {prod.dates.join(", ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      <ProductCustomerDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        product={selectedProduct}
        sales={productSales}
      />
    </>
  );
};

interface SaleRecord {
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
}

interface TodaysSalesDashboardProps {
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
  className?: string;
}

interface SalesStats {
  totalProducts: number;
  totalRevenue: number;
  uniqueProductCount: number;
  salesCount: number;
}

const TodaysSalesDashboard: React.FC<TodaysSalesDashboardProps> = ({
  refreshTrigger,
  className = "",
}) => {
  const [todaysStats, setTodaysStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0,
  });

  const [customStats, setCustomStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0,
  });

  // Modal state for monthly report
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [monthlyProductStats, setMonthlyProductStats] = useState<
    ProductStatWithDates[]
  >([]);
  const [monthlySummary, setMonthlySummary] = useState<{
    totalProducts: number;
    totalRevenue: number;
  }>({ totalProducts: 0, totalRevenue: 0 });

  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [showCustomDateView, setShowCustomDateView] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customProductStats, setCustomProductStats] = useState<
    ProductStatWithDates[]
  >([]);
  const [customSummary, setCustomSummary] = useState<{
    totalProducts: number;
    totalRevenue: number;
  }>({ totalProducts: 0, totalRevenue: 0 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // Fetch sales data
  // Try to load sales data from local file for development, fallback to API if needed
  // const fetchSalesData = async (): Promise<SaleRecord[]> => {
  //   // Try local static import (works in Vite/CRA if file is in public/data)
  //   try {
  //     // @ts-ignore
  //     const localData = await import("../../data/sales.json");
  //     if (Array.isArray(localData.default)) {
  //       return localData.default;
  //     }
  //   } catch (e) {
  //     // Ignore and fallback to API
  //   }
  //   // Fallback to API
  //   //  Change Api
  //   try {
  //     const response = await fetch(
  //       "https://offline-inventory-api-with-fs.onrender.com/api/sales"
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch sales data");
  //     console.log(await response.json());
  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error fetching sales data:", error);
  //     return [];
  //   }
  // };

  // Calculate stats for a given date range
  const calculateStats = (
    salesData: SaleRecord[],
    startDate: string,
    endDate: string
  ): SalesStats => {
    const filteredSales = salesData.filter((sale) => {
      const saleDate = sale.timestamp
        ? new Date(sale.timestamp)
        : new Date(sale.dateOfSale);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set end date to end of day for inclusive filtering
      end.setHours(23, 59, 59, 999);

      return saleDate >= start && saleDate <= end;
    });

    const totalProducts = filteredSales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    );
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + sale.totalPrice,
      0
    );
    const uniqueProductCount = new Set(
      filteredSales.map((sale) => sale.productId)
    ).size;
    const salesCount = filteredSales.length;

    return {
      totalProducts,
      totalRevenue,
      uniqueProductCount,
      salesCount,
    };
  };

  // Load all stats
  const loadStats = async () => {
    setLoading(true);
    try {
      const salesData = await getSoldProducts();
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      // Today's stats
      const todaysData = calculateStats(salesData, todayStr, todayStr);
      setTodaysStats(todaysData);
      // Monthly stats (current month)
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const monthlyData = calculateStats(
        salesData,
        firstDayOfMonth.toISOString().split("T")[0],
        todayStr
      );
      setMonthlyStats(monthlyData);
      // Prepare monthly product stats for modal
      const monthlySales = salesData.filter((sale) => {
        const saleDate = sale.timestamp
          ? new Date(sale.timestamp)
          : new Date(sale.dateOfSale);
        return (
          saleDate >= firstDayOfMonth &&
          saleDate <= new Date(todayStr + "T23:59:59.999Z")
        );
      });
      // Aggregate by product, collect all sale dates
      const productMap: Record<
        string,
        {
          productName: string;
          quantity: number;
          total: number;
          dates: string[];
        }
      > = {};
      for (const sale of monthlySales) {
        if (!productMap[sale.productId]) {
          productMap[sale.productId] = {
            productName: sale.productName,
            quantity: 0,
            total: 0,
            dates: [],
          };
        }
        productMap[sale.productId].quantity += sale.quantity;
        productMap[sale.productId].total += sale.totalPrice;
        // Add date (show only date part, unique only)
        const dateStr = sale.timestamp
          ? new Date(sale.timestamp).toLocaleDateString()
          : new Date(sale.dateOfSale).toLocaleDateString();
        if (!productMap[sale.productId].dates.includes(dateStr)) {
          productMap[sale.productId].dates.push(dateStr);
        }
      }
      const productStats = Object.values(productMap).sort(
        (a, b) => b.quantity - a.quantity
      );
      setMonthlyProductStats(productStats);
      setMonthlySummary({
        totalProducts: productStats.reduce((sum, p) => sum + p.quantity, 0),
        totalRevenue: productStats.reduce((sum, p) => sum + p.total, 0),
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load custom date range stats
  const loadCustomStats = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const salesData = await getSoldProducts();
      const customData = calculateStats(salesData, startDate, endDate);
      setCustomStats(customData);
      // Prepare product stats for custom range
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const customSales = salesData.filter((sale) => {
        const saleDate = sale.timestamp
          ? new Date(sale.timestamp)
          : new Date(sale.dateOfSale);
        return saleDate >= start && saleDate <= end;
      });
      const productMap: Record<
        string,
        {
          productName: string;
          quantity: number;
          total: number;
          dates: string[];
        }
      > = {};
      for (const sale of customSales) {
        if (!productMap[sale.productId]) {
          productMap[sale.productId] = {
            productName: sale.productName,
            quantity: 0,
            total: 0,
            dates: [],
          };
        }
        productMap[sale.productId].quantity += sale.quantity;
        productMap[sale.productId].total += sale.totalPrice;
        const dateStr = sale.timestamp
          ? new Date(sale.timestamp).toLocaleDateString()
          : new Date(sale.dateOfSale).toLocaleDateString();
        if (!productMap[sale.productId].dates.includes(dateStr)) {
          productMap[sale.productId].dates.push(dateStr);
        }
      }
      const productStats = Object.values(productMap).sort(
        (a, b) => b.quantity - a.quantity
      );
      setCustomProductStats(productStats);
      setCustomSummary({
        totalProducts: productStats.reduce((sum, p) => sum + p.quantity, 0),
        totalRevenue: productStats.reduce((sum, p) => sum + p.total, 0),
      });
      setShowCustomModal(true);
    } catch (error) {
      console.error("Error loading custom stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  // Initial load
  useEffect(() => {
    loadStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  // Format date range for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Export functionality
  const handleExport = () => {
    const data = showMonthlyView
      ? monthlyStats
      : showCustomDateView
      ? customStats
      : todaysStats;
    const title = showMonthlyView
      ? "Monthly Sales Report"
      : showCustomDateView
      ? `Custom Range Sales Report (${formatDateRange(startDate, endDate)})`
      : "Today's Sales Report";

    const exportData = {
      title,
      generatedAt: new Date().toISOString(),
      stats: data,
      dateRange: showCustomDateView ? { startDate, endDate } : undefined,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-${color}-500/20 rounded-2xl p-6 shadow-lg shadow-${color}-500/10`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br from-${color}-400 to-${color}-500 rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-cyan-400" />
              Sales Dashboard
            </h2>
            <p className="text-slate-400 flex items-center mt-1">
              <Clock className="w-4 h-4 mr-2" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl border border-cyan-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl border border-green-500/30 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Sales Section */}
      {!showMonthlyView && !showCustomDateView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Today's Sales - {new Date().toLocaleDateString()}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold Today"
              value={todaysStats.totalProducts || "N/A"}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${todaysStats.salesCount} transactions`}
            />
            <StatCard
              title="Revenue Today"
              value={
                todaysStats.totalRevenue
                  ? formatCurrency(todaysStats.totalRevenue)
                  : "N/A"
              }
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={
                todaysStats.totalRevenue
                  ? `Avg: ${formatCurrency(
                      todaysStats.totalRevenue / (todaysStats.salesCount || 1)
                    )}`
                  : undefined
              }
            />
            <StatCard
              title="Unique Products"
              value={todaysStats.uniqueProductCount || "N/A"}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Transactions"
              value={todaysStats.salesCount || "N/A"}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Monthly Sales Section */}
      {showMonthlyView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Monthly Sales Report -{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => setShowMonthlyView(false)}
              className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-xl border border-slate-500/30 transition-all duration-300"
            >
              Back to Today
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold This Month"
              value={monthlyStats.totalProducts || "N/A"}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${monthlyStats.salesCount} transactions`}
            />
            <StatCard
              title="Monthly Revenue"
              value={
                monthlyStats.totalRevenue
                  ? formatCurrency(monthlyStats.totalRevenue)
                  : "N/A"
              }
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={
                monthlyStats.totalRevenue
                  ? `Avg: ${formatCurrency(
                      monthlyStats.totalRevenue / (monthlyStats.salesCount || 1)
                    )}`
                  : undefined
              }
            />
            <StatCard
              title="Unique Products"
              value={monthlyStats.uniqueProductCount || "N/A"}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Total Transactions"
              value={monthlyStats.salesCount || "N/A"}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Custom Date Range Section */}
      {showCustomDateView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Custom Range Report - {formatDateRange(startDate, endDate)}
            </h3>
            <button
              onClick={() => setShowCustomDateView(false)}
              className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-xl border border-slate-500/30 transition-all duration-300"
            >
              Back to Today
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold"
              value={customStats.totalProducts || "N/A"}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${customStats.salesCount} transactions`}
            />
            <StatCard
              title="Total Revenue"
              value={
                customStats.totalRevenue
                  ? formatCurrency(customStats.totalRevenue)
                  : "N/A"
              }
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={
                customStats.totalRevenue
                  ? `Avg: ${formatCurrency(
                      customStats.totalRevenue / (customStats.salesCount || 1)
                    )}`
                  : undefined
              }
            />
            <StatCard
              title="Unique Products"
              value={customStats.uniqueProductCount || "N/A"}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Total Transactions"
              value={customStats.salesCount || "N/A"}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Action Buttons & Date Filter */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Report Button */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Quick Sells Reports{" "}
            </h4>
            <button
              onClick={() => setShowMonthlyModal(true)}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/20"
            >
              <Calendar className="w-5 h-5" />
              <span>View Monthly Report</span>
            </button>
            {/* Monthly Modal */}
            <MonthlySalesOutput
              open={showMonthlyModal}
              onClose={() => setShowMonthlyModal(false)}
              title="Monthly Sales Report"
              productStats={monthlyProductStats}
              summary={monthlySummary}
            />
          </div>

          {/* Custom Date Range Filter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Custom Date Range
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={loadCustomStats}
              disabled={!startDate || !endDate || loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl text-green-400 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-5 h-5" />
              <span>Filter Range</span>
            </button>
            {/* Custom Range Modal */}
            <MonthlySalesOutput
              open={showCustomModal}
              onClose={() => setShowCustomModal(false)}
              title={`Custom Range Sales Report (${formatDateRange(
                startDate,
                endDate
              )})`}
              productStats={customProductStats}
              summary={customSummary}
            />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 text-cyan-400 mb-4">
                <RefreshCw className="w-12 h-12" />
              </div>
              <span className="text-white text-lg font-semibold">
                Loading Sales Data...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysSalesDashboard;
