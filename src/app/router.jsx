import { createBrowserRouter, Navigate } from 'react-router'
import { PublicOnly, RequireAuth } from '@/features/auth/guards.jsx'
import LandingPage from '@/features/auth/LandingPage.jsx'
import LoginPage from '@/features/auth/LoginPage.jsx'
import RegisterPage from '@/features/auth/RegisterPage.jsx'
import ClosetPage from '@/features/closet/ClosetPage.jsx'
import DiscoverPage from '@/features/discover/DiscoverPage.jsx'
import CreateUniversePage from '@/features/universe/CreateUniversePage.jsx'
import EditUniversePage from '@/features/universe/editor/EditUniversePage.jsx'
import MyUniversePage from '@/features/universe/MyUniversePage.jsx'
import FirstPhotosPage from '@/features/universe/FirstPhotosPage.jsx'
import NoUniverseYet from '@/features/universe/NoUniverseYet.jsx'
import RequireUniverse from '@/features/universe/RequireUniverse.jsx'
import MatchesPage from '@/features/matches/MatchesPage.jsx'
import RequestsPage from '@/features/requests/RequestsPage.jsx'
import NotificationsPage from '@/features/notifications/NotificationsPage.jsx'
import ProfilePage from '@/features/profile/ProfilePage.jsx'
import AdminUsersPage from '@/features/admin/AdminUsersPage.jsx'
import ModeratePage from '@/features/admin/ModeratePage.jsx'
import RequireAdmin from '@/features/admin/RequireAdmin.jsx'
import UserDetailPage from '@/features/admin/UserDetail.jsx'
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
      {
        element: <NoUniverseYet />,
        children: [{ path: '/universe/new', element: <CreateUniversePage /> }],
      },
      {
        element: <RequireUniverse />,
        children: [
          { path: '/universe/new/photos', element: <FirstPhotosPage /> },
          { path: '/universe/edit', element: <EditUniversePage /> },
          {
            element: <AppShell />,
            children: [
              { path: '/discover', element: <DiscoverPage /> },
              { path: '/discover/rankings', element: <DiscoverPage /> },
              { path: '/closet', element: <ClosetPage /> },
              { path: '/closet/:itemId', element: <ClosetPage /> },
              { path: '/matches', element: <MatchesPage /> },
              { path: '/matches/:matchId', element: <MatchesPage /> },
              { path: '/universe', element: <MyUniversePage /> },
              { path: '/universe/requests', element: <RequestsPage /> },
            ],
          },
        ],
      },
      {
        element: <AppShell />,
        children: [
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            element: <RequireAdmin />,
            children: [
              { path: '/admin', element: <Navigate to="/admin/users" replace /> },
              { path: '/admin/users', element: <AdminUsersPage /> },
              { path: '/admin/users/:userId', element: <UserDetailPage /> },
              { path: '/admin/users/:userId/moderate', element: <ModeratePage /> },
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
