import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, MapPin, KeyRound, Phone, Package, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/assigned-deliveries');
      if (res.data.success) {
        setDeliveries(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStartDelivery = async (orderId) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: 'OUT_FOR_DELIVERY',
        note: 'Courier picked up package and is heading to hostel room',
      });
      if (res.data.success) {
        toast.success('Order marked as Out for Delivery!');
        fetchDeliveries();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpModalOrder) return;
    if (enteredOtp.length !== 6) {
      toast.error('Please enter the 6-digit student delivery OTP');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post(`/orders/${otpModalOrder._id}/verify-otp`, {
        otp: enteredOtp,
      });

      if (res.data.success) {
        toast.success('OTP verified! Delivery completed successfully.');
        setOtpModalOrder(null);
        setEnteredOtp('');
        fetchDeliveries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid delivery OTP');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Truck className="w-6 h-6 text-indigo-500" />
          <span>Campus Courier Delivery Terminal</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pick up ready stationery packages and verify handover at hostel doors with student OTP.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Checking assigned deliveries..." />
      ) : deliveries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active deliveries pending handover. Check back when campus shops pack new orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                      #{order.orderNumber}
                    </span>
                    <Badge status={order.status} />
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    ₹{order.totalAmount} ({order.paymentMethod})
                  </span>
                </div>

                {/* Pickup from shop */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Pickup Location
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{order.shopId?.name}</p>
                  <p className="text-slate-500">{order.shopId?.campusLocation}</p>
                </div>

                {/* Drop off to Student */}
                <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
                    Destination Room
                  </span>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-indigo-900 dark:text-indigo-200 text-sm">
                      {order.deliveryAddressSnapshot?.hostelBlock}, Room {order.deliveryAddressSnapshot?.roomNumber}
                    </p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Recipient: {order.deliveryAddressSnapshot?.recipientName} ({order.deliveryAddressSnapshot?.phone})
                  </p>
                  {order.deliveryAddressSnapshot?.campusLandmark && (
                    <p className="text-[11px] text-slate-500 italic">
                      Landmark: {order.deliveryAddressSnapshot.campusLandmark}
                    </p>
                  )}
                </div>

                {/* Items summary */}
                <div className="mt-3 text-xs text-slate-500">
                  <span>
                    Items: {order.items.map((i) => `${i.quantity}x ${i.productTitleSnapshot}`).join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {order.status === 'READY_FOR_PICKUP' && (
                  <button
                    onClick={() => handleStartDelivery(order._id)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Claim Package & Start Delivery</span>
                  </button>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => {
                      setOtpModalOrder(order);
                      setEnteredOtp('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Student OTP & Complete Handover</span>
                  </button>
                )}

                {order.status === 'COMPLETED' && (
                  <div className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center space-x-1 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivered & Handover Confirmed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6-Digit OTP Verification Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Student Handover OTP
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask student <strong>{otpModalOrder.deliveryAddressSnapshot?.recipientName}</strong> for the 6-digit PIN on their CampusCart screen.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  pattern="\d{6}"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full text-center tracking-widest font-mono text-2xl font-extrabold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || enteredOtp.length !== 6}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
