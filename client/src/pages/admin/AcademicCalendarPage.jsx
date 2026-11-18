import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

export const AcademicCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    eventTitle: '',
    eventType: 'MID_TERM_EXAMS',
    startDate: '',
    endDate: '',
    description: '',
    impactCategory: 'EXAM_STATIONERY',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-calendar');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load academic calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/academic-calendar', formData);
      if (res.data.success) {
        toast.success('Academic event scheduled! ML models will update exam distance features.');
        setModalOpen(false);
        setFormData({
          eventTitle: '',
          eventType: 'MID_TERM_EXAMS',
          startDate: '',
          endDate: '',
          description: '',
          impactCategory: 'EXAM_STATIONERY',
        });
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this event?')) return;
    try {
      const res = await api.delete(`/academic-calendar/${id}`);
      if (res.data.success) {
        toast.success('Academic event removed');
        fetchEvents();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            <span>Academic Calendar & ML Event Signals</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exam and project dates fed into feature engineering pipelines for demand spike anticipation.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Event</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching campus calendar..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {ev.eventType.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleDelete(ev._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{ev.eventTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ev.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>
                  {new Date(ev.startDate).toLocaleDateString()} → {new Date(ev.endDate).toLocaleDateString()}
                </span>
                <span className="font-sans text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {ev.impactCategory}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Academic Event</h3>
            <p className="text-xs text-slate-500">
              The ML feature engineering engine calculates `days_to_next_exam` from these dates.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.eventTitle}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  placeholder="e.g. End Semester Theory Exams"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Classification
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="MID_TERM_EXAMS">MID_TERM_EXAMS</option>
                  <option value="END_SEM">END_SEM</option>
                  <option value="INTERNAL_ASSESSMENT">INTERNAL_ASSESSMENT</option>
                  <option value="PROJECT_SUBMISSION">PROJECT_SUBMISSION</option>
                  <option value="HOLIDAY">HOLIDAY</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Impact Focus
                </label>
                <select
                  value={formData.impactCategory}
                  onChange={(e) => setFormData({ ...formData, impactCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="EXAM_STATIONERY">Exam Stationery (Pens, Notebooks, Calculators)</option>
                  <option value="PROJECT_PRINTING">Project Printing (Xerox, Spiral Binding, Files)</option>
                  <option value="GENERAL">General Campus Activity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. University theory exams for all semesters"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
                >
                  {submitting ? 'Scheduling...' : 'Save & Propagate to ML'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
