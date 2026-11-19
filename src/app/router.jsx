import { createBrowserRouter, Navigate } from 'react-router'
import { PublicOnly, RequireAuth } from '@/features/auth/guards.jsx'
import LandingPage from '@/features/auth/LandingPage.jsx'
import LoginPage from '@/features/auth/LoginPage.jsx'
import RegisterPage from '@/features/auth/RegisterPage.jsx'
import RequireUniverse from '@/features/universe/RequireUniverse.jsx'
import HomePage from './HomePage.jsx'
import {
  ClosetPage,
  DiscoverPage,
  MatchesPage,
  NotificationsPage,
  ProfilePage,
  UniversePage,
} from './placeholders.jsx'
import AppShell from './shell/AppShell.jsx'
import StyleguidePage from './StyleguidePage.jsx'

export const routes = [
  {
    element: <PublicOnly />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/universe/new', element: <HomePage label="003 — Your universe" title="Create your universe." /> },
      {
        element: <RequireUniverse />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/discover', element: <DiscoverPage /> },
              { path: '/closet', element: <ClosetPage /> },
              { path: '/matches', element: <MatchesPage /> },
              { path: '/universe', element: <UniversePage /> },
              { path: '/notifications', element: <NotificationsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/styleguide', element: <StyleguidePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]

export const router = createBrowserRouter(routes)
