import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/auth.store';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/common/Spinner';

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/public/ServiceDetailPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Client dashboard pages
const ClientDashboard = lazy(() => import('@/pages/client/DashboardPage'));
const ApplicationsPage = lazy(() => import('@/pages/client/ApplicationsPage'));
const NewApplicationPage = lazy(() => import('@/pages/client/NewApplicationPage'));
const ApplicationDetailPage = lazy(() => import('@/pages/client/ApplicationDetailPage'));
const DocumentsPage = lazy(() => import('@/pages/client/DocumentsPage'));
const ProfilePage = lazy(() => import('@/pages/client/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/client/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/client/NotificationsPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminApplicationsPage = lazy(() => import('@/pages/admin/AdminApplicationsPage'));
const AdminApplicationDetailPage = lazy(() => import('@/pages/admin/AdminApplicationDetailPage'));
const AdminDocumentsPage = lazy(() => import('@/pages/admin/AdminDocumentsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminServicesPage = lazy(() => import('@/pages/admin/AdminServicesPage'));
const AdminTemplatesPage = lazy(() => import('@/pages/admin/AdminTemplatesPage'));

// Wrapper for lazy loaded components
function LazyComponent({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// Protected route wrapper - checks if user is authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore();

  // Show loader while auth is initializing
  if (!isInitialized || isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin route wrapper - checks if user has admin role
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyComponent>
            <HomePage />
          </LazyComponent>
        ),
      },
      {
        path: 'services',
        element: (
          <LazyComponent>
            <ServicesPage />
          </LazyComponent>
        ),
      },
      {
        path: 'services/:slug',
        element: (
          <LazyComponent>
            <ServiceDetailPage />
          </LazyComponent>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyComponent>
            <AboutPage />
          </LazyComponent>
        ),
      },
      {
        path: 'contact',
        element: (
          <LazyComponent>
            <ContactPage />
          </LazyComponent>
        ),
      },
    ],
  },

  // Auth routes
  {
    path: '/login',
    element: (
      <LazyComponent>
        <LoginPage />
      </LazyComponent>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyComponent>
        <RegisterPage />
      </LazyComponent>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <LazyComponent>
        <ForgotPasswordPage />
      </LazyComponent>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <LazyComponent>
        <ResetPasswordPage />
      </LazyComponent>
    ),
  },

  // Client dashboard routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyComponent>
            <ClientDashboard />
          </LazyComponent>
        ),
      },
      {
        path: 'applications',
        element: (
          <LazyComponent>
            <ApplicationsPage />
          </LazyComponent>
        ),
      },
      {
        path: 'applications/new',
        element: (
          <LazyComponent>
            <NewApplicationPage />
          </LazyComponent>
        ),
      },
      {
        path: 'applications/:id',
        element: (
          <LazyComponent>
            <ApplicationDetailPage />
          </LazyComponent>
        ),
      },
      {
        path: 'documents',
        element: (
          <LazyComponent>
            <DocumentsPage />
          </LazyComponent>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyComponent>
            <ProfilePage />
          </LazyComponent>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyComponent>
            <SettingsPage />
          </LazyComponent>
        ),
      },
      {
        path: 'notifications',
        element: (
          <LazyComponent>
            <NotificationsPage />
          </LazyComponent>
        ),
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <DashboardLayout isAdmin />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyComponent>
            <AdminDashboard />
          </LazyComponent>
        ),
      },
      {
        path: 'applications',
        element: (
          <LazyComponent>
            <AdminApplicationsPage />
          </LazyComponent>
        ),
      },
      {
        path: 'applications/:id',
        element: (
          <LazyComponent>
            <AdminApplicationDetailPage />
          </LazyComponent>
        ),
      },
      {
        path: 'documents',
        element: (
          <LazyComponent>
            <AdminDocumentsPage />
          </LazyComponent>
        ),
      },
      {
        path: 'users',
        element: (
          <LazyComponent>
            <AdminUsersPage />
          </LazyComponent>
        ),
      },
      {
        path: 'services',
        element: (
          <LazyComponent>
            <AdminServicesPage />
          </LazyComponent>
        ),
      },
      {
        path: 'templates',
        element: (
          <LazyComponent>
            <AdminTemplatesPage />
          </LazyComponent>
        ),
      },
    ],
  },

  // Catch all - 404
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
