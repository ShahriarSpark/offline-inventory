import React, { useState, useEffect } from 'react';
import { Search, Star, Package, ShoppingCart, Mail, Monitor, ChevronDown, Filter, X } from 'lucide-react';
import { getProducts, getCategories } from '../utils/storage';
import { Product, ProductFilters } from '../types';
import ProductCard from './ProductCard';
import ProductSlider from './ProductSlider';
import ProductDetailModal from './ProductDetailModal';

interface PublicViewProps {
  currentSection: string;
}

const PublicView: React.FC<PublicViewProps> = ({ currentSection }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    priceRange: null,
    availability: 'all',
    brand: ''
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        try {
          // Search by ID or name
          const results = products.filter(product => 
            product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(results);
          
          // Calculate pagination for search results
          const totalPages = Math.ceil(results.length / itemsPerPage);
          setTotalPages(totalPages);
          setCurrentPage(1); // Reset to first page on new search
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } else {
        setSearchResults([]);
        // Calculate pagination for all products
        const totalPages = Math.ceil(products.length / itemsPerPage);
        setTotalPages(totalPages);
        setCurrentPage(1);
      }
    };
    performSearch();
  }, [searchQuery, products]);

  useEffect(() => {
    const applyFiltersAndPagination = async () => {
      let filteredProducts = products;
      
      // Use search results if there's a search query
      if (searchQuery.trim() && searchResults.length > 0) {
        filteredProducts = searchResults;
      }
      
      // Apply additional filters
      if (filters.category || filters.priceRange || filters.availability !== 'all' || filters.brand) {
        filteredProducts = filteredProducts.filter(product => {
          // Category filter
          if (filters.category && product.category !== filters.category) return false;
          
          // Price range filter
          if (filters.priceRange) {
            if (product.sellpricePerUnit < filters.priceRange.min || product.sellpricePerUnit > filters.priceRange.max) return false;
          }
          
          // Availability filter
          if (filters.availability === 'in-stock' && product.stock === 0) return false;
          if (filters.availability === 'out-of-stock' && product.stock > 0) return false;
          
          // Brand filter
          if (filters.brand && product.brand !== filters.brand) return false;
          
          return true;
        });
      }

      // Sort products - out of stock at the end
      const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (a.stock === 0 && b.stock > 0) return 1;
        if (a.stock > 0 && b.stock === 0) return -1;
        return 0;
      });
      
      // Calculate total pages
      const totalItems = sortedProducts.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPages);
      
      // Get items for current page
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      setDisplayedProducts(paginatedProducts);
    };
    
    applyFiltersAndPagination();
  }, [products, searchResults, searchQuery, filters, currentPage]);

  const featuredProducts = products.filter(p => p.rating >= 4.7).slice(0, 6);
  const newProducts = products.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).slice(0, 6);
  
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const handleSeeMore = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: null,
      availability: 'all',
      brand: ''
    });
  };

  if (currentSection === 'about') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                About FRIENDS IT ZONE
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 shadow-lg shadow-cyan-500/10">
                <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  FRIENDS IT ZONE is your trusted partner for all IT and electronics needs. 
                  We provide cutting-edge technology solutions, from computers and networking equipment 
                  to storage devices and accessories, serving both individuals and businesses with 
                  quality products at competitive prices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-slate-900" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Latest Technology</h3>
                  <p className="text-slate-300">
                    Stay ahead with the newest computers, laptops, and IT equipment from top brands.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Quality Assured</h3>
                  <p className="text-slate-300">
                    All products are genuine, tested, and come with proper warranty coverage.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Expert Support</h3>
                  <p className="text-slate-300">
                    Professional technical support and consultation for all your IT requirements.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Easy Shopping</h3>
                  <p className="text-slate-300">
                    Convenient online browsing with detailed specifications and competitive pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSection === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Contact Us
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8"></div>
              <p className="text-slate-300 text-lg">
                Get in touch with our IT experts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 shadow-lg shadow-cyan-500/10">
                <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Email Support</h3>
                      <p className="text-slate-400">support@friendsitzone.com</p>
                    </div>
                  </div>
                  <p className="text-slate-300">
                    Get help with products, technical support, and general inquiries.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Store Hours</h3>
                  <div className="space-y-2 text-slate-300">
                    <p>Saturday - Thursday: 9:00 AM - 9:00 PM</p>
                    <p>Friday: 2:00 PM - 9:00 PM</p>
                    <p>Public Holidays: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <h3 className="text-lg font-bold text-white mb-4">Our Services</h3>
                  <div className="space-y-2 text-slate-300">
                    <p>• Computer Sales & Service</p>
                    <p>• Network Setup & Configuration</p>
                    <p>• Technical Support</p>
                    <p>• Warranty & Repair Services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSection === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Product Categories
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-8"></div>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 mb-8 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name} className="bg-slate-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand} className="bg-slate-800">
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
                  >
                    <option value="all" className="bg-slate-800">All Products</option>
                    <option value="in-stock" className="bg-slate-800">In Stock</option>
                    <option value="out-of-stock" className="bg-slate-800">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSeeMore={handleSeeMore}
                showSeeMore={true}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg border font-medium transition-all duration-300 ${
                        pageNum === currentPage
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/25'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-cyan-400/50'
                      }`}
                    >
                      {pageNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                <span>Next</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          )}

          {/* Products Info */}
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products.length)}-{Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-cyan-400/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join our community and discover the latest in IT technology. Create an account to start shopping 
            and earn loyalty points with every purchase from FRIENDS IT ZONE.
          </p>
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Login required to purchase items</span>
          </div>
        </div>

        {/* Shop Information Footer */}
        <div className="bg-gradient-to-r from-slate-800/40 to-blue-800/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 mt-16 shadow-lg shadow-cyan-500/10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">FRIENDS IT ZONE</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Proprietors</h3>
              <p className="text-white text-sm">KAJAL BISWAS</p>
              <p className="text-white text-sm">ASHRAFUL ALAM TANIM</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Location</h3>
              <p className="text-white text-sm">HARINAKUNDA UPAZILA MORE</p>
              <p className="text-white text-sm">MASTER MARKET 2</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Contact</h3>
              <p className="text-white text-sm">01718000117</p>
              <p className="text-white text-sm">01947533013</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Currency</h3>
              <p className="text-white text-sm">All prices in</p>
              <p className="text-cyan-400 font-bold">Bangladeshi Taka (৳)</p>
            </div>
          </div>
        </div>

        <ProductDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          product={selectedProduct}
        />
      </div>
    );
  }

  // Default home view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            FRIENDS IT ZONE
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Your Premier Destination for IT Electronics & Technology Solutions
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
        </div>

        {/* Hero Image Slider */}
        <ProductSlider products={[]} title="" showImageSlider={true} />

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 mb-16 shadow-lg shadow-cyan-500/10">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for routers, computers, SSDs, monitors, and more..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
            />
          </div>
          
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Search Results ({searchResults.length} found)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.slice(0, 12).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onSeeMore={handleSeeMore}
                    showSeeMore={true}
                  />
                ))}
              </div>
              {searchResults.length > 12 && (
                <div className="text-center mt-6">
                  <p className="text-slate-400 text-sm">
                    Showing first 12 results. Use specific search terms for better results.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured Products Slider */}
        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <ProductSlider
              products={featuredProducts}
              title="⭐ Top Rated Electronics"
            />
          </div>
        )}

        {/* New Products Slider */}
        {newProducts.length > 0 && (
          <div className="mb-16">
            <ProductSlider
              products={newProducts}
              title="🆕 Latest Arrivals"
            />
          </div>
        )}

        {/* All Products Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Complete Electronics Catalog
          </h2>

          {/* Product Navigation Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <div className="text-blue-200">
                <p className="font-medium">📄 Product Navigation</p>
                <p className="text-sm text-blue-300">
                  By default, Page 1 shows 20 products. To see more, click <strong>Next</strong> or select pages <strong>2, 3, etc.</strong> to view the remaining products.
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products.length)}-{Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSeeMore={handleSeeMore}
                showSeeMore={true}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === 1
                    ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                <span>Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg border font-medium transition-all duration-300 ${
                        pageNum === currentPage
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/25'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-cyan-400/50'
                      }`}
                    >
                      {pageNum.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'bg-slate-800 text-slate-500 border-slate-600 cursor-not-allowed'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30 hover:scale-[1.02]'
                }`}
              >
                <span>Next</span>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          )}

          {/* Products Info */}
          <div className="text-center mt-8">
            <p className="text-slate-400 text-sm">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products.length)}-{Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-cyan-400/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join our community and discover the latest in IT technology. Create an account to start shopping 
            and earn loyalty points with every purchase from FRIENDS IT ZONE.
          </p>
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Login required to purchase items</span>
          </div>
        </div>

        {/* Shop Information Footer */}
        <div className="bg-gradient-to-r from-slate-800/40 to-blue-800/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 mt-16 shadow-lg shadow-cyan-500/10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">FRIENDS IT ZONE</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Proprietors</h3>
              <p className="text-white text-sm">KAJAL BISWAS</p>
              <p className="text-white text-sm">ASHRAFUL ALAM TANIM</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Location</h3>
              <p className="text-white text-sm">HARINAKUNDA UPAZILA MORE</p>
              <p className="text-white text-sm">MASTER MARKET 2</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Contact</h3>
              <p className="text-white text-sm">01718000117</p>
              <p className="text-white text-sm">01947533013</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="text-cyan-400 font-bold mb-2">Currency</h3>
              <p className="text-white text-sm">All prices in</p>
              <p className="text-cyan-400 font-bold">Bangladeshi Taka (৳)</p>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default PublicView;