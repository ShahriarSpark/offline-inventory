import { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SellerDashboard from './components/SellerDashboard';
import UserDashboard from './components/UserDashboard';
import PublicView from './components/PublicView';
import { User, CartItem } from './types';
import { validateUserSession, getCurrentUser, logout } from './utils/auth';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Validate the current session
        if (validateUserSession()) {
          const currentUser = getCurrentUser(); // getCurrentUser is not imported, assuming it's a placeholder
          if (currentUser && currentUser.id && currentUser.email) {
            setUser(currentUser);
          } else {
            // Clear any invalid cached data
            logout(); // logout is not imported, assuming it's a placeholder
            setUser(null);
          }
        } else {
          // No valid session, ensure clean state
          logout(); // logout is not imported, assuming it's a placeholder
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any corrupted data
        logout(); // logout is not imported, assuming it's a placeholder
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLogin(false);
  };

  const handleLogout = () => {
    logout(); // This will clear all data
    setUser(null);
    setCurrentSection('home');
    setCart([]);
  };

  const handleProfileClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      // User is logged in, navigate to appropriate dashboard
      setCurrentSection('dashboard');
    }
  };

  const handleNavigate = (section: string) => {
    if (section === 'cart' && user) {
      setCurrentSection('dashboard'); // Navigate to user dashboard, cart tab will be handled there
    } else {
      setCurrentSection(section);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header
          onProfileClick={handleProfileClick}
          onNavigate={handleNavigate}
          currentSection={currentSection}
          cartItemCount={cartItemCount}
        />

        {showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}

        {user && currentSection === 'dashboard' ? (
          user.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : user.role === 'seller' ? (
            <SellerDashboard user={user} onLogout={handleLogout} />
          ) : (
            <UserDashboard onLogout={handleLogout} />
          )
        ) : (
          <PublicView currentSection={currentSection} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;