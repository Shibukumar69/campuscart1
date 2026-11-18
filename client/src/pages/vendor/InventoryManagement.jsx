import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Plus, Edit3, ArrowUpDown, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState('RESTOCK'); // 'RESTOCK' or 'ADJUST'
  const [quantity, setQuantity] = useState(25);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      if (actionType === 'RESTOCK') {
        const res = await api.post('/inventory/restock', {
          productId: selectedProduct._id,
          quantity: Number(quantity),
          notes: reason || 'Vendor replenishment batch',
        });
        if (res.data.success) {
          toast.success(`Successfully restocked ${quantity} units for "${selectedProduct.title}"`);
        }
      } else {
        const res = await api.post('/inventory/adjust', {
          productId: selectedProduct._id,
          newStock: Number(quantity),
          reason: reason || 'Physical audit stock adjustment',
        });
        if (res.data.success) {
          toast.success(`Updated stock balance to ${quantity} for "${selectedProduct.title}"`);
        }
      }

      setSelectedProduct(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Inventory Health & Stock Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock monitors, threshold alert triggers, and instant replenishment actions.
          </p>
        </div>
        <Link
          to="/vendor/ledger"
          className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
        >
          View Auditable Ledger
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading current inventory balances..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Safety Stock</th>
                  <th className="py-3 px-4">Health State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                        {item.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{item.SKU}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.categoryId?.name || 'General'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm">
                      {item.currentStock} {item.unit || 'units'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.minStockThreshold} units</td>
                    <td className="py-3 px-4 text-slate-500">{item.safetyStock} units</td>
                    <td className="py-3 px-4">
                      <Badge status={item.stockHealth} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setActionType('RESTOCK');
                          setQuantity(30);
                          setReason('Supplier restock order');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition"
                      >
                        + Restock
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setActionType('ADJUST');
                          setQuantity(item.currentStock);
                          setReason('Physical warehouse stock count');
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock / Adjust Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {actionType === 'RESTOCK' ? 'Restock Product Units' : 'Manual Inventory Adjustment'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedProduct.title} (Current: <strong>{selectedProduct.currentStock} units</strong>)
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {actionType === 'RESTOCK' ? 'Units to Add to Stock (+)' : 'Exact New Stock Count'}
                </label>
                <input
                  type="number"
                  min={actionType === 'RESTOCK' ? '1' : '0'}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ledger Audit Note
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Received shipment from distributor"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                >
                  {submitting ? 'Updating...' : 'Save & Record in Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
