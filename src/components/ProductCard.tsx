import React from 'react';
import { Star, ShoppingCart, Calendar, Package, Plus, ShoppingBag, Eye, Cpu, HardDrive, Monitor, Wifi, Edit3, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToSale?: (product: Product) => void;
  onAddToPurchase?: (product: Product) => void;
  onSeeMore?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showAddToCart?: boolean;
  showSellButton?: boolean;
  showBuyButton?: boolean;
  showSeeMore?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onAddToSale,
  onAddToPurchase,
  onSeeMore,
  onEdit,
  onDelete,
  showAddToCart = false,
  showSellButton = false,
  showBuyButton = false,
  showSeeMore = false,
  showEditButton = false,
  showDeleteButton = false,
  className = '' 
}) => {
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

  const handleAddToPurchase = () => {
    if (onAddToPurchase) {
      onAddToPurchase(product);
    }
  };

  const handleSeeMore = () => {
    if (onSeeMore) {
      onSeeMore(product);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product);
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
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 group ${className}`}>
      
      {/* Admin Action Icons - Top Right */}
      {(showEditButton || showDeleteButton) && (
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          {showEditButton && (
            <button
              onClick={handleEdit}
              className="w-8 h-8 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 hover:border-yellow-500/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group/edit"
              title="Edit Product"
            >
              <Edit3 className="w-4 h-4 text-yellow-400 group-hover/edit:text-yellow-300" />
            </button>
          )}
          {showDeleteButton && (
            <button
              onClick={handleDelete}
              className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 hover:border-red-500/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group/delete"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover/delete:text-red-300" />
            </button>
          )}
        </div>
      )}

      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/30">
          ID: {product.id}
        </div>
        {getStockStatus() === 'Low Stock' && (
          <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-orange-400/50">
            Low Stock
          </div>
        )}
        {getStockStatus() === 'Out of Stock' && (
          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-red-400/50">
            Out of Stock
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.brand && (
              <span className="text-slate-400 text-sm bg-slate-800/50 px-2 py-1 rounded-md">
                {product.brand}
              </span>
            )}
            {product.supplier && (
              <span className="text-slate-400 text-sm bg-slate-800/50 px-2 py-1 rounded-md">
                {product.supplier}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-cyan-400 fill-current" />
            <span className="text-white text-sm font-medium">{product.rating}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{new Date(product.addedDate).getFullYear()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-right">
            <span className="text-2xl font-bold text-cyan-400">৳{product.sellpricePerUnit.toLocaleString()}</span>
            <span className="text-slate-400">/{product.unit}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300 text-sm">
            <Package className="w-4 h-4" />
            <span className={`font-medium ${getStockColor()}`}>
              {getStockStatus()} {product.stock > 0 && `(${product.stock} ${product.unit})`}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30">
          <div className="flex items-center space-x-2 mb-2">
            <CategoryIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          <p className="text-slate-300 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="space-y-2">
          {showSeeMore && (
            <button
              onClick={handleSeeMore}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-slate-600/20 to-slate-500/20 hover:from-slate-600/30 hover:to-slate-500/30 text-slate-300 border border-slate-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-500/20"
            >
              <Eye className="w-5 h-5" />
              <span>See More</span>
            </button>
          )}

          {showBuyButton && (
            <button
              onClick={handleAddToPurchase}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 border border-blue-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Buy Stock</span>
            </button>
          )}

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
  );
};

export default ProductCard;