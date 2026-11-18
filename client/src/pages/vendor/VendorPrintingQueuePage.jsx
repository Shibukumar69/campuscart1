import React, { useState, useEffect } from 'react';
import { Printer, Download, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const VendorPrintingQueuePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get('/print-jobs/queue', { params });
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load printing queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const res = await api.patch(`/print-jobs/${jobId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Job updated to ${newStatus}`);
        fetchQueue();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDownload = (jobId) => {
    // Open authenticated download link or stream
    const token = localStorage.getItem('campuscart_token');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/print-jobs/${jobId}/download`;
    
    // Fetch with auth header and trigger browser download
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed');
        return res.blob();
      })
      .then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `print_job_${jobId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Document downloaded for printing!');
      })
      .catch((err) => toast.error('Unauthorized or file missing on disk'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Printer className="w-6 h-6 text-indigo-500" />
            <span>Store Printing Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download authorized student PDFs, manage duplex & spiral binding jobs, and update pickup readiness.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['', 'SUBMITTED', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st || 'All Jobs'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching document queue..." />
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          No printing jobs in this queue state.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded">
                    #{job.jobCode}
                  </span>
                  <Badge status={job.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Charge:{' '}
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{job.finalPrice || job.estimatedPrice}
                  </strong>
                </div>
              </div>

              {/* Job specifications row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">Document</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {job.originalFileName}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {(job.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">Pages & Sides</span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {job.pageCount} pages ({job.sides.toLowerCase()})
                  </span>
                  <span className="text-indigo-600 font-semibold text-[10px]">{job.copies} copy</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">Mode & Binding</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{job.printColor} Mode</span>
                  <span className="text-slate-500 capitalize text-[10px]">{job.bindingType.toLowerCase()} binding</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 text-[10px] block">Student</span>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {job.studentId?.name}
                  </span>
                  <span className="text-slate-400 text-[10px]">{job.studentId?.phone}</span>
                </div>
              </div>

              {job.additionalNotes && (
                <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  <strong>Student Note:</strong> {job.additionalNotes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => handleDownload(job._id)}
                  className="px-3.5 py-2 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Download PDF Document</span>
                </button>

                <div className="flex items-center space-x-2">
                  {job.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                    >
                      Accept Job
                    </button>
                  )}

                  {job.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'PRINTING')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 text-white transition"
                    >
                      Start Printing Laser
                    </button>
                  )}

                  {job.status === 'PRINTING' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'READY_FOR_PICKUP')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition"
                    >
                      Mark Ready at Counter
                    </button>
                  )}

                  {job.status === 'READY_FOR_PICKUP' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'DELIVERED')}
                      className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-900 text-white transition"
                    >
                      Mark Handed Over
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
