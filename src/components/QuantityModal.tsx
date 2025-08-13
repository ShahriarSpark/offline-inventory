import React, { useState } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { Product } from '../types';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number) => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= product.stock) {
      onConfirm(quantity);
      setQuantity(1);
      onClose();
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalPrice = quantity * product.sellpricePerUnit;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Select Quantity</h2>
                <p className="text-slate-400 text-sm">Choose amount to sell</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
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
                <p className="text-emerald-400 font-medium">
                 Buy Price: ৳{product.buypricePerUnit}/{product.unit}
                </p>
                <p className="text-emerald-400 font-medium">
                 Sell Price: ৳{product.sellpricePerUnit}/{product.unit}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-3">
                Quantity ({product.unit})
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
                  disabled={quantity >= product.stock}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-slate-400 text-sm">
                  Available: {product.stock} {product.unit}
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex flex-col items-center justify-between">
                <span className="text-white font-medium mb-1">Total Price:</span>
                <span className="text-emerald-400 text-2xl font-bold mb-1">
                  ৳{totalPrice.toFixed(2)}
                </span>
                <span className="text-slate-400 text-sm">
                  {quantity} {product.unit} × ৳{product.sellpricePerUnit} = ৳{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Add to Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;