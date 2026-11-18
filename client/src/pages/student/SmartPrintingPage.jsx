import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Printer, FileText, CheckCircle2, AlertCircle, ArrowRight, Store } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const SmartPrintingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [pageCount, setPageCount] = useState(10);
  const [copies, setCopies] = useState(1);
  const [printColor, setPrintColor] = useState('BW'); // BW, COLOR
  const [paperSize, setPaperSize] = useState('A4');
  const [sides, setSides] = useState('DOUBLE'); // SINGLE, DOUBLE
  const [bindingType, setBindingType] = useState('NONE'); // NONE, STAPLE, SPIRAL, HARDBOUND
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Rate card state
  const [rates, setRates] = useState({
    baseCharge: 5.0,
    bwSinglePage: 1.5,
    bwDoublePage: 2.0,
    colorSinglePage: 6.0,
    colorDoublePage: 10.0,
    a3Multiplier: 1.8,
    binding: { NONE: 0, STAPLE: 5, SPIRAL: 35, HARDBOUND: 120 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopsRes, ratesRes] = await Promise.all([
          api.get('/shops'),
          api.get('/print-jobs/rate-card'),
        ]);

        if (shopsRes.data.success && shopsRes.data.data.length > 0) {
          const printingShops = shopsRes.data.data.filter((s) => s.offersPrinting);
          setShops(printingShops);
          if (printingShops.length > 0) {
            setSelectedShop(printingShops[0]._id);
          }
        }

        if (ratesRes.data.success) {
          setRates(ratesRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load printing shops/rates', err);
      }
    };
    fetchData();
  }, []);

  // Compute live price
  const calculateEstimate = () => {
    const isDouble = sides === 'DOUBLE';
    const isColor = printColor === 'COLOR';

    let pageCostPerCopy = 0;
    if (!isDouble) {
      const rate = isColor ? rates.colorSinglePage : rates.bwSinglePage;
      pageCostPerCopy = pageCount * rate;
    } else {
      const sheets = Math.ceil(pageCount / 2);
      const rate = isColor ? rates.colorDoublePage : rates.bwDoublePage;
      pageCostPerCopy = sheets * rate;
    }

    if (paperSize === 'A3') {
      pageCostPerCopy *= rates.a3Multiplier;
    }

    const bindingCharge = rates.binding[bindingType] || 0;
    const total = rates.baseCharge + (pageCostPerCopy + bindingCharge) * copies;

    return {
      pageCostPerCopy: Number(pageCostPerCopy.toFixed(2)),
      bindingCharge,
      total: Number(total.toFixed(2)),
    };
  };

  const estimate = calculateEstimate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF (.pdf) documents are accepted for printing');
        return;
      }
      if (selected.size > 25 * 1024 * 1024) {
        toast.error('Maximum PDF file size is 25 MB');
        return;
      }
      setFile(selected);
      // Rough page count estimation based on file size if page counter not parsed
      const estimatedPages = Math.max(1, Math.min(100, Math.ceil(selected.size / (150 * 1024))));
      setPageCount(estimatedPages);
      toast.success(`Selected "${selected.name}" (Estimated: ~${estimatedPages} pages)`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to submit print jobs');
      navigate('/login');
      return;
    }

    if (!file) {
      toast.error('Please upload a PDF document');
      return;
    }

    if (!selectedShop) {
      toast.error('Please select a campus print shop');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('shopId', selectedShop);
      formData.append('pageCount', pageCount);
      formData.append('copies', copies);
      formData.append('printColor', printColor);
      formData.append('paperSize', paperSize);
      formData.append('sides', sides);
      formData.append('bindingType', bindingType);
      formData.append('additionalNotes', notes);

      const res = await api.post('/print-jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success(`Print Job #${res.data.data.printJob.jobCode} queued successfully!`);
        navigate('/student/print-jobs');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-6 sm:py-8">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Printer className="w-6 h-6 text-indigo-500" />
          <span>Smart Print & Xerox Submissions</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload PDF documents for laser printing with transparent rate card pricing and counter express pickup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: File upload and options */}
        <div className="md:col-span-2 space-y-6">
          {/* File Upload Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>1. Upload PDF Document</span>
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-800/30">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileText className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm mx-auto">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to print
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to browse or drag and drop PDF file here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PDF documents only (Max size: 25 MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Options */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Print Specifications</h3>

            {/* Print Shop Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Campus Print Center
              </label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.campusLocation})
                  </option>
                ))}
              </select>
            </div>

            {/* Page Count & Copies */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Page Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Color Mode & Sides */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintColor('BW')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      printColor === 'BW'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    B&W (₹{rates.bwDoublePage}/sht)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintColor('COLOR')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      printColor === 'COLOR'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Color (₹{rates.colorDoublePage}/sht)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Printing Sides
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSides('DOUBLE')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      sides === 'DOUBLE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Double Sided
                  </button>
                  <button
                    type="button"
                    onClick={() => setSides('SINGLE')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      sides === 'SINGLE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Single Sided
                  </button>
                </div>
              </div>
            </div>

            {/* Binding Options */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Binding Option
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['NONE', 'STAPLE', 'SPIRAL', 'HARDBOUND'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBindingType(type)}
                    className={`p-2.5 rounded-lg border font-medium transition text-center ${
                      bindingType === type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="block capitalize">{type.toLowerCase()}</span>
                    <span className="text-[10px] text-slate-400">
                      {rates.binding[type] ? `+₹${rates.binding[type]}` : 'Free'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please bind page 1-50 in book 1, rest in book 2"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Form: Live Pricing Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 self-start">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Price Calculation</h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Setup Base Charge</span>
              <span>₹{rates.baseCharge}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>
                Pages Cost ({pageCount} pgs, {sides.toLowerCase()})
              </span>
              <span>₹{estimate.pageCostPerCopy}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Binding Charge ({bindingType})</span>
              <span>₹{estimate.bindingCharge}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Copies Multiplier</span>
              <span>× {copies}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
              <span>Estimated Total</span>
              <span className="text-indigo-600 dark:text-indigo-400">₹{estimate.total}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Campus Express Pickup</p>
            <p>Your job code will be generated upon submission. Present the code at the print counter to collect.</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Submitting Document...' : 'Submit Print Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
