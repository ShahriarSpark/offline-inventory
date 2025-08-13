import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, X, DollarSign, Package, User, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import ReceiptButton from './ReceiptButton';
import Filter, { DateFilter, FilterType } from './Filter';
import { SaleItem, CustomerDetails } from '../types';

interface ProfitItem {
  saleId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerMobile: string;
  soldPrice: number;
  purchasePrice: number;
  profit: number;
  quantity: number;
  totalProfit: number;
  saleDate: string;
  product?: any; // Full product details
}

interface ProfitProps {
  soldProducts: any[];
  products: any[];
  purchases: any[];
}

const Profit: React.FC<ProfitProps> = ({ soldProducts, products, purchases }) => {
  const [profitItems, setProfitItems] = useState<ProfitItem[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProfitItem, setSelectedProfitItem] = useState<ProfitItem | null>(null);
  const [showFullDataModal, setShowFullDataModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Updated filter state to use the Filter component types
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
    selectedMonth: '',
    selectedYear: new Date().getFullYear().toString()
  });
  const [filteredProfitItems, setFilteredProfitItems] = useState<ProfitItem[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    calculateProfitItems();
  }, [soldProducts, products, purchases]);

  // New useEffect for filtering
  useEffect(() => {
    applyDateFilter();
  }, [profitItems, dateFilter, filterType]);

  const calculateProfitItems = () => {
    const items: ProfitItem[] = soldProducts.map(soldItem => {
      const product = products.find(p => p.id === soldItem.productId);
      
      // Find the most recent purchase price for this product from purchases.json
      const productPurchases = purchases
        .filter(purchase => purchase.productID === soldItem.productId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Use the buypricePerUnit from the most recent purchase, or fallback to product data
      const purchasePrice = productPurchases.length > 0 
        ? productPurchases[0].buypricePerUnit 
        : (product?.buypricePerUnit || 0);
      
      const soldPrice = soldItem.sellpricePerUnit || 0;
      const profit = soldPrice - purchasePrice;
      const totalProfit = profit * soldItem.quantity;

      return {
        saleId: soldItem.saleId,
        productId: soldItem.productId,
        productName: soldItem.productName,
        customerName: soldItem.customerName || 'N/A',
        customerMobile: soldItem.customerMobile || 'N/A',
        soldPrice,
        purchasePrice,
        profit,
        quantity: soldItem.quantity,
        totalProfit,
        saleDate: soldItem.timestamp || soldItem.dateOfSale,
        product
      };
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

    setProfitItems(items);
  };

  const applyDateFilter = () => {
    let filtered = [...profitItems];

    if (filterType === 'month' && dateFilter.selectedMonth && dateFilter.selectedYear) {
      const targetMonth = parseInt(dateFilter.selectedMonth);
      const targetYear = parseInt(dateFilter.selectedYear);
      
      filtered = profitItems.filter(item => {
        const saleDate = new Date(item.saleDate);
        return saleDate.getMonth() + 1 === targetMonth && saleDate.getFullYear() === targetYear;
      });
    } else if (filterType === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      filtered = profitItems.filter(item => {
        const saleDate = new Date(item.saleDate);
        return saleDate >= startDate && saleDate <= endDate;
      });
    }

    setFilteredProfitItems(filtered);
  };

  const resetFilters = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      selectedMonth: '',
      selectedYear: new Date().getFullYear().toString()
    });
    setFilterType('all');
  };

  // Use filtered items instead of original items
  const displayItems = filterType === 'all' ? profitItems : filteredProfitItems;
  const totalFilteredProfit = displayItems.reduce((sum, item) => sum + item.totalProfit, 0);
  const recentFilteredItems = displayItems.slice(0, 10);

  // Update pagination to use filtered items
  const totalFilteredPages = Math.ceil(displayItems.length / itemsPerPage);
  const paginatedFilteredItems = displayItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleProductClick = (item: ProfitItem) => {
    setSelectedProfitItem(item);
    setShowDetailModal(true);
  };

  const convertProfitItemToSaleItems = (item: ProfitItem): SaleItem[] => {
    if (!item.product) return [];
    
    return [{
      product: item.product,
      quantity: item.quantity,
      totalPrice: item.soldPrice * item.quantity
    }];
  };

  const getCustomerDetails = (item: ProfitItem): CustomerDetails | undefined => {
    if (item.customerName && item.customerName !== 'N/A') {
      // Try to find the original sold product to get complete customer details
      const soldProduct = soldProducts.find(sp => sp.saleId === item.saleId);
      
      return {
        name: item.customerName,
        mobile: item.customerMobile || soldProduct?.customerMobile || '',
        email: soldProduct?.customerEmail || '',
        address: soldProduct?.customerAddress || ''
      };
    }
    return undefined;
  };

  const handleNextPage = () => {
    if (currentPage < totalFilteredPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalFilteredPages <= maxVisiblePages) {
      for (let i = 1; i <= totalFilteredPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalFilteredPages, start + maxVisiblePages - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalFilteredPages) {
        if (end < totalFilteredPages - 1) pages.push('...');
        pages.push(totalFilteredPages);
      }
    }
    
    return pages;
  };

  if (profitItems.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 shadow-lg shadow-green-500/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Profit Analysis
        </h3>
        <div className="text-center py-8">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No sales data available for profit analysis</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Profit Analysis Section */}
      {/* Main Profit Analysis Card */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 shadow-lg shadow-green-500/10">
        {/* Filter Component */}
        <Filter
          title="Profit Analysis Filter"
          filterType={filterType}
          dateFilter={dateFilter}
          displayItemsLength={displayItems.length}
          onFilterTypeChange={setFilterType}
          onDateFilterChange={setDateFilter}
          onResetFilters={resetFilters}
        />

        <div className="flex items-center justify-between mb-4 gap-2 sm:gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Profit Analysis ({displayItems.length} sales)</span>
            <span className="sm:hidden truncate">Profit ({displayItems.length})</span>
            {filterType !== 'all' && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 flex-shrink-0">
                <span className="hidden sm:inline">Filtered</span>
                <span className="sm:hidden">F</span>
              </span>
            )}
          </h3>
          {/* Total profit - aligned in same row */}
          <div className="text-right flex-shrink-0">
            <p className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">
              {filterType === 'all' ? 'Total Profit' : 'Filtered Profit'}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-green-400 whitespace-nowrap">৳{totalFilteredProfit.toFixed(2)}</p>
          </div>
        </div>

        {/* Additional Statistics - Improved mobile layout */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6">
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Sales</p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-white">{displayItems.length}</p>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Revenue</p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-blue-400">
              ৳{displayItems.reduce((sum, item) => sum + (item.soldPrice * item.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-1">Total Cost</p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-orange-400">
              ৳{displayItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-1">Average Profit</p>
            <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-400">
              ৳{displayItems.length > 0 ? (totalFilteredProfit / displayItems.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No sales found for the selected period</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {recentFilteredItems.map((item) => (
              <div
                key={item.saleId}
                className="bg-slate-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border border-slate-700/30 hover:border-green-500/30"
                onClick={() => handleProductClick(item)}
              >
                {/* Mobile Layout - Improved */}
                <div className="block sm:hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-white font-medium text-sm truncate mb-1">{item.productName}</h4>
                      <p className="text-cyan-400 text-xs font-mono">ID: {item.productId}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-base font-bold ${item.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ৳{item.totalProfit.toFixed(2)}
                      </p>
                      <p className="text-slate-300 text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-700/20 rounded-md p-2">
                      <p className="text-slate-400 mb-1">Customer</p>
                      <p className="text-white truncate font-medium">{item.customerName}</p>
                      <p className="text-slate-300 truncate">{item.customerMobile}</p>
                    </div>
                    <div className="bg-slate-700/20 rounded-md p-2">
                      <p className="text-slate-400 mb-1">Prices</p>
                      <p className="text-white">Sale: ৳{item.soldPrice.toFixed(2)}</p>
                      <p className="text-slate-300">Cost: ৳{item.purchasePrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-slate-700/30">
                    <p className="text-slate-400 text-xs">
                      {new Date(item.saleDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout - Enhanced */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h4 className="text-white font-medium mb-1">{item.productName}</h4>
                    <p className="text-cyan-400 text-sm font-mono">ID: {item.productId}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Customer</p>
                    <p className="text-white text-sm font-medium">{item.customerName}</p>
                    <p className="text-slate-300 text-xs">{item.customerMobile}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-1">Sale Price</p>
                    <p className="text-white font-medium">৳{item.soldPrice.toFixed(2)}</p>
                    <p className="text-slate-300 text-xs">Qty: {item.quantity}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs mb-1">Purchase Price</p>
                    <p className="text-white font-medium">৳{item.purchasePrice.toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">Total Profit</p>
                    <p className={`text-lg font-bold ${item.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ৳{item.totalProfit.toFixed(2)}
                    </p>
                    <p className="text-slate-300 text-xs">
                      {new Date(item.saleDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayItems.length > 10 && (
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => {
                setShowFullDataModal(true);
                setCurrentPage(1); // Reset to first page when opening modal
              }}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 rounded-lg sm:rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 mx-auto w-full sm:w-auto max-w-sm sm:max-w-none"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">
                <span className="hidden sm:inline">View All Data ({displayItems.length} total sales)</span>
                <span className="sm:hidden">View All ({displayItems.length})</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal - updated for mobile */}
      {showDetailModal && selectedProfitItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 sm:p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4 sm:p-8 shadow-lg shadow-green-500/10 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Profit Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-slate-800/30 rounded-xl overflow-hidden">
                  {selectedProfitItem.product?.image ? (
                    <img
                      src={selectedProfitItem.product.image}
                      alt={selectedProfitItem.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 sm:w-24 sm:h-24 text-slate-400" />
                    </div>
                  )}
                </div>
                
                {/* Download receipt section */}
                <ReceiptButton
                  salesItems={convertProfitItemToSaleItems(selectedProfitItem)}
                  receiptNumber={`PROFIT-${selectedProfitItem.saleId}`}
                  cashierName="System Admin"
                  customerDetails={getCustomerDetails(selectedProfitItem)}
                  type="download"
                  className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25 text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Download Receipt</span>
                </ReceiptButton>
              </div>

              {/* Product Details */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{selectedProfitItem.productName}</h3>
                  <p className="text-cyan-400 font-mono text-sm sm:text-base">ID: {selectedProfitItem.productId}</p>
                </div>

                {/* Customer Information */}
                <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <User className="w-4 h-4 mr-2 text-blue-400" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-400 text-sm">Name:</span>
                      <span className="text-white text-sm break-words">{selectedProfitItem.customerName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-400 text-sm">Mobile:</span>
                      <span className="text-white text-sm break-all">{selectedProfitItem.customerMobile}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                    Financial Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Purchase Price:</span>
                      <span className="text-white text-sm">৳{selectedProfitItem.purchasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Sale Price:</span>
                      <span className="text-white text-sm">৳{selectedProfitItem.soldPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Quantity:</span>
                      <span className="text-white text-sm">{selectedProfitItem.quantity}</span>
                    </div>
                    <div className="border-t border-slate-700/50 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Profit per Unit:</span>
                        <span className={`font-semibold text-sm ${selectedProfitItem.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ৳{selectedProfitItem.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-sm">Total Profit:</span>
                        <span className={`text-lg sm:text-xl font-bold ${selectedProfitItem.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ৳{selectedProfitItem.totalProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                {selectedProfitItem.product?.description && (
                  <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                    <h4 className="text-white font-semibold mb-3 text-sm sm:text-base">Product Description</h4>
                    <p className="text-slate-300 text-sm">{selectedProfitItem.product.description}</p>
                  </div>
                )}

                {/* Sale Date */}
                <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4">
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Sale Information</h4>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-slate-400 text-sm">Sale Date:</span>
                    <span className="text-white text-sm break-words">
                      {new Date(selectedProfitItem.saleDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Data Modal - updated for filtered data and mobile */}
      {showFullDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 sm:p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-green-500/20 rounded-2xl shadow-lg shadow-green-500/10 max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-slate-700/50 pb-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-white">
                    {filterType === 'all' ? 'Complete Profit Analysis' : 'Filtered Profit Analysis'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400 text-sm sm:text-base">
                      {filterType !== 'all' ? 'Filtered: ' : 'All '}
                      {displayItems.length} sales records
                    </p>
                    {filterType !== 'all' && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        {filterType === 'month' ? 'Monthly' : 'Custom Range'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowFullDataModal(false)}
                  className="p-2 sm:p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Data Table - Enhanced mobile layout */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-6">
                {paginatedFilteredItems.map((item) => (
                  <div
                    key={item.saleId}
                    className="bg-slate-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border border-slate-700/30 hover:border-green-500/30"
                    onClick={() => handleProductClick(item)}
                  >
                    {/* Mobile Layout - Improved */}
                    <div className="block lg:hidden">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-white font-medium text-sm truncate mb-1">{item.productName}</h4>
                          <p className="text-cyan-400 text-xs font-mono">ID: {item.productId}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-base sm:text-lg font-bold ${item.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ৳{item.totalProfit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-700/20 rounded-md p-2">
                          <p className="text-slate-400 mb-1">Customer</p>
                          <p className="text-white truncate font-medium">{item.customerName}</p>
                          <p className="text-slate-300 truncate">{item.customerMobile}</p>
                        </div>
                        <div className="bg-slate-700/20 rounded-md p-2">
                          <p className="text-slate-400 mb-1">Details</p>
                          <p className="text-white">Qty: {item.quantity}</p>
                          <p className="text-slate-300">{new Date(item.saleDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div className="bg-slate-700/20 rounded-md p-2">
                          <p className="text-slate-400 mb-1">Sale Price</p>
                          <p className="text-white font-medium">৳{item.soldPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-700/20 rounded-md p-2">
                          <p className="text-slate-400 mb-1">Purchase Price</p>
                          <p className="text-white font-medium">৳{item.purchasePrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Enhanced */}
                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      <div className="md:col-span-2">
                        <h4 className="text-white font-medium mb-1">{item.productName}</h4>
                        <p className="text-cyan-400 text-sm font-mono">ID: {item.productId}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Customer</p>
                        <p className="text-white text-sm truncate font-medium">{item.customerName}</p>
                        <p className="text-slate-300 text-xs truncate">{item.customerMobile}</p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-xs mb-1">Sale Price</p>
                        <p className="text-white font-medium">৳{item.soldPrice.toFixed(2)}</p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-xs mb-1">Purchase Price</p>
                        <p className="text-white font-medium">৳{item.purchasePrice.toFixed(2)}</p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-xs mb-1">Quantity</p>
                        <p className="text-white font-medium">{item.quantity}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-slate-400 text-xs mb-1">Total Profit</p>
                        <p className={`text-lg xl:text-xl font-bold ${item.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ৳{item.totalProfit.toFixed(2)}
                        </p>
                        <p className="text-slate-300 text-xs">
                          {new Date(item.saleDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Enhanced mobile layout */}
              {totalFilteredPages > 1 && (
                <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-4 border-t border-slate-700/50">
                  {/* Mobile: Compact pagination */}
                  <div className="sm:hidden flex items-center justify-between w-full max-w-xs">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                        currentPage === 1
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-2 bg-green-500 text-white font-bold rounded-lg text-sm">
                        {currentPage}
                      </span>
                      <span className="text-slate-400 text-sm">of</span>
                      <span className="px-3 py-2 bg-slate-700/50 text-white rounded-lg text-sm">
                        {totalFilteredPages}
                      </span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalFilteredPages}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                        currentPage === totalFilteredPages
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Desktop: Full pagination */}
                  <div className="hidden sm:flex items-center justify-center space-x-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex space-x-2">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' ? goToPage(page) : undefined}
                          disabled={typeof page !== 'number'}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 min-w-[40px] ${
                            page === currentPage
                              ? 'bg-green-500 text-white font-bold'
                              : typeof page === 'number'
                              ? 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                              : 'text-slate-500 cursor-default'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalFilteredPages}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        currentPage === totalFilteredPages
                          ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700/50 hover:bg-slate-700/70 text-white'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Info */}
                  <div className="text-center">
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, displayItems.length)} of {displayItems.length} sales
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profit;
