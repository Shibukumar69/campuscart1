import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Printer, ShoppingBag, Clock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

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

  const navItems = [
    {
      label: 'Store',
      path: '/marketplace',
      icon: BookOpen,
      isActive: location.pathname === '/marketplace' || location.pathname === '/',
    },
    {
      label: 'Smart Print',
      path: '/printing',
      icon: Printer,
      isActive: location.pathname.startsWith('/printing'),
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: itemCount > 0 ? itemCount : null,
      isActive: location.pathname === '/cart' || location.pathname === '/checkout',
    },
    {
      label: 'Orders',
      path: isAuthenticated ? (user?.role === 'STUDENT' ? '/student/orders' : getDashboardLink()) : '/login',
      icon: Clock,
      isActive: location.pathname.includes('/orders'),
    },
    {
      label: isAuthenticated ? (user?.name ? user.name.split(' ')[0] : 'Account') : 'Sign In',
      path: isAuthenticated ? getDashboardLink() : '/login',
      icon: User,
      isActive: location.pathname.includes('/dashboard') || location.pathname === '/login',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-2xl px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-extrabold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
