import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Truck, Store, KeyRound, RotateCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';

export const Login = () => {
  const [authMode, setAuthMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithOtp, demoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const redirectByRole = (user) => {
    switch (user.role) {
      case 'SHOP_OWNER':
        navigate('/vendor/dashboard');
        break;
      case 'DELIVERY_AGENT':
        navigate('/delivery/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      redirectByRole(user);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendLoginOtp = async () => {
    if (!email) {
      toast.error('Please enter your email to receive OTP');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/send-login-otp', { email });
      if (res.data.success) {
        toast.success('Login code sent to your Gmail inbox!');
        setOtpSent(true);
        setCountdown(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Please enter email and 6-digit OTP code');
      return;
    }

    setSubmitting(true);
    try {
      const user = await loginWithOtp(email, otp.trim());
      toast.success(`Welcome, ${user.name}! (Signed in via Gmail OTP)`);
      redirectByRole(user);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (role) => {
    setSubmitting(true);
    try {
      const user = await demoLogin(role);
      toast.success(`Signed in as demo ${role.replace('_', ' ')}!`);
      redirectByRole(user);
    } catch (err) {
      toast.error('Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            CampusCart AI
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            register for a student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-8 space-y-6">
          {/* Quick 1-Click Interactive Demo Login Pill Buttons */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
              Instant 1-Click Role Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemo('STUDENT')}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center justify-center space-x-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('SHOP_OWNER')}
                className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center justify-center space-x-1.5 transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Shop Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('DELIVERY_AGENT')}
                className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800 hover:bg-amber-100 flex items-center justify-center space-x-1.5 transition"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery Agent</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('ADMIN')}
                className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800 hover:bg-rose-100 flex items-center justify-center space-x-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Toggle between Password and Gmail OTP login */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMode('PASSWORD')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'PASSWORD'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('OTP')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1 ${
                authMode === 'OTP'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>Gmail OTP Login</span>
            </button>
          </div>

          {/* MODE 1: Standard Password Sign-In */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College or Vendor Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campuscart.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* MODE 2: Passwordless Gmail OTP Sign-In */}
          {authMode === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campuscart.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendLoginOtp}
                  disabled={submitting || !email}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{submitting ? 'Sending Code...' : 'Send OTP to Gmail'}</span>
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm tracking-[0.25em] font-mono font-bold text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Sent to your Gmail</span>
                    {countdown > 0 ? (
                      <span className="text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendLoginOtp}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{submitting ? 'Verifying...' : 'Sign In with OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

