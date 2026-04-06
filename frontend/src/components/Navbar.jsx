import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display text-xl font-bold text-gray-900">CultureConnect</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>
            <a href="/#events" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Events
            </a>
            <a href="/#categories" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Categories
            </a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/my-bookings" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  My Bookings
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition-colors">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{user.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/my-bookings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Bookings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-primary-600 font-medium">
              Home
            </Link>
            <a href="/#events" className="block text-gray-700 hover:text-primary-600 font-medium">
              Events
            </a>
            <a href="/#categories" className="block text-gray-700 hover:text-primary-600 font-medium">
              Categories
            </a>
            {user ? (
              <>
                <Link to="/my-bookings" className="block text-gray-700 hover:text-primary-600 font-medium">
                  My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="block bg-primary-500 text-white px-4 py-2 rounded-lg font-medium text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
