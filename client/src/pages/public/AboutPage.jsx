import React from 'react';
import { ShoppingBag, Brain, ShieldCheck, Truck, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            About CampusCart AI
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transforming college commerce into an intelligent, data-driven ecosystem where students never face out-of-stock stationery during exams.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-500" />
            <span>The Problem We Solve</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Every semester across university campuses, the same critical issues repeat: during mid-terms and end-semester examinations, campus stationery vendors unexpectedly run out of blue pens, graph paper, lab registers, and scientific calculators. Meanwhile, xerox shops experience chaotic lines of students waiting to print project reports.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>CampusCart AI</strong> integrates full e-commerce logistics with a Machine Learning microservice that reads historical sales patterns and upcoming academic calendar events. It proactively informs shop owners how much stock to purchase weeks in advance, while giving students digital ordering, xerox submissions, and hostel delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Forecasting Architecture</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Implemented using scikit-learn (RandomForestRegressor and HistGradientBoosting) with walk-forward time-series validation. Features include 14-day lagged sales, rolling standard deviations, day-of-week indicators, and proximity to college examinations.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Auditability & Inventory Integrity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Every stock movement is recorded in an immutable Inventory Ledger with atomic balance tracking. Concurrency-safe order deductions ensure no product is ever oversold.
            </p>
          </div>
        </div>

        <div className="text-center pt-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
          >
            <span>Explore Stationery Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
