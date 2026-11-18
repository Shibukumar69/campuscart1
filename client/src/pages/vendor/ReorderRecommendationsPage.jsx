import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Boxes,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const ReorderRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [creatingPo, setCreatingPo] = useState(false);
  const [createdPo, setCreatedPo] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ml/recommendations');
      if (res.data.success) {
        const list = res.data.data.recommendations || [];
        setRecommendations(list);
        // By default select all recommended items
        setSelectedItems(list.map((r) => r.productId));
      }
    } catch (err) {
      toast.error('Failed to load replenishment recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleGeneratePO = async () => {
    const itemsToOrder = recommendations.filter((r) => selectedItems.includes(r.productId));
    if (itemsToOrder.length === 0) {
      toast.error('Please select at least one stationery item');
      return;
    }

    setCreatingPo(true);
    try {
      const payload = {
        supplierName: 'National Campus Stationery Distributors Ltd.',
        notes: 'AI Automated Replenishment Order (CampusCart ML Engine)',
        items: itemsToOrder.map((r) => ({
          productId: r.productId,
          quantity: r.suggestedPurchaseQty,
          unitCost: r.costPrice,
          reason: r.formulaExplanation,
        })),
      };

      const res = await api.post('/ml/purchase-order', payload);
      if (res.data.success) {
        setCreatedPo(res.data.data);
        toast.success(`Draft Purchase Order #${res.data.data.poNumber} generated successfully!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate purchase order');
    } finally {
      setCreatingPo(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing inventory replenishment advice & reorder points..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            <span>AI Inventory Reorder Advisor</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Intelligent purchase recommendations based on lead-time velocity, cycle demand, and safety stock.
          </p>
        </div>

        {recommendations.length > 0 && !createdPo && (
          <button
            onClick={handleGeneratePO}
            disabled={creatingPo || selectedItems.length === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <FileCheck className="w-4 h-4" />
            <span>{creatingPo ? 'Generating Draft PO...' : `Generate Draft PO (${selectedItems.length} SKUs)`}</span>
          </button>
        )}
      </div>

      {/* Draft PO Confirmation Banner */}
      {createdPo && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold">Draft Purchase Order Generated: #{createdPo.poNumber}</h3>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Supplier: <strong>{createdPo.supplierName}</strong> • Items: {createdPo.items.length} SKUs • Total
            Wholesale Estimate: <strong>₹{createdPo.totalCost.toLocaleString()}</strong>
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                toast.success(`Purchase order #${createdPo.poNumber} saved to vendor records!`);
                setCreatedPo(null);
                fetchRecommendations();
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
            >
              Done & Return to Advisor
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Table */}
      {recommendations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">All Stock Levels Healthy</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No stationery products are currently below their reorder points. The ML model continues monitoring sales velocity.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">Select</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Reorder Point</th>
                  <th className="py-3 px-4 text-center">Suggested PO Qty</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Formula Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recommendations.map((rec) => {
                  const isChecked = selectedItems.includes(rec.productId);
                  return (
                    <tr key={rec.productId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(rec.productId)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                          {rec.productTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {rec.currentStock} units
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {rec.reorderPoint} units
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        +{rec.suggestedPurchaseQty}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.urgency === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : rec.urgency === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {rec.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs">{rec.formulaExplanation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
