import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Printer,
  Brain,
  Truck,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-16 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent dark:from-indigo-950/40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Smart Campus Logistics & AI Demand Forecasting</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Campus Stationery & Xerox, Delivered in{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Minutes.
              </span>
            </h1>

            <p className="mt-3 sm:mt-6 text-xs sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Order notebooks, engineering records, scientific calculators, and submit PDF documents for instant campus printing.
              Powered by AI models that forecast student demand before exam rushes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Stationery Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/printing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <Printer className="w-5 h-5 text-indigo-500" />
                <span>Upload PDF for Printing</span>
              </Link>
            </div>

            {/* Quick 1-Click Demo Evaluation Row */}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                1-Click Interactive Evaluation Profiles
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => demoLogin('STUDENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
                >
                  Student
                </button>
                <button
                  onClick={() => demoLogin('SHOP_OWNER')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
                >
                  Shop Owner
                </button>
                <button
                  onClick={() => demoLogin('DELIVERY_AGENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                >
                  Delivery OTP
                </button>
                <button
                  onClick={() => demoLogin('ADMIN')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
                >
                  Admin Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Why CampusCart AI is Built Different
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              A holistic ecosystem connecting students needing quick supplies with stationery vendors optimizing inventory through real ML models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic-Calendar Aware ML</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our scikit-learn forecasting model correlates past sales with upcoming exam schedules and submission deadlines to recommend safe reorder quantities before stockouts happen.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Xerox & Print Queue</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload your assignment or project PDF from your room. Select duplex, color or BW, spiral binding, and pay with exact calculated charges. Pickup without standing in long shop queues.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure OTP Hostel Delivery</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Assigned campus delivery agents bring stationery directly to your hostel block. Deliveries are finalized strictly upon 6-digit SHA-256 hashed OTP verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Workflow */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Ordering in 3 Simple Steps
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              From checkout to hostel room in less time than it takes to walk across campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Select Stationery or PDF</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Choose notebooks, pens, lab supplies from approved campus vendors, or upload lecture notes for printing.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Choose Hostel Room or Pickup</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Specify your hostel block and room number for 20-minute delivery or quick counter pickup.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Verify OTP & Receive</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Provide your secure 6-digit delivery OTP to the student courier during handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to streamline your campus academic supplies?
          </h2>
          <p className="mt-4 text-indigo-200 max-w-xl mx-auto text-sm sm:text-base">
            Join hundreds of students and campus shop owners leveraging intelligent inventory and fast deliveries today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/marketplace"
              className="px-6 py-3 rounded-xl font-semibold bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg transition"
            >
              Explore Stationery Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
