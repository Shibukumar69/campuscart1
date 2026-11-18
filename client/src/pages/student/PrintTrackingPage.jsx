import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, FileText, Clock, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const PrintTrackingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/print-jobs/my');
        if (res.data.success) {
          setJobs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load print jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your printing queue..." />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Printer}
        title="No print submissions yet"
        description="Submit your assignment or practical records for instant campus printing."
        actionLabel="Upload PDF Document"
        actionLink="/printing"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Print Submissions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track live preparation and counter collection status for your PDF jobs.
          </p>
        </div>
        <Link
          to="/printing"
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
        >
          + Upload Another PDF
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  #{job.jobCode}
                </span>
                <Badge status={job.status} />
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {job.originalFileName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {job.shopId?.name} ({job.shopId?.campusLocation})
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Pages</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {job.pageCount} ({job.sides.toLowerCase()})
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Mode</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{job.printColor}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block">Binding</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {job.bindingType.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Amount: <strong className="text-slate-900 dark:text-white text-sm">₹{job.finalPrice || job.estimatedPrice}</strong>
              </span>

              {job.status === 'READY_FOR_PICKUP' ? (
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready at counter!</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Submitted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
