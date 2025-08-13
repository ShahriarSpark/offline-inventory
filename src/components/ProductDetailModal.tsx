import React from 'react';
import { X, Package, Calendar, Star, Tag, Building2, ShoppingCart, Plus, Cpu, HardDrive, Monitor, Wifi } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart?: (product: Product) => void;
  onAddToSale?: (product: Product) => void;
  showAddToCart?: boolean;
  showSellButton?: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToSale,
  showAddToCart = false,
  showSellButton = false
}) => {
  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (onAddToCart && product.stock > 0) {
      onAddToCart(product);
    }
  };

  const handleAddToSale = () => {
    if (onAddToSale && product.stock > 0) {
      onAddToSale(product);
    }
  };

  const getStockColor = () => {
    if (product.stock === 0) return 'text-red-400';
    if (product.stock <= 10) return 'text-red-400';
    if (product.stock <= 25) return 'text-orange-400';
    return 'text-green-400';
  };

  const getStockStatus = () => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= 10) return 'Low Stock';
    if (product.stock <= 25) return 'Medium Stock';
    return 'In Stock';
  };

  const getCategoryIcon = () => {
    switch (product.category) {
      case 'Computing': return Cpu;
      case 'Storage': return HardDrive;
      case 'Monitors': return Monitor;
      case 'Networking': return Wifi;
      default: return Package;
    }
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <CategoryIcon className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Product Details</h2>
                <p className="text-slate-400">Complete product specifications</p>
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

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30">
                  ID: {product.id}
                </div>
                {product.stock <= 10 && product.stock > 0 && (
                  <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-orange-400/50">
                    {getStockStatus()}
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-red-400/50">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Stock Status:</span>
                  <span className={`font-bold ${getStockColor()}`}>
                    {product.stock > 0 ? `${getStockStatus()}: ${product.stock} ${product.unit}` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-cyan-400 fill-current" />
                    <span className="text-white font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(product.addedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-cyan-400 mb-4">
                  ৳{product.sellpricePerUnit.toLocaleString()}/{product.unit}
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400 text-sm">Category</span>
                  </div>
                  <span className="text-white font-medium">{product.category}</span>
                </div>

                {product.brand && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400 text-sm">Brand</span>
                    </div>
                    <span className="text-white font-medium">{product.brand}</span>
                  </div>
                )}

                {product.supplier && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400 text-sm">Supplier</span>
                    </div>
                    <span className="text-white font-medium">{product.supplier}</span>
                  </div>
                )}

                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400 text-sm">Unit</span>
                  </div>
                  <span className="text-white font-medium">{product.unit}</span>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <p className="text-slate-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {showSellButton && (
                  <button
                    onClick={handleAddToSale}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      product.stock > 0
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 border border-cyan-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>{product.stock > 0 ? 'Add to Sale' : 'Out of Stock'}</span>
                  </button>
                )}

                {showAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      product.stock > 0
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-400 border border-purple-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;