import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ArrowDownRight, ArrowUpRight, RefreshCw, Filter } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const InventoryLedgerPage = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await api.get('/inventory/ledger');
        if (res.data.success) {
          setLedger(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load ledger', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading auditable inventory transaction ledger..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
          <span>Auditable Inventory Ledger</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete, tamper-evident audit trail of every stock modification, order deduction, and restock.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Balance</th>
                <th className="py-3 px-4">Reference / Reason</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ledger.map((entry) => {
                const isPositive = entry.quantityChanged > 0;
                return (
                  <tr key={entry._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(entry.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {entry.productId?.title || 'Stationery Item'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          entry.transactionType === 'RESTOCK'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : entry.transactionType === 'ORDER_DEDUCTION'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {entry.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${entry.quantityChanged}` : entry.quantityChanged}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">
                      {entry.balanceBefore} → <strong className="text-slate-900 dark:text-white">{entry.balanceAfter}</strong>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {entry.referenceId && (
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mr-1.5">
                          {entry.referenceId}
                        </span>
                      )}
                      <span>{entry.notes || 'Routine stock count'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[120px]">
                      {entry.performedBy?.name || 'System Auto'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
