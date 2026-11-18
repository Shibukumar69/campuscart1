import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Printer,
  Search,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { MobileBottomNav } from './MobileBottomNav';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SHOP_OWNER':
        return '/vendor/dashboard';
      case 'DELIVERY_AGENT':
        return '/delivery/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  CampusCart AI
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                  Stationery & Printing
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/marketplace"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition"
            >
              Marketplace
            </Link>
            <Link
              to="/printing"
              className="flex items-center space-x-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition"
            >
              <Printer className="w-4 h-4 text-indigo-500" />
              <span>Smart Print & Xerox</span>
            </Link>
            <Link
              to="/how-it-works"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition"
            >
              About
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Shopping Cart Icon (Students / Guests) */}
            {(!isAuthenticated || user?.role === 'STUDENT') && (
              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <Badge status={user?.role} className="hidden lg:inline-flex text-[10px] py-0 px-1.5" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        <Badge status={user?.role} />
                      </div>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>Role Dashboard</span>
                    </Link>

                    {user?.role === 'STUDENT' && (
                      <Link
                        to="/student/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-slate-900">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Marketplace
          </Link>
          <Link
            to="/printing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Smart Print & Xerox
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            About CampusCart AI
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400"
            >
              Go to Dashboard ({user?.role})
            </Link>
          )}
        </div>
      )}
    </header>
    {/* Modern Native App Style Bottom Navigation for Mobile Devices */}
    <MobileBottomNav />
    </>
  );
};
