import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()

  // Check if we are on the Landing Page or Auth pages
  const isLanding = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  // Hide Global Header/Sidebar on Landing & Auth pages
  const showGlobalNav = !isLanding && !isAuthPage

  // Get header variant based on route
  const getVariant = () => {
    if (location.pathname.includes('/cinema')) return 'cinema'
    if (location.pathname.includes('/wire')) return 'wire'
    if (location.pathname.includes('/shadows')) return 'shadows'
    return 'gateway'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Only show Global Header if NOT on landing/auth */}
      {showGlobalNav && <Header variant={getVariant()} />}

      {/* Only show Sidebar if NOT on landing/auth */}
      {showGlobalNav && <Sidebar />}

      {/* Main Content Area */}
      {/* We remove padding on Landing/Auth pages so they can be full screen */}
      <main className={`
        relative z-0 transition-all duration-300
        ${showGlobalNav ? 'pt-24 pb-20 px-4 lg:pl-72' : ''} 
      `}>
        <Outlet />
      </main>
    </div>
  )
}