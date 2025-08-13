import { useMemo } from "react";
import { Layers, Tag, Barcode, Search, Filter, SortAsc, X } from "lucide-react";
import { Product } from "../types";

interface ProductFilterBarProps {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  onClearFilters?: () => void;
}

export default function ProductFilterBar({
  products,
  searchTerm,
  setSearchTerm,
  selectedCategory, setSelectedCategory,
  selectedBrand, setSelectedBrand,
  selectedModel, setSelectedModel,
  sortBy = '',
  setSortBy = () => {},
  onClearFilters = () => {}
}: ProductFilterBarProps) {
  // Unique options for each dropdown, filtered by previous selections
  const categoryOptions = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );
  const brandOptions = useMemo(
    () => [...new Set(products.filter(p =>
      selectedCategory && p.category === selectedCategory
    ).map(p => p.brand).filter(Boolean))],
    [products, selectedCategory]
  );
  const modelOptions = useMemo(
    () => [...new Set(products.filter(p =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedBrand || p.brand === selectedBrand)
    ).map(p => p.model).filter(Boolean))],
    [products, selectedCategory, selectedBrand]
  );

  return (
    <div className="w-full space-y-4">
      {/* Search Box */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 shadow-lg shadow-cyan-500/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product ID or Name..."
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
          />
        </div>
      </div>



      {/* Filters and Sorting in One Row */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <span>Filters & Sort</span>
          </h3>
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-300 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Category */}
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedBrand("");
                setSelectedModel("");
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all backdrop-blur-sm text-sm"
            >
              <option value="" className="bg-slate-800">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <select
              value={selectedBrand}
              onChange={e => {
                setSelectedBrand(e.target.value);
                setSelectedModel("");
              }}
              disabled={!selectedCategory}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm text-sm"
            >
              <option value="" className="bg-slate-800">All Brands</option>
              {brandOptions.map(brand => (
                <option key={brand} value={brand} className="bg-slate-800">{brand}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm text-sm"
            >
              <option value="" className="bg-slate-800">All Models</option>
              {modelOptions.map(model => (
                <option key={model} value={model} className="bg-slate-800">{model}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative lg:col-span-2">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all backdrop-blur-sm text-sm"
            >
              <option value="" className="bg-slate-800">Default Order</option>
              <option value="name-asc" className="bg-slate-800">Name A-Z</option>
              <option value="name-desc" className="bg-slate-800">Name Z-A</option>
              <option value="price-asc" className="bg-slate-800">Price Low to High</option>
              <option value="price-desc" className="bg-slate-800">Price High to Low</option>
              <option value="stock-asc" className="bg-slate-800">Stock Low to High</option>
              <option value="stock-desc" className="bg-slate-800">Stock High to Low</option>
              <option value="newest" className="bg-slate-800">Newest First</option>
              <option value="oldest" className="bg-slate-800">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 