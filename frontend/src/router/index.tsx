import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { PageWrapper } from '../components/layout/PageWrapper'

// Public Pages
import { HomePage } from '../pages/public/HomePage'
import { AboutPage } from '../pages/public/AboutPage'
import { ServicesPage } from '../pages/public/ServicesPage'
import { PlansPage } from '../pages/public/PlansPage'
import { TrainersPage } from '../pages/public/TrainersPage'
import { GalleryPage } from '../pages/public/GalleryPage'
import { TestimonialsPage } from '../pages/public/TestimonialsPage'
import { ContactPage } from '../pages/public/ContactPage'

export const router = createBrowserRouter(
  [
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
      ],
    },

    // Catch-all Redirect to Home
    {
      path: '*',
      element: <Navigate to={ROUTES.HOME} replace />,
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
)
