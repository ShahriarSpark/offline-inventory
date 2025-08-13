import React from 'react';
import { X, Package, User, Download, Shield, AlertTriangle } from 'lucide-react';

interface SaleItem {
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  sellpricePerUnit: number;
  totalPrice: number;
  unit: string;
  dateOfSale: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerAddress?: string;
  soldByEmail?: string;
  warrantyEndDate?: string;
  timestamp?: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  description?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  model?: string;
  sellpricePerUnit: number;
  stock: number;
  unit: string;
}

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleItem: SaleItem | null;
  products: Product[];
  onDownloadReceipt?: (saleItem: SaleItem) => void;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  isOpen,
  onClose,
  saleItem,
  products,
  onDownloadReceipt
}) => {
  if (!isOpen || !saleItem) return null;

  // Find the product details from products array
  const product = products.find(p => p.id === saleItem.productId);

  // Calculate warranty status
  const isWarrantyActive = saleItem.warrantyEndDate && new Date(saleItem.warrantyEndDate) > new Date();
  const warrantyDaysRemaining = saleItem.warrantyEndDate 
    ? Math.ceil((new Date(saleItem.warrantyEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleDownloadReceipt = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt(saleItem);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Package className="w-6 h-6 mr-3 text-cyan-400" />
            Sale Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Product Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-400" />
                Product Details
              </h3>
              
              <div className="space-y-6">
                {/* Product Image */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-xl overflow-hidden border border-slate-600 shadow-lg">
                    <img
                      src={product?.image || '/placeholder-product.png'}
                      alt={saleItem.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                </div>
                
                {/* Product Information */}
                <div className="space-y-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Product Information</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="text-slate-400 text-sm">Product Name:</span>
                        <p className="text-white font-medium">{saleItem.productName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Product ID:</span>
                        <p className="text-cyan-400 font-mono">{saleItem.productId}</p>
                      </div>
                      {product?.brand && (
                        <div>
                          <span className="text-slate-400 text-sm">Brand:</span>
                          <p className="text-white">{product.brand}</p>
                        </div>
                      )}
                      {product?.category && (
                        <div>
                          <span className="text-slate-400 text-sm">Category:</span>
                          <p className="text-white">{product.category}</p>
                        </div>
                      )}
                      {product?.model && (
                        <div>
                          <span className="text-slate-400 text-sm">Model:</span>
                          <p className="text-white">{product.model}</p>
                        </div>
                      )}
                      {product?.description && (
                        <div>
                          <span className="text-slate-400 text-sm">Description:</span>
                          <p className="text-white">{product.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Sale Information</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 text-sm">Quantity:</span>
                        <p className="text-white font-medium">{saleItem.quantity} {saleItem.unit}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Unit Price:</span>
                        <p className="text-white">৳{saleItem.sellpricePerUnit.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Total Price:</span>
                        <p className="text-green-400 font-bold text-lg">৳{saleItem.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Sale Date:</span>
                        <p className="text-white">{new Date(saleItem.dateOfSale).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warranty Status Box */}
                  {saleItem.warrantyEndDate && (
                    <div className={`rounded-xl p-4 border ${
                      isWarrantyActive 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <h4 className={`font-semibold mb-3 flex items-center ${
                        isWarrantyActive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isWarrantyActive ? (
                          <Shield className="w-5 h-5 mr-2" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 mr-2" />
                        )}
                        Warranty Status
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 text-sm">Warranty End Date:</span>
                          <p className="text-white">{new Date(saleItem.warrantyEndDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">Status:</span>
                          <p className={`font-medium ${isWarrantyActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isWarrantyActive 
                              ? `Active (${warrantyDaysRemaining} days remaining)` 
                              : `Expired (${Math.abs(warrantyDaysRemaining)} days ago)`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Customer Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-cyan-400" />
                Customer Details
              </h3>
              
              <div className="space-y-6">
                {/* Customer Avatar Placeholder */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-slate-900" />
                  </div>
                </div>
                
                {/* Customer Information */}
                <div className="space-y-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Customer Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-sm">Customer Name:</span>
                        <p className="text-white font-medium">{saleItem.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Email Address:</span>
                        <p className="text-cyan-400">{saleItem.customerEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Mobile Number:</span>
                        <p className="text-white">{saleItem.customerMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Address:</span>
                        <p className="text-white">{saleItem.customerAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Sale Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-sm">Sale ID:</span>
                        <p className="text-purple-400 font-mono">{saleItem.saleId}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-sm">Sold By:</span>
                        <p className="text-orange-400">{saleItem.soldByEmail || 'N/A'}</p>
                      </div>
                      {saleItem.timestamp && (
                        <div>
                          <span className="text-slate-400 text-sm">Transaction Time:</span>
                          <p className="text-white">{new Date(saleItem.timestamp).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warranty Status in Customer Panel */}
                  {saleItem.warrantyEndDate && (
                    <div className="bg-slate-800/30 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-3">Warranty Information</h4>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                        isWarrantyActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}>
                        {isWarrantyActive ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Warranty Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Warranty Expired
                          </>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        {isWarrantyActive 
                          ? `${warrantyDaysRemaining} days remaining`
                          : `Expired ${Math.abs(warrantyDaysRemaining)} days ago`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-300"
            >
              Close
            </button>
            {onDownloadReceipt && (
              <button
                onClick={handleDownloadReceipt}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Download Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
