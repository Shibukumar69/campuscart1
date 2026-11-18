import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShoppingBag,
  TrendingUp,
  Brain,
  AlertTriangle,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [invRes, ordersRes, lowRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/orders/shop'),
          api.get('/inventory/low-stock'),
        ]);

        if (invRes.data.success) setInventory(invRes.data.data);
        if (ordersRes.data.success) setOrders(ordersRes.data.data);
        if (lowRes.data.success) setLowStock(lowRes.data.data);
      } catch (err) {
        console.error('Failed to load vendor dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading vendor analytics & inventory..." />;
  }

  // Stock health counters
  const criticalCount = inventory.filter((i) => i.currentStock <= 0).length;
  const warningCount = inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold).length;
  const healthyCount = inventory.filter((i) => i.currentStock > i.minStockThreshold).length;

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.shop?.name || 'Vendor Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time inventory health, ML-based demand predictions, and campus delivery orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/vendor/forecasting"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition"
          >
            <Brain className="w-4 h-4" />
            <span>AI Demand Forecast</span>
          </Link>
          <Link
            to="/vendor/reorder-advice"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center space-x-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Reorder Advisor</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue (Completed)"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="emerald"
          subtitle="From campus sales"
        />
        <StatCard
          title="Total Store Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="indigo"
          subtitle={`${completedOrders.length} completed`}
        />
        <StatCard
          title="Total Catalog SKUs"
          value={inventory.length}
          icon={Boxes}
          color="purple"
          subtitle="Managed in stock"
        />
        <StatCard
          title="Stock Alerts"
          value={criticalCount + warningCount}
          icon={AlertTriangle}
          color={criticalCount > 0 ? 'rose' : warningCount > 0 ? 'amber' : 'emerald'}
          subtitle={`${criticalCount} stockout, ${warningCount} reorder`}
        />
      </div>

      {/* Stock Health Visual Distribution Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Inventory Stock Health Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Health states calculated against lead-time velocity and safety thresholds.
            </p>
          </div>
          <Link
            to="/vendor/inventory"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Color Health Bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${inventory.length > 0 ? (healthyCount / inventory.length) * 100 : 100}%` }}
            className="bg-emerald-500"
            title="Healthy Stock"
          />
          <div
            style={{ width: `${inventory.length > 0 ? (warningCount / inventory.length) * 100 : 0}%` }}
            className="bg-amber-500"
            title="Warning Stock"
          />
          <div
            style={{ width: `${inventory.length > 0 ? (criticalCount / inventory.length) * 100 : 0}%` }}
            className="bg-rose-500"
            title="Critical Stock"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
              Green: Healthy Stock
            </span>
            <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200">{healthyCount} items</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">
              Amber: Approaching Reorder
            </span>
            <span className="text-lg font-extrabold text-amber-900 dark:text-amber-200">{warningCount} items</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 block">
              Red: Critical / Stockout
            </span>
            <span className="text-lg font-extrabold text-rose-900 dark:text-rose-200">{criticalCount} items</span>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Campus Orders</h3>
          <Link
            to="/vendor/orders"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{order.orderNumber}</span>
                    <Badge status={order.status} />
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {order.studentId?.name} ({order.deliveryAddressSnapshot?.hostelBlock}) • {order.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">₹{order.totalAmount}</span>
                  <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
