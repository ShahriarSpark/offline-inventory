import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Minus, Package, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface PurchaseQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number, buyPrice?: number, sellPrice?: number) => void;
}

const PurchaseQuantityModal: React.FC<PurchaseQuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customBuyPrice, setCustomBuyPrice] = useState('');
  const [customSellPrice, setCustomSellPrice] = useState('');
  const [useCustomBuyPrice, setUseCustomBuyPrice] = useState(false);
  const [useCustomSellPrice, setUseCustomSellPrice] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAllData, setShowAllData] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const totalScrollableHeight = scrollHeight - clientHeight;
        const progress = totalScrollableHeight > 0 ? (scrollTop / totalScrollableHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !scrollRef.current) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          scrollRef.current.scrollBy({ top: -50, behavior: 'smooth' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          scrollRef.current.scrollBy({ top: 50, behavior: 'smooth' });
          break;
        case 'PageUp':
          e.preventDefault();
          scrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
          break;
        case 'PageDown':
          e.preventDefault();
          scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
          break;
        case 'Home':
          e.preventDefault();
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          break;
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    if (quantity > 0) {
      const buyPrice = useCustomBuyPrice && customBuyPrice ? parseFloat(customBuyPrice) : undefined;
      const sellPrice = useCustomSellPrice && customSellPrice ? parseFloat(customSellPrice) : undefined;
      onConfirm(quantity, buyPrice, sellPrice);
      setQuantity(1);
      setCustomBuyPrice('');
      setCustomSellPrice('');
      setUseCustomBuyPrice(false);
      setUseCustomSellPrice(false);
      onClose();
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const finalBuyPrice = useCustomBuyPrice && customBuyPrice ? parseFloat(customBuyPrice) : product.buypricePerUnit;
  const finalSellPrice = useCustomSellPrice && customSellPrice ? parseFloat(customSellPrice) : product.sellpricePerUnit;
  const totalCost = quantity * finalBuyPrice;

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        .data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .data-item {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-blue-500/20 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Purchase Stock</h2>
                <p className="text-slate-400 text-sm">Set quantity and price • Scroll to view all data • Use ↑↓ PgUp PgDn Home End</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          {/* Scroll Progress Bar */}
          <div className="mt-4 w-full bg-white/10 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {/* Set Buy Price Purchase Stock Value */}
        <div ref={scrollRef} className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Data Overview Section - Mouse Square Mode */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Complete Data Overview
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAllData(!showAllData)}
                  className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors"
                >
                  {showAllData ? 'Collapse' : 'Expand'}
                </button>
                <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                  Mouse Square Mode
                </span>
              </div>
            </div>
            
            {showAllData && (
              <div className="data-grid">
              <div className="data-item">
                <div className="text-slate-400 text-xs">Product ID</div>
                <div className="text-white font-medium">{product.id}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Current Stock</div>
                <div className="text-blue-400 font-medium">{product.stock} {product.unit}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Default Buy Price</div>
                <div className="text-blue-400 font-medium">৳{product.buypricePerUnit}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Default Sell Price</div>
                <div className="text-green-400 font-medium">৳{product.sellpricePerUnit}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Purchase Quantity</div>
                <div className="text-white font-medium">{quantity} {product.unit}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Final Buy Price</div>
                <div className="text-blue-400 font-medium">৳{finalBuyPrice.toFixed(2)}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Final Sell Price</div>
                <div className="text-green-400 font-medium">৳{finalSellPrice.toFixed(2)}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Total Purchase Cost</div>
                <div className="text-yellow-400 font-bold">৳{totalCost.toFixed(2)}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Expected Revenue</div>
                <div className="text-green-400 font-medium">৳{(quantity * finalSellPrice).toFixed(2)}</div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Expected Profit</div>
                <div className={`font-medium ${(finalSellPrice - finalBuyPrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ৳{((finalSellPrice - finalBuyPrice) * quantity).toFixed(2)}
                </div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">Profit Margin</div>
                <div className={`font-medium ${(finalSellPrice - finalBuyPrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {finalBuyPrice > 0 ? (((finalSellPrice - finalBuyPrice) / finalBuyPrice) * 100).toFixed(1) : '0.0'}%
                </div>
              </div>
              <div className="data-item">
                <div className="text-slate-400 text-xs">New Stock Total</div>
                <div className="text-cyan-400 font-medium">{product.stock + quantity} {product.unit}</div>
              </div>
            </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-white font-semibold">{product.name}</h3>
                <p className="text-slate-400 text-sm">ID: {product.id}</p>
                <p className="text-blue-400 font-medium">
                  Current Stock: {product.stock} {product.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-3">
                Purchase Quantity ({product.unit})
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5 text-white" />
                </button>
                
                <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-3 min-w-[100px] text-center">
                  <span className="text-white text-xl font-bold">{quantity}</span>
                </div>
                
                <button
                  onClick={incrementQuantity}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Buy Price Section */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="useCustomBuyPrice"
                  checked={useCustomBuyPrice}
                  onChange={(e) => setUseCustomBuyPrice(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="useCustomBuyPrice" className="text-slate-400 text-sm">
                  Use custom buy price
                </label>
              </div>
              
              {useCustomBuyPrice ? (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Buy Price per {product.unit}
                  </label>
                  <input
                    type="number"
                    value={customBuyPrice}
                    onChange={(e) => setCustomBuyPrice(e.target.value)}
                    placeholder={`Default: ৳${product.buypricePerUnit}`}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
                  />
                </div>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <span className="text-slate-400 text-sm">Default Buy Price: </span>
                  <span className="text-blue-400 font-medium">৳{product.buypricePerUnit}/{product.unit}</span>
                </div>
              )}
            </div>

            {/* Sell Price Section */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="useCustomSellPrice"
                  checked={useCustomSellPrice}
                  onChange={(e) => setUseCustomSellPrice(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="useCustomSellPrice" className="text-slate-400 text-sm">
                  Use custom sell price
                </label>
              </div>
              
              {useCustomSellPrice ? (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Sell Price per {product.unit}
                  </label>
                  <input
                    type="number"
                    value={customSellPrice}
                    onChange={(e) => setCustomSellPrice(e.target.value)}
                    placeholder={`Default: ৳${product.sellpricePerUnit}`}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition-all"
                  />
                </div>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <span className="text-slate-400 text-sm">Default Sell Price: </span>
                  <span className="text-green-400 font-medium">৳{product.sellpricePerUnit}/{product.unit}</span>
                </div>
              )}
            </div>
{/* Total Cost Calculation */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Total Purchase Cost:</span>
                <span className="text-blue-400 text-2xl font-bold">
                  ৳{totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {quantity} {product.unit} × ৳{finalBuyPrice.toFixed(2)} = ৳{totalCost.toFixed(2)}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Expected Sell Price:</span>
                  <span className="text-green-400 font-medium">৳{finalSellPrice.toFixed(2)}/{product.unit}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-slate-400">Expected Revenue:</span>
                  <span className="text-green-400 font-medium">৳{(quantity * finalSellPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-slate-400">Expected Profit:</span>
                  <span className={`font-medium ${(finalSellPrice - finalBuyPrice) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ৳{((finalSellPrice - finalBuyPrice) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6 flex-shrink-0">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Add to Purchase
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseQuantityModal;