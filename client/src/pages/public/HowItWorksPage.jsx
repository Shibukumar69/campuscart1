import React from 'react';
import { ShoppingBag, Printer, Brain, Truck, Calculator, CalendarDays, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How CampusCart AI Works
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A step-by-step walkthrough of student ordering, smart xerox queueing, and intelligent vendor replenishment.
          </p>
        </div>

        {/* Section 1: Student Ordering */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
            <ShoppingBag className="w-6 h-6" />
            <h2>1. Stationery Marketplace & Checkout</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Students can browse verified campus shops, filter by categories (notebooks, pens, practical sheets, scientific calculators), view live available stock counters, and add items to their unified cart.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <strong className="block text-slate-900 dark:text-white mb-1">Hostel Delivery:</strong>
              Courier drops package right outside your room door. Delivery is finalized strictly with your student 6-digit OTP.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <strong className="block text-slate-900 dark:text-white mb-1">Counter Pickup:</strong>
              Skip the line! Order in advance, and walk up to the designated express pickup counter with your order number.
            </div>
          </div>
        </div>

        {/* Section 2: Smart Printing */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            <Printer className="w-6 h-6" />
            <h2>2. Automated Printing & Xerox Service</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            No more waiting around flash drive virus scanners! Upload your assignments, thesis, or practical lab records directly to authorized campus print centers.
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Exact price estimation: Single or Double-sided, Black & White or Full Color.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Binding preferences: Plain sheets, Corner Staple, Spiral Binding, or Hardbound project book.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Vendor downloads document securely through authenticated stream and updates live printing queue status.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Machine Learning Inventory Forecasting */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-purple-600 dark:text-purple-400 font-bold text-lg">
            <Brain className="w-6 h-6" />
            <h2>3. AI Demand Forecasting & Reorder Formulation</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The heart of CampusCart AI is its proactive inventory optimization engine. Rather than waiting until an item runs out, vendors view forecasted daily demand 7 and 30 days into the future.
          </p>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
            <p className="font-semibold text-purple-900 dark:text-purple-200">
              Documented Inventory Formula:
            </p>
            <code className="block bg-white dark:bg-slate-900 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-mono">
              Reorder Point = (Expected Demand During Lead Time) + Safety Stock
            </code>
            <code className="block bg-white dark:bg-slate-900 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-mono">
              Suggested Purchase Qty = max(0, Cycle Demand + Safety Stock - Current Usable Stock)
            </code>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            When academic events (like Mid-term exams) appear on the calendar, the feature engineering pipeline increases proximity signals, alerting vendors to demand spikes before the college bookstore runs out of stock!
          </p>
        </div>
      </div>
    </div>
  );
};
