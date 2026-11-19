import { createBrowserRouter, Navigate } from 'react-router'
import { PublicOnly, RequireAuth } from '@/features/auth/guards.jsx'
import LandingPage from '@/features/auth/LandingPage.jsx'
import LoginPage from '@/features/auth/LoginPage.jsx'
import RegisterPage from '@/features/auth/RegisterPage.jsx'
import HomePage from './HomePage.jsx'
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
      { path: '/discover', element: <HomePage label="001 — Discover" title="Discover" /> },
      { path: '/universe/new', element: <HomePage label="003 — Your universe" title="Create your universe." /> },
    ],
  },
  { path: '/styleguide', element: <StyleguidePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]

export const router = createBrowserRouter(routes)
