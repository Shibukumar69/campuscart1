import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, KeyRound, Truck, ArrowRight, Home } from 'lucide-react';

export const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/student/orders" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Order Number: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{order.orderNumber}</span>
          </p>
        </div>

        {/* Highlighted Delivery OTP Card */}
        {order.deliveryOtp && (
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <KeyRound className="w-4 h-4" />
              <span>YOUR DELIVERY OTP (SHARE WITH COURIER)</span>
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 py-1 select-all">
              {order.deliveryOtp}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When the campus courier reaches {order.deliveryAddressSnapshot?.hostelBlock}, provide this 6-digit PIN to complete the handover.
            </p>
          </div>
        )}

        {/* Order Details Mini breakdown */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-slate-500">Destination:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {order.deliveryAddressSnapshot?.hostelBlock}, Room {order.deliveryAddressSnapshot?.roomNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">₹{order.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/student/orders"
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
