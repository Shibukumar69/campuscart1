import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Store } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const VendorApprovalsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/vendors/pending');
      if (res.data.success) {
        setShops(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproval = async (shopId, status) => {
    try {
      const res = await api.patch(`/admin/vendors/${shopId}/approval`, {
        approvalStatus: status,
        notes: `Application evaluated as ${status}`,
      });
      if (res.data.success) {
        toast.success(`Shop ${status.toLowerCase()} successfully!`);
        fetchPending();
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking pending vendor applications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-indigo-500" />
          <span>Campus Stationery Vendor Approvals</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review campus merchant applications and approve shops for student marketplace ordering.
        </p>
      </div>

      {shops.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Pending Vendor Applications</h3>
          <p className="text-xs text-slate-500">All registered campus shops are up to date and active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2 font-bold text-sm">
                  <Store className="w-4 h-4" />
                  <span>{shop.name}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{shop.description}</p>
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <p>
                    <strong>Location:</strong> {shop.campusLocation}
                  </p>
                  <p>
                    <strong>Owner:</strong> {shop.ownerId?.name} ({shop.ownerId?.email})
                  </p>
                  <p>
                    <strong>Operating Hours:</strong> {shop.operatingHours}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => handleApproval(shop._id, 'APPROVED')}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  Approve Shop
                </button>
                <button
                  onClick={() => handleApproval(shop._id, 'REJECTED')}
                  className="py-2 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
