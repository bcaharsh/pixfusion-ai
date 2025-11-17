import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/user/Home'))
const Login = lazy(() => import('./pages/user/Login'))
const Register = lazy(() => import('./pages/user/Register'))
const ForgotPassword = lazy(() => import('./pages/user/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/user/ResetPassword'))
const Dashboard = lazy(() => import('./pages/user/Dashboard'))
const Generate = lazy(() => import('./pages/user/Generate'))
const MyGallery = lazy(() => import('./pages/user/MyGallery'))
const PublicGallery = lazy(() => import('./pages/user/PublicGallery'))
const Pricing = lazy(() => import('./pages/user/Pricing'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Checkout = lazy(() => import('./pages/user/Checkout'))
const PaymentSuccess = lazy(() => import('./pages/user/PaymentSuccess'))
const PaymentFailure = lazy(() => import('./pages/user/PaymentFailure'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminImages = lazy(() => import('./pages/admin/AdminImages'))
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions'))
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="xl" />
  </div>
)

// Layout wrapper for public pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
)

// Layout wrapper for protected user pages
const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
)

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><PublicGallery /></PublicLayout>} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout><Dashboard /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <UserLayout><Generate /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-gallery"
          element={
            <ProtectedRoute>
              <UserLayout><MyGallery /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserLayout><Profile /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:planId"
          element={
            <ProtectedRoute>
              <UserLayout><Checkout /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <UserLayout><PaymentSuccess /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/failure"
          element={
            <ProtectedRoute>
              <UserLayout><PaymentFailure /></UserLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go Back Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes