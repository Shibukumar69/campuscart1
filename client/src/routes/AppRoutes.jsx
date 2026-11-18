import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { Marketplace } from '../pages/public/Marketplace';
import { Login } from '../pages/auth/Login';
import { RegisterStudent } from '../pages/auth/RegisterStudent';
import { ForgotPassword } from '../pages/auth/ForgotPassword';

// Student pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { CartPage } from '../pages/student/CartPage';
import { CheckoutPage } from '../pages/student/CheckoutPage';
import { OrderSuccessPage } from '../pages/student/OrderSuccessPage';
import { MyOrdersPage } from '../pages/student/MyOrdersPage';
import { SmartPrintingPage } from '../pages/student/SmartPrintingPage';
import { PrintTrackingPage } from '../pages/student/PrintTrackingPage';

// Vendor pages
import { VendorDashboard } from '../pages/vendor/VendorDashboard';
import { ProductManagement } from '../pages/vendor/ProductManagement';
import { InventoryManagement } from '../pages/vendor/InventoryManagement';
import { InventoryLedgerPage } from '../pages/vendor/InventoryLedgerPage';
import { ForecastingDashboard } from '../pages/vendor/ForecastingDashboard';
import { ReorderRecommendationsPage } from '../pages/vendor/ReorderRecommendationsPage';
import { VendorOrdersPage } from '../pages/vendor/VendorOrdersPage';
import { VendorPrintingQueuePage } from '../pages/vendor/VendorPrintingQueuePage';

// Delivery pages
import { DeliveryDashboard } from '../pages/delivery/DeliveryDashboard';

// Admin pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { AcademicCalendarPage } from '../pages/admin/AcademicCalendarPage';
import { VendorApprovalsPage } from '../pages/admin/VendorApprovalsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Role Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Layout Wrapper with Navbar & Footer
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors pb-16 md:pb-0">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
      <Route path="/marketplace" element={<PublicLayout><Marketplace /></PublicLayout>} />
      <Route path="/printing" element={<PublicLayout><SmartPrintingPage /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
      <Route path="/checkout" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}><PublicLayout><CheckoutPage /></PublicLayout></ProtectedRoute>} />
      <Route path="/order-success" element={<PublicLayout><OrderSuccessPage /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<RegisterStudent />} />

      {/* Student Portal (Dashboard Shell) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="print-jobs" element={<PrintTrackingPage />} />
      </Route>

      {/* Vendor Portal */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="ledger" element={<InventoryLedgerPage />} />
        <Route path="forecasting" element={<ForecastingDashboard />} />
        <Route path="reorder-advice" element={<ReorderRecommendationsPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="printing-queue" element={<VendorPrintingQueuePage />} />
      </Route>

      {/* Delivery Portal */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryDashboard />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="calendar" element={<AcademicCalendarPage />} />
        <Route path="approvals" element={<VendorApprovalsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="py-20 text-center space-y-4">
              <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
              <p className="text-xs text-slate-500">The requested campus route does not exist.</p>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
};
