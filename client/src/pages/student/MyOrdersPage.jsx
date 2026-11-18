import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, Store, KeyRound, Copy, Check, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedOrder(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders found"
        description="You have not placed any stationery orders yet."
        actionLabel="Browse Stationery Marketplace"
        actionLink="/marketplace"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Orders & Deliveries</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track live dispatch status, view historical receipts, and get your handover verification OTP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Orders List Column */}
        <div className="lg:col-span-1 space-y-3">
          {orders.map((order) => {
            const isSelected = selectedOrder?._id === order._id;
            return (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    #{order.orderNumber}
                  </span>
                  <Badge status={order.status} />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {order.shopId?.name}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span>{order.items.length} items</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Order Detailed View */}
        {selectedOrder && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-mono">Order Details</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge status={selectedOrder.status} className="self-start sm:self-auto text-xs py-1 px-3" />
            </div>

            {/* Delivery Verification PIN Card for Student */}
            {selectedOrder.deliveryOtp && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-indigo-500/30 dark:border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Handover Verification OTP</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center space-x-1">
                    <span>Share with Courier Agent</span>
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your 6-Digit Delivery PIN</p>
                    <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-indigo-600 dark:text-indigo-400 select-all">
                      {selectedOrder.deliveryOtp}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.deliveryOtp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2000);
                    }}
                    className="text-xs px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 font-bold transition flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                    title="Copy OTP"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy PIN</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Jab delivery agent hostel room par parcel lekar aaye, tab unhe ye PIN bata kar delivery confirm karwayen.</span>
                </p>
              </div>
            )}

            {/* Status Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Live Status Tracker
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
                {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 ? (
                  selectedOrder.statusTimeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{step.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {step.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.note}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Status is updated in real time by the shop and courier.</p>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white">Delivery Information</h4>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Recipient:</strong> {selectedOrder.deliveryAddressSnapshot?.recipientName} (
                {selectedOrder.deliveryAddressSnapshot?.phone})
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Location:</strong> {selectedOrder.deliveryAddressSnapshot?.hostelBlock}, Room{' '}
                {selectedOrder.deliveryAddressSnapshot?.roomNumber}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Campus Landmark:</strong> {selectedOrder.deliveryAddressSnapshot?.campusLandmark || 'Near common entrance'}
              </p>
            </div>

            {/* Purchased Items List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items?.length})
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.productTitleSnapshot}</span>
                      <p className="text-slate-400 text-[11px]">
                        {item.quantity} × ₹{item.unitPriceSnapshot}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span>₹{selectedOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Amount</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
