import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">CampusCart AI</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Smart student stationery delivery system powered by machine learning demand forecasting, intelligent inventory optimization, and hostel delivery.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/marketplace" className="hover:text-indigo-600 transition">Stationery Marketplace</Link></li>
              <li><Link to="/printing" className="hover:text-indigo-600 transition">Smart Print & Xerox</Link></li>
              <li><Link to="/how-it-works" className="hover:text-indigo-600 transition">How Demand Prediction Works</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600 transition">Campus Partner Shops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">User Portals</h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/login" className="hover:text-indigo-600 transition">Student Login & Orders</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600 transition">Vendor Inventory Portal</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600 transition">Delivery Agent OTP Terminal</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600 transition">Administrator Control Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Campus Guarantees</h4>
            <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>20-minute hostel room delivery</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero exam stockout guarantee via ML</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Built for students, by students</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 CampusCart AI Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Academic Project Implementation — MERN + Machine Learning</p>
        </div>
      </div>
    </footer>
  );
};
