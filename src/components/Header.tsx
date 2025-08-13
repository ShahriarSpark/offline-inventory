import React from 'react';
import { User, ShoppingCart, Home, Info, Mail, Grid, Monitor } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';

interface HeaderProps {
  onProfileClick: () => void;
  onNavigate: (section: string) => void;
  currentSection: string;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onNavigate, currentSection, cartItemCount }) => {
  const user = getCurrentUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Monitor className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FRIENDS IT ZONE</h1>
              <p className="text-xs text-cyan-400">Electronics & IT Solutions</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'home'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'about'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'contact'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                currentSection === 'categories'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Categories</span>
            </button>
          </nav>

          {/* User Profile & Cart */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => onNavigate('cart')}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm relative"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              {user && (
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-cyan-400 text-sm">{user.points} points</p>
                </div>
              )}
              <button
                onClick={onProfileClick}
                className="p-3 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-500/30 rounded-xl border border-cyan-400/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-lg shadow-cyan-500/10"
              >
                <User className="w-5 h-5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;