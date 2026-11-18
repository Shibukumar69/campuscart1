import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching security audit logs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          <span>System Audit & Security Logs</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Historical record of administrative interventions, user moderations, and vendor approvals.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No privileged audit logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {logs.map((log) => (
              <div key={log._id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {log.action}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Target: <strong className="font-mono">{log.resourceType}</strong> #{log.resourceId}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Operator: {log.performedBy?.name || 'Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
