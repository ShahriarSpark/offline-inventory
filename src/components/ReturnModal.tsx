import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Undo2, ChevronUp } from 'lucide-react';
import { getProductById, getSalesLogs } from '../utils/storage';
import { Product } from '../types';

// Interface for the actual sales data structure in JSON
interface SaleData {
  saleId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  quantity: number;
  sellpricePerUnit: number;
  totalPrice: number;
  unit: string;
  currency: string;
  dateOfSale: string;
  warrantyEndDate: string;
  timestamp: string;
  soldBy: string;
  soldByEmail: string;
}

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessReturn: (productId: string, quantity: number, reason: string, customerName?: string, customerMobile?: string, customerEmail?: string, customerAddress?: string) => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onProcessReturn
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState<'productId' | 'mobile'>('productId');
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle scroll progress
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = async () => {
    if (!productId.trim()) {
      setError('Please enter a product ID or mobile number');
      return;
    }

    try {
      if (searchType === 'productId') {
        // Search by product ID
        const foundProduct = await getProductById(productId.trim());
        if (foundProduct) {
          setProduct(foundProduct);
          setError('');
        } else {
          setProduct(null);
          setError('Product not found');
        }
      } else {
        // Search by customer mobile number in sales data
        const sales = await getSalesLogs();
        const mobileSales = (sales as any[]).filter((sale: any) => 
          sale.customerMobile === productId.trim()
        );
        
        if (mobileSales.length > 0) {
          setSalesData(mobileSales);
          setError('');
          setProduct(null); // Clear product until specific sale is selected
        } else {
          setSalesData([]);
          setError('No sales found for this mobile number');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Error occurred during search');
    }
  };

  const selectSaleItem = async (sale: any) => {
    try {
      const foundProduct = await getProductById(sale.productId);
      if (foundProduct) {
        // Create a modified product with sale-specific price
        const saleProduct: Product = {
          ...foundProduct,
          sellpricePerUnit: sale.sellpricePerUnit,
          stock: sale.quantity // Use the sold quantity as available stock for return
        };
        setProduct(saleProduct);
        setQuantity(Math.min(1, sale.quantity)); // Default to 1 but max is sold quantity
        setError('');
      } else {
        setError('Product details not found');
      }
    } catch (error) {
      console.error('Error selecting sale item:', error);
      setError('Error loading product details');
    }
  };

  const handleReturn = () => {
    if (!product) {
      setError('Please search for a valid product first');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    // Validate quantity against sold amount when searched by mobile
    if (searchType === 'mobile' && quantity > product.stock) {
      setError(`Cannot return more than sold quantity (${product.stock} ${product.unit})`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for return');
      return;
    }

    // Extract customer details from sales data if available
    let customerName: string | undefined;
    let customerMobile: string | undefined;
    let customerEmail: string | undefined;
    let customerAddress: string | undefined;
    
    if (salesData.length > 0) {
      // Find the sales record for this product
      const saleRecord = salesData.find(sale => sale.productId === product.id);
      if (saleRecord) {
        customerName = saleRecord.customerName;
        customerMobile = saleRecord.customerMobile;
        customerEmail = saleRecord.customerEmail;
        customerAddress = saleRecord.customerAddress;
      }
    }

    onProcessReturn(product.id, quantity, reason, customerName, customerMobile, customerEmail, customerAddress);
    
    // Reset form
    setProductId('');
    setQuantity(1);
    setReason('');
    setProduct(null);
    setSalesData([]);
    setError('');
    onClose();
  };

  const totalRefund = product && product.sellpricePerUnit && quantity ? quantity * product.sellpricePerUnit : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Scroll Indicator */}
        <div className="w-full h-1 bg-slate-800/50">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300" 
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-slate-700/50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Undo2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Return Policy</h2>
                <p className="text-slate-400">Process product returns and refunds</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          ref={scrollRef}
          className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/50 hover:scrollbar-thumb-slate-500/50"
        >
          {/* Scroll Hint */}
          {(salesData.length > 0 || product) && scrollProgress < 95 && (
            <div className="text-center py-2 mb-4">
              <div className="inline-flex items-center space-x-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <span className="text-slate-400 text-xs">Scroll down to see more content</span>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          {/* Search Type Selection */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">Search Type</label>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSearchType('productId');
                  setProductId('');
                  setProduct(null);
                  setSalesData([]);
                  setError('');
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  searchType === 'productId'
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                Product ID
              </button>
              <button
                onClick={() => {
                  setSearchType('mobile');
                  setProductId('');
                  setProduct(null);
                  setSalesData([]);
                  setError('');
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  searchType === 'mobile'
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                Customer Mobile
              </button>
            </div>
          </div>

          {/* Product Search */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">
              {searchType === 'productId' ? 'Product ID' : 'Customer Mobile Number'}
            </label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder={
                    searchType === 'productId' 
                      ? "Enter Product ID (e.g., IT2025-1753904123846)" 
                      : "Enter Customer Mobile (e.g., 01979728818)"
                  }
                  className="w-full pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-400 rounded-xl border border-orange-500/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Sales List (when searching by mobile) */}
          {searchType === 'mobile' && salesData.length > 0 && (
            <div>
              <label className="block text-slate-400 text-sm mb-3">
                Select Sale to Return ({salesData.length} sales found)
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-700/30 rounded-xl p-2 bg-slate-800/20 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/50 hover:scrollbar-thumb-slate-500/50">
                {salesData.map((sale: any) => (
                  <div
                    key={sale.saleId}
                    onClick={() => selectSaleItem(sale)}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-lg p-4 cursor-pointer hover:bg-slate-700/40 transition-all duration-200 hover:border-orange-500/30"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{sale.productName}</h4>
                        <p className="text-slate-400 text-xs">Product ID: {sale.productId}</p>
                        <p className="text-slate-400 text-xs">Sale Date: {sale.dateOfSale}</p>
                        <p className="text-slate-400 text-xs">Customer: {sale.customerName || 'N/A'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-orange-400 font-medium text-sm">৳{sale.sellpricePerUnit}/{sale.unit}</p>
                        <p className="text-slate-400 text-xs">Qty: {sale.quantity} {sale.unit}</p>
                        <p className="text-green-400 text-xs">Total: ৳{sale.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2 text-center">
                Scroll to see more sales • Click any sale to process return
              </p>
            </div>
          )}

          {/* Product Details */}
          {product && (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={product.image || '/placeholder-image.png'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <p className="text-slate-400 text-sm">ID: {product.id}</p>
                  <p className="text-orange-400 font-medium">৳{product.sellpricePerUnit}/{product.unit}</p>
                  {searchType === 'productId' ? (
                    <p className="text-slate-500 text-sm">Current Stock: {product.stock} {product.unit}</p>
                  ) : (
                    <p className="text-green-500 text-sm">Sold Quantity: {product.stock} {product.unit}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Information (when available from sales data) */}
          {salesData.length > 0 && searchType === 'mobile' && (
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium text-sm mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h4>
              {salesData[0] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Name:</p>
                    <p className="text-white font-medium">{salesData[0].customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Mobile:</p>
                    <p className="text-white font-medium">{salesData[0].customerMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email:</p>
                    <p className="text-white font-medium">{salesData[0].customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Address:</p>
                    <p className="text-white font-medium">{salesData[0].customerAddress || 'N/A'}</p>
                  </div>
                </div>
              )}
              <p className="text-blue-300 text-xs mt-3 bg-blue-500/20 rounded-lg p-2">
                ℹ️ This customer information will be automatically stored with the return record.
              </p>
            </div>
          )}

          {/* Return Details */}
          {product && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-3">Return Quantity ({product.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock} // This now represents the sold quantity when selected from sales
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
                {searchType === 'mobile' && (
                  <p className="text-slate-500 text-sm mt-1">
                    Maximum returnable: {product.stock} {product.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-3">Reason for Return</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for return (e.g., damaged, expired, customer complaint)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              {/* Refund Calculation */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Refund Amount:</span>
                  <span className="text-orange-400 text-2xl font-bold">
                    ৳{totalRefund.toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {quantity} {product.unit} × ৳{product.sellpricePerUnit} = ৳{totalRefund.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-700/50 p-6 flex-shrink-0 relative">
          {/* Back to Top Button */}
          {scrollProgress > 20 && (
            <button
              onClick={scrollToTop}
              className="absolute -top-12 right-6 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-110"
              title="Back to Top"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={handleReturn}
              disabled={!product}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Process Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;