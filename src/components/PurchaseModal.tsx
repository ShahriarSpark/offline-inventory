import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Download, Trash2 } from 'lucide-react';
import { AdminPurchaseItem } from '../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseItems: AdminPurchaseItem[];
  onRemoveItem: (productId: string) => void;
  onCompletePurchase: (customDateTime?: string) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  purchaseItems,
  onRemoveItem,
  onCompletePurchase
}) => {
  const [customDateTime, setCustomDateTime] = useState('');
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);

  if (!isOpen) return null;

  const totalCost = purchaseItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalItems = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCompletePurchase = () => {
    const dateTimeToUse = useCustomDateTime && customDateTime ? customDateTime : undefined;
    onCompletePurchase(dateTimeToUse);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-slate-700/50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Purchase Summary</h2>
                <p className="text-slate-400">Review and complete your stock purchase</p>
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {purchaseItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No items in purchase order</p>
              </div>
            ) : (
                  <div className="space-y-4">
                {purchaseItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg border border-slate-600/50"
                        />
                        {item.product.brand && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                            {item.product.brand}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{item.product.name}</h3>
                            <p className="text-slate-400 text-sm">ID: {item.product.id}</p>
                            <div className="flex items-center space-x-3 mt-2">
                              {item.product.category && (
                                <span className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                                  📂 {item.product.category}
                                </span>
                              )}
                              {item.product.supplier && (
                                <span className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                                  🏪 {item.product.supplier}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-blue-400 text-sm font-medium">
                                ₹{item.product.sellpricePerUnit}/{item.product.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {item.quantity} {item.product.unit}
                        </p>
                        <p className="text-blue-400 font-bold text-lg">
                          ₹{item.totalCost.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date/Time Section */}
          {purchaseItems.length > 0 && (
            <div className="px-6 pb-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="useCustomPurchaseDateTime"
                      checked={useCustomDateTime}
                      onChange={(e) => setUseCustomDateTime(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="useCustomPurchaseDateTime" className="text-slate-400 text-sm">
                      Use custom date & time for this purchase
                    </label>
                  </div>
                  
                  {useCustomDateTime ? (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Purchase Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={customDateTime || getCurrentDateTime()}
                        onChange={(e) => setCustomDateTime(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                      <span className="text-slate-400 text-sm">Current Date & Time: </span>
                      <span className="text-blue-400 font-medium">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {purchaseItems.length > 0 && (
          <div className="bg-slate-800/30 border-t border-slate-700/50 p-6 flex-shrink-0">
            {/* Purchase Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm font-medium mb-2">📦 Items & Cost</h4>
                <p className="text-white text-lg">Items: <span className="font-bold text-blue-400">{totalItems}</span></p>
                <p className="text-white text-xl font-bold text-green-400">
                  Total: ₹{totalCost.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm font-medium mb-2">🏷️ Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(purchaseItems.map(item => item.product.category).filter(Boolean))).map(category => (
                    <span key={category} className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/30">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm font-medium mb-2">🔖 Brands</h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(purchaseItems.map(item => item.product.brand).filter(Boolean))).map(brand => (
                    <span key={brand} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCompletePurchase}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
              >
                Complete Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;