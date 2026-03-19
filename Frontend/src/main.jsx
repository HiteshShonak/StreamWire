import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './Components/ErrorBoundary.jsx'
import store from './store/store.js'
import './index.css'
import App from './App.jsx'
import AuthLayout from './Components/AuthLayout.jsx'

// Skeleton fallbacks (eagerly loaded so they render instantly while lazy chunks load)
import {
  CinemaFeedSkeleton,
  VideoPlayerSkeleton,
  WireFeedSkeleton,
  WirePostSkeleton,
  ChannelPageSkeleton,
  DashboardSkeleton,
  TrendingPageSkeleton,
  LibraryPageSkeleton,
  SearchSkeleton,
  ShadowsFeedSkeleton,
  AuthFormSkeleton,
  ChangePasswordSkeleton,
  SettingsPageSkeleton,
  ContentPageSkeleton,
  ContactPageSkeleton,
  AboutPageSkeleton,
  KillSwitchSkeleton,
  UploadPageSkeleton,
  CustomizePageSkeleton,
  HomePageSkeleton,
  LandingPageSkeleton,
} from './Components/Common/Skeleton'

// Lazy-loaded pages (each becomes its own chunk, downloaded on demand)
const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const CinemaFeed = lazy(() => import('./pages/CinemaFeed.jsx'))
const VideoPlayer = lazy(() => import('./pages/VideoPlayer.jsx'))
const WireFeed = lazy(() => import('./pages/WireFeed.jsx'))
const ShadowsFeed = lazy(() => import('./pages/ShadowsFeed.jsx'))
const Channel = lazy(() => import('./pages/Channel.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Search = lazy(() => import('./Components/Search.jsx'))
const WirePost = lazy(() => import('./Components/WirePost.jsx'))
const ShadowPost = lazy(() => import('./Components/ShadowPost.jsx'))
const Trending = lazy(() => import('./pages/Trending.jsx'))
const Following = lazy(() => import('./pages/Following.jsx'))
const History = lazy(() => import('./pages/History.jsx'))
const Saved = lazy(() => import('./pages/Saved.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const KillSwitch = lazy(() => import('./pages/KillSwitch.jsx'))
const UploadVideo = lazy(() => import('./pages/UploadVideo.jsx'))
const UploadStatus = lazy(() => import('./pages/UploadStatus.jsx'))
const Customize = lazy(() => import('./pages/Customize.jsx'))
const BuildFeed = lazy(() => import('./pages/BuildFeed.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const ChangePassword = lazy(() => import('./pages/ChangePassword.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const About = lazy(() => import('./pages/About.jsx'))

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LandingPageSkeleton />}>
            <Landing />
          </Suspense>
        ),
      },

      // Auth pages (centered glass card layout)
      {
        path: '/login',
        element: (
          <AuthLayout authentication={false}>
            <Suspense fallback={<AuthFormSkeleton />}>
              <Login />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/register',
        element: (
          <AuthLayout authentication={false}>
            <Suspense fallback={<AuthFormSkeleton fieldCount={4} />}>
              <Register />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <AuthLayout authentication={false}>
            <Suspense fallback={<AuthFormSkeleton />}>
              <ForgotPassword />
            </Suspense>
          </AuthLayout>
        ),
      },

      // Main content feeds
      {
        path: '/home',
        element: (
          <Suspense fallback={<HomePageSkeleton />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: '/cinema',
        element: (
          <Suspense fallback={<CinemaFeedSkeleton />}>
            <CinemaFeed />
          </Suspense>
        ),
      },
      {
        path: '/cinema/:videoId',
        element: (
          <Suspense fallback={<VideoPlayerSkeleton />}>
            <VideoPlayer />
          </Suspense>
        ),
      },
      {
        path: '/wire',
        element: (
          <Suspense fallback={<WireFeedSkeleton />}>
            <WireFeed />
          </Suspense>
        ),
      },
      {
        path: '/wire/:wireId',
        element: (
          <Suspense fallback={<WirePostSkeleton />}>
            <WirePost />
          </Suspense>
        ),
      },
      {
        path: '/shadows',
        element: (
          <Suspense fallback={<ShadowsFeedSkeleton />}>
            <ShadowsFeed />
          </Suspense>
        ),
      },
      {
        path: '/shadow/:shadowId',
        element: (
          <Suspense fallback={<WirePostSkeleton />}>
            <ShadowPost />
          </Suspense>
        ),
      },
      {
        path: '/c/:username',
        element: (
          <Suspense fallback={<ChannelPageSkeleton />}>
            <Channel />
          </Suspense>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/search',
        element: (
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        ),
      },

      // Sidebar pages
      {
        path: '/trending',
        element: (
          <Suspense fallback={<TrendingPageSkeleton />}>
            <Trending />
          </Suspense>
        ),
      },
      {
        path: '/following',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<LibraryPageSkeleton />}>
              <Following />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/history',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<LibraryPageSkeleton />}>
              <History />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/saved',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<LibraryPageSkeleton />}>
              <Saved />
            </Suspense>
          </AuthLayout>
        ),
      },

      // Settings & account pages
      {
        path: '/settings',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<SettingsPageSkeleton />}>
              <Settings />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/customize',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<CustomizePageSkeleton />}>
              <Customize />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/change-password',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<ChangePasswordSkeleton />}>
              <ChangePassword />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/kill-switch',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<KillSwitchSkeleton />}>
              <KillSwitch />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/upload',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<UploadPageSkeleton />}>
              <UploadVideo />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/uploading/:id',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<UploadPageSkeleton />}>
              <UploadStatus />
            </Suspense>
          </AuthLayout>
        ),
      },
      {
        path: '/build-feed',
        element: (
          <AuthLayout authentication>
            <Suspense fallback={<ContentPageSkeleton />}>
              <BuildFeed />
            </Suspense>
          </AuthLayout>
        ),
      },

      // Info pages
      {
        path: '/support',
        element: (
          <Suspense fallback={<ContentPageSkeleton />}>
            <Support />
          </Suspense>
        ),
      },
      {
        path: '/contact',
        element: (
          <Suspense fallback={<ContactPageSkeleton />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: '/about',
        element: (
          <Suspense fallback={<AboutPageSkeleton />}>
            <About />
          </Suspense>
        ),
      },

      // Catch-all
      {
        path: '*',
        element: (
          <Suspense fallback={<HomePageSkeleton />}>
            <NotFound />
          </Suspense>
        ),
      }
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid #27272a',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)