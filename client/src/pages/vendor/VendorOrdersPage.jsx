import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get('/orders/shop', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load shop orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus, note = '') => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        note: note || `Vendor changed order status to ${newStatus}`,
      });
      if (res.data.success) {
        toast.success(`Order updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    try {
      const res = await api.patch(`/orders/${rejectingOrder._id}/status`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Item damaged or temporarily unavailable',
        note: `Order rejected: ${rejectionReason}`,
      });
      if (res.data.success) {
        toast.success(`Order #${rejectingOrder.orderNumber} rejected & stock restored to catalog.`);
        setRejectingOrder(null);
        setRejectionReason('');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Store Order Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accept student orders, prepare packages, and dispatch to campus delivery couriers.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {status || 'All Orders'}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching store orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          No orders found matching the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                    #{order.orderNumber}
                  </span>
                  <Badge status={order.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total: <strong className="text-sm font-bold text-slate-900 dark:text-white">₹{order.totalAmount}</strong> ({order.paymentMethod})
                </div>
              </div>

              {/* Items in this order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.productTitleSnapshot}
                    </span>
                    <span className="text-slate-500">
                      Qty: {item.quantity} × ₹{item.unitPriceSnapshot} = ₹{item.lineTotal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery info & Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-slate-500">
                  Deliver to:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {order.studentId?.name} ({order.deliveryAddressSnapshot?.hostelBlock}, Room{' '}
                    {order.deliveryAddressSnapshot?.roomNumber})
                  </strong>
                </p>

                {/* State Transition Action Buttons */}
                <div className="flex items-center space-x-2">
                  {order.status === 'PLACED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                        className="px-3 py-1.5 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => {
                          setRejectingOrder(order);
                          setRejectionReason('Out of stock or unavailable');
                        }}
                        className="px-3 py-1.5 rounded-lg font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'PREPARING', 'Items packed in courier bag')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 text-white transition"
                    >
                      Mark Preparing
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'READY_FOR_PICKUP', 'Package ready for delivery courier')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition"
                    >
                      Mark Ready For Dispatch
                    </button>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <span className="text-amber-600 font-semibold flex items-center space-x-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Courier on the way to hostel</span>
                    </span>
                  )}

                  {order.status === 'COMPLETED' && (
                    <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed & Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Order #{rejectingOrder.orderNumber}</h3>
            <p className="text-xs text-slate-500">
              Rejecting this order will automatically restore stock balances back to your catalog in the ledger.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason for Student
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Requested brand temporarily depleted"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
