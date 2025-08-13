import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, DollarSign, TrendingUp, Filter as FilterIcon, Download } from 'lucide-react';
import { PurchaseRecord } from '../types';
import { getPurchaseLogs } from '../utils/storage';
import Filter, { DateFilter, FilterType } from './Filter';

interface PurchaseHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ isOpen, onClose }) => {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
    selectedMonth: '',
    selectedYear: new Date().getFullYear().toString()
  });
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseRecord[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPurchaseHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [purchases, dateFilter, filterType, searchTerm]);

  const loadPurchaseHistory = async () => {
    setLoading(true);
    try {
      const purchaseData = await getPurchaseLogs();
      setPurchases(purchaseData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...purchases];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(purchase =>
        purchase.productName.toLowerCase().includes(searchLower) ||
        purchase.productID.toLowerCase().includes(searchLower) ||
        purchase.supplier?.toLowerCase().includes(searchLower) ||
        purchase.adminId?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter
    if (filterType === 'month' && dateFilter.selectedMonth && dateFilter.selectedYear) {
      const targetMonth = parseInt(dateFilter.selectedMonth);
      const targetYear = parseInt(dateFilter.selectedYear);
      
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.timestamp);
        return purchaseDate.getMonth() + 1 === targetMonth && purchaseDate.getFullYear() === targetYear;
      });
    } else if (filterType === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.timestamp);
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });
    }

    setFilteredPurchases(filtered);
  };

  const resetFilters = () => {
    setDateFilter({
      startDate: '',
      endDate: '',
      selectedMonth: '',
      selectedYear: new Date().getFullYear().toString()
    });
    setFilterType('all');
    setSearchTerm('');
  };

  const displayPurchases = filterType === 'all' && !searchTerm.trim() ? purchases : filteredPurchases;
  const totalCost = displayPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalQuantity = displayPurchases.reduce((sum, purchase) => sum + purchase.quantityAdded, 0);

  const handlePurchaseClick = (purchase: PurchaseRecord) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  // Get full product details from purchase record
  const getFullProductDetails = (purchase: PurchaseRecord) => {
    return {
      id: purchase.productID,
      name: purchase.productName,
      brand: purchase.brand || 'N/A',
      image: purchase.image || null,
      description: 'Product details available in purchase record',
      category: purchase.category || 'N/A',
      supplier: purchase.supplier || 'N/A',
      buyPrice: purchase.buypricePerUnit,
      sellPrice: purchase.sellpricePerUnit || 0,
      quantityAdded: purchase.quantityAdded,
      totalCost: purchase.totalCost,
      purchaseDate: purchase.timestamp,
      adminId: purchase.adminId || 'N/A',
      commonId: purchase.commonId || 'N/A',
      uniqueId: purchase.uniqueId || 'N/A'
    };
  };

  const exportToCsv = () => {
    const headers = ['Date', 'Product Name', 'Product ID', 'Quantity', 'Buy Price', 'Sell Price', 'Total Cost', 'Supplier', 'Admin ID'];
    const csvData = [
      headers,
      ...displayPurchases.map(purchase => [
        new Date(purchase.timestamp).toLocaleString(),
        purchase.productName,
        purchase.productID,
        purchase.quantityAdded.toString(),
        purchase.buypricePerUnit.toFixed(2),
        purchase.sellpricePerUnit?.toFixed(2) || 'N/A',
        purchase.totalCost.toFixed(2),
        purchase.supplier || 'N/A',
        purchase.adminId || 'N/A'
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `purchase_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Add global scrollbar styles */}
      <style>
        {`
          .custom-scrollbar {
            scroll-behavior: smooth;
            scrollbar-width: thin;
            scrollbar-color: #64748b #1e293b;
            -webkit-overflow-scrolling: touch;
            overflow-y: scroll !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 16px;
            height: 16px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b;
            border-radius: 8px;
            margin: 2px;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #64748b 0%, #475569 100%);
            border-radius: 8px;
            border: 2px solid #1e293b;
            min-height: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          }
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: #1e293b;
          }
          /* Force scrollbar to always show */
          .custom-scrollbar::-webkit-scrollbar-track {
            -webkit-appearance: none;
          }
        `}
      </style>

      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 md:p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10 max-w-7xl w-full h-[95vh] md:h-[95vh] flex flex-col">
          
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-4 md:p-6 border-b border-slate-700/50">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Purchase History</h2>
                <p className="text-slate-400 text-sm md:text-base">View all purchase transactions and inventory additions</p>
              </div>
              
              {/* Close button - Always top right */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 md:p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            {/* Action buttons row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4">
              {/* Mobile: Filter and Export in same row */}
              <div className="flex space-x-2 sm:contents">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg border transition-all duration-300 text-xs sm:text-sm ${
                    showFilters
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                      : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <FilterIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  <span className="sm:hidden">{showFilters ? 'Hide' : 'Filter'}</span>
                </button>
                <button
                  onClick={exportToCsv}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-all duration-300 text-xs sm:text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>

            {/* Filter Component - Conditional */}
            {showFilters && (
              <div className="mb-4">
                <Filter
                  title="Filter Purchase History"
                  filterType={filterType}
                  dateFilter={dateFilter}
                  displayItemsLength={displayPurchases.length}
                  onFilterTypeChange={setFilterType}
                  onDateFilterChange={setDateFilter}
                  onResetFilters={resetFilters}
                />
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by product name, ID, supplier, or admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <p className="text-slate-400 text-xs md:text-sm">Total Purchases</p>
                <p className="text-lg md:text-2xl font-bold text-white">{displayPurchases.length}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <p className="text-slate-400 text-xs md:text-sm">Total Items</p>
                <p className="text-lg md:text-2xl font-bold text-blue-400">{totalQuantity}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <p className="text-slate-400 text-xs md:text-sm">Total Investment</p>
                <p className="text-lg md:text-2xl font-bold text-green-400">৳{totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                <p className="text-slate-400 text-xs md:text-sm">Avg. Purchase Value</p>
                <p className="text-lg md:text-2xl font-bold text-purple-400">
                  ৳{displayPurchases.length > 0 ? (totalCost / displayPurchases.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Purchase List */}
          <div className="flex-1 overflow-hidden min-h-0" style={{ maxHeight: 'calc(95vh - 300px)' }}>
            <div className="h-full overflow-y-scroll overflow-x-hidden px-3 md:px-6 py-4 custom-scrollbar" style={{ maxHeight: '100%' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-white">Loading purchase history...</span>
                  </div>
                </div>
              ) : displayPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Purchase History Found</h3>
                  <p className="text-slate-400">
                    {searchTerm || filterType !== 'all' 
                      ? 'No purchases match your current filters. Try adjusting your search or filter criteria.'
                      : 'No purchases have been recorded yet. Purchase history will appear here once inventory is added.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4" style={{ minHeight: '600px' }}>
                  {displayPurchases.map((purchase, index) => (
                    <div
                      key={`${purchase.productID}-${purchase.timestamp}-${index}`}
                      className="bg-slate-800/30 rounded-xl p-3 md:p-4 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border border-slate-700/30 hover:border-slate-600/50"
                      onClick={() => handlePurchaseClick(purchase)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 items-start md:items-center">
                        {/* Product Info - Takes full width on mobile */}
                        <div className="md:col-span-2 border-b border-slate-700/30 md:border-b-0 pb-3 md:pb-0">
                          <h4 className="text-white font-medium text-sm md:text-base">{purchase.productName}</h4>
                          <p className="text-cyan-400 text-xs md:text-sm font-mono">ID: {purchase.productID}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(purchase.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Mobile: 2x2 grid for stats, Desktop: individual columns */}
                        <div className="grid grid-cols-2 gap-3 md:contents">
                          <div>
                            <p className="text-slate-400 text-xs">Quantity Added</p>
                            <p className="text-white font-medium text-sm md:text-base">{purchase.quantityAdded}</p>
                          </div>

                          <div>
                            <p className="text-slate-400 text-xs">Buy Price</p>
                            <p className="text-white font-medium text-sm md:text-base">৳{purchase.buypricePerUnit.toFixed(2)}</p>
                          </div>

                          <div>
                            <p className="text-slate-400 text-xs">Supplier</p>
                            <p className="text-white text-xs md:text-sm truncate">{purchase.supplier || 'N/A'}</p>
                          </div>

                          <div className="md:text-right">
                            <p className="text-slate-400 text-xs">Total Cost</p>
                            <p className="text-green-400 text-lg md:text-lg font-bold">৳{purchase.totalCost.toFixed(2)}</p>
                            <p className="text-slate-300 text-xs">
                              {new Date(purchase.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-60 p-2 md:p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10 max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-4 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-white">Product Purchase Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const productDetails = getFullProductDetails(selectedPurchase);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                    {/* Left Column - Product Image and Basic Info */}
                    <div className="space-y-4 md:space-y-6">
                      {/* Product Image */}
                      <div className="aspect-square bg-slate-800/30 rounded-xl overflow-hidden border border-slate-700/30">
                        {productDetails.image ? (
                          <img
                            src={productDetails.image}
                            alt={productDetails.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Package className="w-16 md:w-24 h-16 md:h-24 text-slate-400 mx-auto mb-4" />
                              <p className="text-slate-400 text-sm md:text-base">No Image Available</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Basic Info */}
                      <div className="bg-slate-800/30 rounded-xl p-4 md:p-6 border border-slate-700/30">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
                          <Package className="w-4 md:w-5 h-4 md:h-5 mr-2 text-blue-400" />
                          Product Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-medium">Product Name:</span>
                            <span className="text-white font-semibold text-right">{productDetails.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Product ID:</span>
                            <span className="text-cyan-400 font-mono">{productDetails.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Brand:</span>
                            <span className="text-white">{productDetails.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Category:</span>
                            <span className="text-white">{productDetails.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Supplier:</span>
                            <span className="text-white">{productDetails.supplier}</span>
                          </div>
                        </div>
                      </div>

                      {/* Product Description */}
                      {productDetails.description !== 'No description available' && (
                        <div className="bg-slate-800/30 rounded-xl p-4 md:p-6 border border-slate-700/30">
                          <h4 className="text-white font-semibold mb-3 text-sm md:text-base">Product Description</h4>
                          <p className="text-slate-300 leading-relaxed text-sm md:text-base">{productDetails.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Purchase and Financial Details */}
                    <div className="space-y-4 md:space-y-6">
                      {/* Purchase Summary */}
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center">
                          <DollarSign className="w-4 md:w-5 h-4 md:h-5 mr-2 text-green-400" />
                          Purchase Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                            <p className="text-slate-400 text-sm">Quantity Purchased</p>
                            <p className="text-2xl font-bold text-white">{productDetails.quantityAdded}</p>
                          </div>
                          <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                            <p className="text-slate-400 text-sm">Total Investment</p>
                            <p className="text-2xl font-bold text-green-400">৳{productDetails.totalCost.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Details */}
                      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                        <h4 className="text-white font-semibold mb-4 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                          Pricing Information
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                            <span className="text-slate-400 font-medium">Purchase Price per Unit:</span>
                            <span className="text-white font-bold">৳{productDetails.buyPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg">
                            <span className="text-slate-400 font-medium">Sale Price per Unit:</span>
                            <span className="text-white font-bold">৳{productDetails.sellPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                            <span className="text-slate-300 font-medium">Profit per Unit:</span>
                            <span className={`font-bold text-lg ${
                              (productDetails.sellPrice - productDetails.buyPrice) >= 0 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              ৳{(productDetails.sellPrice - productDetails.buyPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg">
                            <span className="text-slate-300 font-medium">Total Potential Profit:</span>
                            <span className={`font-bold text-lg ${
                              ((productDetails.sellPrice - productDetails.buyPrice) * productDetails.quantityAdded) >= 0 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              ৳{((productDetails.sellPrice - productDetails.buyPrice) * productDetails.quantityAdded).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                        <h4 className="text-white font-semibold mb-4 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                          Transaction Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Purchase Date:</span>
                            <span className="text-white">{new Date(productDetails.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Purchase Time:</span>
                            <span className="text-white">{new Date(productDetails.purchaseDate).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Admin ID:</span>
                            <span className="text-white">{productDetails.adminId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Product Info */}
                      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                        <h4 className="text-white font-semibold mb-4">Product Identification</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Common ID:</span>
                            <span className="text-white font-mono">{productDetails.commonId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Unique ID:</span>
                            <span className="text-white font-mono">{productDetails.uniqueId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseHistory;