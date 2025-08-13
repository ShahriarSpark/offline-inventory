import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductSliderProps {
  products: Product[];
  title: string;
  onAddToCart?: (product: Product) => void;
  onAddToSale?: (product: Product) => void;
  showAddToCart?: boolean;
  showSellButton?: boolean;
  showImageSlider?: boolean;
}

// Hero images for the slider
const heroImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1554098415-4052459dc340?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Latest Technology Solutions',
    subtitle: 'Discover cutting-edge IT equipment and electronics'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Premium Computer Hardware',
    subtitle: 'High-performance components for professionals'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1682559736721-c2e77ff4c650?q=80&w=2822&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Modern Workspace Solutions',
    subtitle: 'Complete IT setups for your business needs'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1621685634155-dcb444e2ec98?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Gaming & Entertainment',
    subtitle: 'Ultimate gaming rigs and entertainment systems'
  }
];

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  products, 
  title, 
  onAddToCart, 
  onAddToSale,
  showAddToCart = false,
  showSellButton = false,
  showImageSlider = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [imageIndex, setImageIndex] = useState(0);

  // Auto-slide for image slider
  useEffect(() => {
    if (showImageSlider) {
      const interval = setInterval(() => {
        setImageIndex(prev => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [showImageSlider]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + slidesToShow >= products.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, products.length - slidesToShow) : prev - 1
    );
  };

  const nextImage = () => {
    setImageIndex(prev => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setImageIndex(prev => prev === 0 ? heroImages.length - 1 : prev - 1);
  };

  // If it's an image slider, render the hero slider
  if (showImageSlider) {
    return (
      <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-16 shadow-2xl">
        {/* Image Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${imageIndex * 100}%)` }}
        >
          {heroImages.map((image) => (
            <div
              key={image.id}
              className="min-w-full h-full relative"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="max-w-4xl px-6">
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {image.title}
                  </h1>
                  <p className="text-lg md:text-xl text-cyan-100 mb-8 drop-shadow-md">
                    {image.subtitle}
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-xl font-semibold shadow-lg">
                      FRIENDS IT ZONE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === imageIndex 
                  ? 'bg-cyan-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            width: `${(products.length / slidesToShow) * 100}%`
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="px-2"
              style={{ width: `${100 / products.length}%` }}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onAddToSale={onAddToSale}
                showAddToCart={showAddToCart}
                showSellButton={showSellButton}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;