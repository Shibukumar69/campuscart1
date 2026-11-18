import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Printer,
  Package,
  CalendarDays,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, eventsRes] = await Promise.all([
          api.get('/orders/my'),
          api.get('/academic-calendar?upcomingOnly=true'),
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data.slice(0, 5));
        }
        if (eventsRes.data.success) {
          setEvents(eventsRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." />;
  }

  const activeOrders = orders.filter((o) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold tracking-wide uppercase">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Fast hostel room delivery for assignment notebooks, scientific calculators, and automated print/xerox submissions.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/marketplace"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm transition flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Stationery</span>
            </Link>
            <Link
              to="/printing"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/40 border border-white/30 text-white hover:bg-indigo-500/60 shadow-sm transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Send PDF to Print</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Exam Alert Banner */}
      {events.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3.5">
          <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Upcoming Academic Schedule: {events[0].eventTitle}
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              Starting on {new Date(events[0].startDate).toLocaleDateString()} — Ensure you have required stationery (admit card clips, blue/black pens, scientific calculators, graph sheets) before campus stock surges!
            </p>
          </div>
        </div>
      )}

      {/* Active Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-500" />
            <span>Active Campus Orders</span>
          </h2>
          <Link
            to="/student/orders"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            No active orders in transit. Ready to study? Browse the stationery marketplace!
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      #{order.orderNumber}
                    </span>
                    <Badge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.items.length} items from {order.shopId?.name} • Total: ₹{order.totalAmount}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Delivering to: {order.deliveryAddressSnapshot?.hostelBlock}, Room {order.deliveryAddressSnapshot?.roomNumber}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Link
                    to="/student/orders"
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100 transition"
                  >
                    View Status & OTP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fast Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Xerox & Document Printing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit lab assignments, report sheets, or spiral books straight from your laptop.
            </p>
            <div className="pt-2">
              <Link
                to="/printing"
                className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Upload PDF</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Printer className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hostel Room Delivery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Delivery couriers dispatched across Hostel Blocks A, B, C & Girls Hostels.
            </p>
            <div className="pt-2">
              <Link
                to="/student/orders"
                className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Check Delivery OTP</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Truck className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
};
