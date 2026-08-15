import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProtectedMemberRoute } from './ProtectedMemberRoute';
import { ProtectedAdminRoute } from './ProtectedAdminRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { PlansPage } from '../pages/public/PlansPage';
import { TrainersPage } from '../pages/public/TrainersPage';
import { GalleryPage } from '../pages/public/GalleryPage';
import { TestimonialsPage } from '../pages/public/TestimonialsPage';
import { ContactPage } from '../pages/public/ContactPage';

// Auth Pages
import { MemberLoginPage } from '../pages/auth/MemberLoginPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// Member Portal
import { MemberDashboardPage } from '../pages/member/MemberDashboardPage';

// Admin Dashboard
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { MembersPage } from '../pages/admin/MembersPage';
import { MemberImportPage } from '../pages/admin/MemberImportPage';
import { PaymentsPage } from '../pages/admin/PaymentsPage';
import { PlansAdminPage } from '../pages/admin/PlansAdminPage';
import { ServicesAdminPage } from '../pages/admin/ServicesAdminPage';
import { TrainersAdminPage } from '../pages/admin/TrainersAdminPage';
import { GalleryAdminPage } from '../pages/admin/GalleryAdminPage';
import { StatsAdminPage } from '../pages/admin/StatsAdminPage';
import { SettingsPage } from '../pages/admin/SettingsPage';

export const router = createBrowserRouter([
  // Public Routes (wrapped in PageWrapper with Navbar and Footer)
  {
    element: (
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    ),
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.SERVICES, element: <ServicesPage /> },
      { path: ROUTES.PLANS, element: <PlansPage /> },
      { path: ROUTES.TRAINERS, element: <TrainersPage /> },
      { path: ROUTES.GALLERY, element: <GalleryPage /> },
      { path: ROUTES.TESTIMONIALS, element: <TestimonialsPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
      { path: ROUTES.MEMBER_LOGIN, element: <MemberLoginPage /> },
      { path: ROUTES.ADMIN_LOGIN, element: <AdminLoginPage /> },
    ],
  },

  // Protected Member Portal Routes
  {
    element: <ProtectedMemberRoute />,
    children: [
      {
        element: (
          <PageWrapper showFooter={false}>
            <Outlet />
          </PageWrapper>
        ),
        children: [
          { path: ROUTES.MEMBER_DASHBOARD, element: <MemberDashboardPage /> },
        ],
      },
    ],
  },

  // Protected Admin Control Plane Routes
  {
    element: <ProtectedAdminRoute />,
    children: [
      { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboardPage /> },
      { path: ROUTES.ADMIN_MEMBERS, element: <MembersPage /> },
      { path: ROUTES.ADMIN_MEMBER_IMPORT, element: <MemberImportPage /> },
      { path: ROUTES.ADMIN_PAYMENTS, element: <PaymentsPage /> },
      { path: ROUTES.ADMIN_PLANS, element: <PlansAdminPage /> },
      { path: ROUTES.ADMIN_SERVICES, element: <ServicesAdminPage /> },
      { path: ROUTES.ADMIN_TRAINERS, element: <TrainersAdminPage /> },
      { path: ROUTES.ADMIN_GALLERY, element: <GalleryAdminPage /> },
      { path: ROUTES.ADMIN_STATS, element: <StatsAdminPage /> },
      { path: ROUTES.ADMIN_SETTINGS, element: <SettingsPage /> },
    ],
  },

  // Catch-all Redirect to Home
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);
