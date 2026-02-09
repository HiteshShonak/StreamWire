import { useEffect, useCallback, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { authService } from './api/services/auth.service'
import { login, logout, setLoading } from './store/authSlice'

import Header from './Components/Header'
import Sidebar from './Components/Sidebar'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  const { loading } = useSelector((state) => state.auth)

  const path = location.pathname

  const { isLanding, isAuthPage, isGateway, showHeader, showSidebar } = useMemo(() => {
    const isLanding = path === '/'
    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(path)
    const isGateway = path === '/home' 

    return {
      isLanding,
      isAuthPage,
      isGateway,
      showHeader: !isLanding,
      showSidebar: !isLanding && !isAuthPage && !isGateway
    }
  }, [path])

  const getHeaderVariant = useCallback(() => {
    if (path.startsWith('/cinema')) return 'cinema'
    if (path.startsWith('/wire')) return 'wire'
    if (path.startsWith('/shadows')) return 'shadows'
    return 'gateway'
  }, [path])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          dispatch(login(user))
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
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
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
  )
}

export default App