import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Brain,
  TrendingUp,
  Printer,
  Truck,
  CalendarDays,
  FileText,
  Users,
  ShieldCheck,
  Package,
  Clock,
  Settings,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Student Home' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Browse Stationery' },
  { to: '/printing', icon: Printer, label: 'Upload for Printing' },
  { to: '/student/orders', icon: Package, label: 'My Orders & OTP' },
  { to: '/student/print-jobs', icon: FileText, label: 'My Print Jobs' },
];

export const vendorLinks = [
  { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Vendor Overview' },
  { to: '/vendor/products', icon: Package, label: 'Products & Catalog' },
  { to: '/vendor/inventory', icon: Boxes, label: 'Inventory & Stock' },
  { to: '/vendor/ledger', icon: FileSpreadsheet, label: 'Inventory Ledger' },
  { to: '/vendor/forecasting', icon: Brain, label: 'AI Demand Forecast' },
  { to: '/vendor/reorder-advice', icon: TrendingUp, label: 'Reorder Advisor & POs' },
  { to: '/vendor/orders', icon: ShoppingBag, label: 'Store Orders' },
  { to: '/vendor/printing-queue', icon: Printer, label: 'Printing Queue' },
];

export const deliveryLinks = [
  { to: '/delivery/dashboard', icon: LayoutDashboard, label: 'Delivery Center' },
  { to: '/delivery/orders', icon: Truck, label: 'Assigned Deliveries' },
];

export const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Platform Metrics' },
  { to: '/admin/users', icon: Users, label: 'User Directory' },
  { to: '/admin/approvals', icon: ShieldCheck, label: 'Vendor Approvals' },
  { to: '/admin/calendar', icon: CalendarDays, label: 'Academic Calendar' },
  { to: '/admin/audit-logs', icon: Clock, label: 'System Audit Logs' },
];

export const getRoleNavLinks = (role) => {
  if (role === 'SHOP_OWNER') return vendorLinks;
  if (role === 'DELIVERY_AGENT') return deliveryLinks;
  if (role === 'ADMIN') return adminLinks;
  return studentLinks;
};

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;
  const links = getRoleNavLinks(role);

  return (
    <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role banner */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize mt-0.5">
          {role.replace('_', ' ').toLowerCase()} Portal
        </p>
        {user.shop && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
            {user.shop.name}
          </p>
        )}
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Helper card */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Campus Dispatch</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Need campus delivery assistance? Contact security booth ext: 4040.
        </p>
      </div>
    </aside>
  );
};
