import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar, getRoleNavLinks } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const links = getRoleNavLinks(user?.role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Navbar />

      {/* Mobile & Tablet Horizontal Role Sub-Navigation (Screen < lg) */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs px-3 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar touch-pan-x">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
};
