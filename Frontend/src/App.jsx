import { useEffect, useCallback, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LoadingPulse } from './Components/Common/LoadingIndicator'
import { authService } from './api/services/auth.service'
import { login, logout, setLoading } from './store/authSlice'

import Header from './Components/Header'
import Sidebar from './Components/Sidebar'
import { UploadProvider } from './context/UploadContext'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  const { loading } = useSelector((state) => state.auth)

  const path = location.pathname

  const { isLanding, isAuthPage, isGateway, showHeader, showSidebar } = useMemo(() => {
    const isLanding = path === '/'
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(path)
    const isGateway = path === '/home'
    const isOnboarding = path === '/customize' && location.search.includes('onboarding=true')

    return {
      isLanding,
      isAuthPage,
      isGateway,
      showHeader: !isLanding && !isOnboarding,
      showSidebar: !isLanding && !isAuthPage && !isGateway && !isOnboarding
    }
  }, [path, location.search])

  const getHeaderVariant = useCallback(() => {
    if (path.startsWith('/cinema')) return 'cinema'
    if (path.startsWith('/wire')) return 'wire'
    if (path.startsWith('/shadows')) return 'shadows'
    return 'gateway'
  }, [path])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        if (userData) {
          // wrap in { user } so authSlice can destructure it
          // tokens stay in localStorage from original login
          dispatch(login({ user: userData }))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        dispatch(logout())
      } finally {
        dispatch(setLoading(false))
      }
    }
    checkAuth()
  }, [dispatch])

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <LoadingPulse size="md" />
      </div>
    )
  }

  return (
    <UploadProvider>
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">

      {showHeader && <Header variant={getHeaderVariant()} />}

      {showSidebar && <Sidebar />}

      <main className={`
        relative z-0 min-h-screen transition-all duration-500 ease-out
        ${showSidebar ? 'lg:pl-72' : ''} 
      `}>
        <Outlet />
      </main>

    </div>
    </UploadProvider>
  )
}

export default App