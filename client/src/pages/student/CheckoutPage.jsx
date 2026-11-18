import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, MapPin, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

export const CheckoutPage = () => {
  const { items, deliveryType, subtotal, deliveryFee, totalAmount, clearCart, currentShop } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '+91 98765 00004',
    hostelBlock: user?.hostelBlock || 'Hostel Block C',
    roomNumber: user?.roomNumber || '312',
    campusLandmark: 'Near Common Room Entrance',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Determine shopId
      const targetShopId = currentShop?._id || currentShop || items[0].product.shopId?._id || items[0].product.shopId;

      const orderPayload = {
        shopId: targetShopId,
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        deliveryType,
        deliveryAddress: address,
        paymentMethod,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data.success) {
        const createdOrder = res.data.data;
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-success', { state: { order: createdOrder } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Checkout</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Confirm your hostel delivery location and payment method.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Form: Address & Payment */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Location Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>
                  {deliveryType === 'HOSTEL_DELIVERY' ? 'Hostel Room Address' : 'Contact Information for Pickup'}
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={address.recipientName}
                    onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {deliveryType === 'HOSTEL_DELIVERY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hostel Block
                    </label>
                    <input
                      type="text"
                      value={address.hostelBlock}
                      onChange={(e) => setAddress({ ...address, hostelBlock: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={address.roomNumber}
                      onChange={(e) => setAddress({ ...address, roomNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Landmark / Notes for Agent
                </label>
                <input
                  type="text"
                  value={address.campusLandmark}
                  onChange={(e) => setAddress({ ...address, campusLandmark: e.target.value })}
                  placeholder="e.g. 2nd floor, next to drinking water cooler"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Payment Method</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold">Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 mt-1 pl-5">Pay agent at door</span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    paymentMethod === 'SANDBOX'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="SANDBOX"
                      checked={paymentMethod === 'SANDBOX'}
                      onChange={() => setPaymentMethod('SANDBOX')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold">UPI / Card (Demo Sandbox)</span>
                  </div>
                  <span className="text-[11px] font-normal text-emerald-600 mt-1 pl-5">Instant approval</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Items</h3>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="pr-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{product.title}</span>
                    <span className="text-slate-400">Qty: {quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">₹{product.price * quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
