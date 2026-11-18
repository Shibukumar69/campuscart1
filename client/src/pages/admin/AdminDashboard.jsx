import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Store,
  DollarSign,
  TrendingUp,
  Brain,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTriggerTraining = async () => {
    setRetraining(true);
    try {
      const res = await api.post('/ml/train');
      if (res.data.success) {
        toast.success(`ML model retrained successfully! Model: ${res.data.data.model_name} (MAE: ${res.data.data.mae})`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retraining failed');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating campus platform metrics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Campus Administration & Intelligence Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global merchandise volume, platform commission, user directory, and ML pipeline controls.
          </p>
        </div>

        <button
          onClick={handleTriggerTraining}
          disabled={retraining}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <Brain className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Running Model Pipeline...' : 'Trigger ML Retraining Pipeline'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value"
          value={`₹${stats?.grossMerchandiseValue?.toLocaleString() || 0}`}
          icon={TrendingUp}
          color="emerald"
          subtitle="All completed campus transactions"
        />
        <StatCard
          title="Platform Commission (5%)"
          value={`₹${stats?.platformCommission?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="indigo"
          subtitle="Net university platform revenue"
        />
        <StatCard
          title="Active Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="purple"
          subtitle={`Across ${stats?.totalUsers || 0} total accounts`}
        />
        <StatCard
          title="Order Completion Rate"
          value={`${stats?.orderCompletionRate || 100}%`}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${stats?.completedOrders || 0} / ${stats?.totalOrders || 0} orders`}
        />
      </div>

      {/* Management Quicklinks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Academic Calendar Manager</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Schedule mid-terms, end-sems, and project deadlines. The ML service reads these to calculate time proximity features.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/calendar"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Manage Calendar Events →</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">User Directory & RBAC</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review registered students, shop owners, and delivery agents. Suspend accounts or modify permissions.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/users"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>View User Roster →</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Audit Trail & Security Logs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect security records, vendor approval changes, and administrative actions for institutional compliance.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Inspect Audit Logs →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
