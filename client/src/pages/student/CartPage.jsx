import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, Store, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

export const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
    deliveryType,
    setDeliveryType,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 max-w-4xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any stationery items yet. Explore the campus marketplace!"
          actionLabel="Browse Marketplace"
          actionLink="/marketplace"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Shopping Cart</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review your stationery items before proceeding to hostel dispatch.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {product.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">{product.SKU}</p>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ₹{product.price} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-lg transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 sm:px-3 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-slate-900 dark:text-white w-16 text-right">
                    ₹{product.price * quantity}
                  </span>

                  <button
                    onClick={() => removeItem(product._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Delivery Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h3>

            {/* Delivery Type Option */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Delivery Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('HOSTEL_DELIVERY')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    deliveryType === 'HOSTEL_DELIVERY'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Hostel Room</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">₹15 Courier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('SELF_PICKUP')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    deliveryType === 'SELF_PICKUP'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-semibold">
                    <Store className="w-3.5 h-3.5" />
                    <span>Counter Pickup</span>
                  </div>
                  <span className="text-[11px] font-normal text-emerald-600 mt-1">FREE</span>
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
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
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
