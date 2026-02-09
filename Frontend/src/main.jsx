import { StrictMode } from 'react'
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

// 📄 Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import CinemaFeed from './pages/CinemaFeed.jsx'
import VideoPlayer from './pages/VideoPlayer.jsx'
import WireFeed from './pages/WireFeed.jsx'
import ShadowsFeed from './pages/ShadowsFeed.jsx'
import Channel from './pages/Channel.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Search from './Components/Search.jsx'
import WirePost from './Components/WirePost.jsx'
import ShadowPost from './Components/ShadowPost.jsx'

// 📄 Sidebar Pages
import Trending from './pages/Trending.jsx'
import Following from './pages/Following.jsx'
import History from './pages/History.jsx'
import Saved from './pages/Saved.jsx'
import Settings from './pages/Settings.jsx'
import Support from './pages/Support.jsx'
import KillSwitch from './pages/KillSwitch.jsx'
import UploadVideo from './pages/UploadVideo.jsx'
import Customize from './pages/Customize.jsx'
import BuildFeed from './pages/BuildFeed.jsx'
import NotFound from './pages/NotFound.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import Contact from './pages/Contact.jsx'
import About from './pages/About.jsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '/',
        element: <Landing />,
      },

      {
        path: '/login',
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: '/register',
        element: (
          <AuthLayout authentication={false}>
            <Register />
          </AuthLayout>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <AuthLayout authentication={false}>
            <ForgotPassword />
          </AuthLayout>
        ),
      },

      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/cinema',
        element: <CinemaFeed />,
      },
      {
        path: '/cinema/:videoId',
        element: <VideoPlayer />,
      },
      {
        path: '/wire',
        element: <WireFeed />,
      },
      {
        path: '/wire/:wireId',
        element: <WirePost />,
      },
      {
        path: '/shadows',
        element: <ShadowsFeed />,
      },
      {
        path: '/shadow/:shadowId',
        element: <ShadowPost />,
      },
      {
        path: '/c/:username',
        element: <Channel />,
      },
      {
        path: '/dashboard',
        element: (
          <AuthLayout authentication>
            <Dashboard />
          </AuthLayout>
        ),
      },
      {
        path: '/search',
        element: <Search />,
      },

      //Sidebar Navigation Pages
      {
        path: '/trending',
        element: <Trending />,
      },
      {
        path: '/following',
        element: (
          <AuthLayout authentication>
            <Following />
          </AuthLayout>
        ),
      },
      {
        path: '/history',
        element: (
          <AuthLayout authentication>
            <History />
          </AuthLayout>
        ),
      },
      {
        path: '/saved',
        element: (
          <AuthLayout authentication>
            <Saved />
          </AuthLayout>
        ),
      },
      {
        path: '/settings',
        element: (
          <AuthLayout authentication>
            <Settings />
          </AuthLayout>
        ),
      },
      {
        path: '/support',
        element: <Support />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/upload',
        element: (
          <AuthLayout authentication>
            <UploadVideo />
          </AuthLayout>
        ),
      },
      {
        path: '/customize',
        element: (
          <AuthLayout authentication>
            <Customize />
          </AuthLayout>
        ),
      },
      {
        path: '/change-password',
        element: (
          <AuthLayout authentication>
            <ChangePassword />
          </AuthLayout>
        ),
      },
      {
        path: '/kill-switch',
        element: (
          <AuthLayout authentication>
            <KillSwitch />
          </AuthLayout>
        ),
      },
      {
        path: '/build-feed',
        element: (
          <AuthLayout authentication>
            <BuildFeed />
          </AuthLayout>
        ),
      },

      {
        path: '*',
        element: <NotFound />,
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