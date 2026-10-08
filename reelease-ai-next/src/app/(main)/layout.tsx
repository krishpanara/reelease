'use client'
import NotFound from '@/app/not-found'
import DataLoader from '@/components/reusable/DataLoader'
import { ROUTES } from '@/constants/routes'
import { sidebarMenuData } from '@/data/sidebarData'
import { usePermission } from '@/hooks/usePermission'
import { useGetProfileQuery } from '@/redux/api/authApi'
import Header from '@/layout/header'
import Sidebar from '@/layout/sidebar'
import { cn } from '@/lib/utils'
import { setSidebarCollapsed } from '@/redux/slices/layoutSlice'
import { RootState } from '@/redux/store'
import { DashboardLayoutProps, MenuItem } from '@/types/layout'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAppDirection } from '@/hooks/useAppDirection'
import { hiddenAllowedPaths } from '@/data/layout'

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth)
  const { isLoading: isProfileLoading } = useGetProfileQuery(undefined, { skip: !isAuthenticated })
  const { hasPermission, role } = usePermission()

  // Flatten all menu items to check permissions for the current route
  const allMenuItems = useMemo(() => {
    const items: MenuItem[] = []
    const flatten = (menuItems: MenuItem[]) => {
      menuItems.forEach((item) => {
        if (item.path) items.push(item)
        if (item.children) flatten(item.children)
      })
    }
    sidebarMenuData.forEach((section) => flatten(section.items))
    return items
  }, [])

  // Check if the current route is allowed based on sidebar permissions
  const isRouteAllowed = useMemo(() => {
    if (!user) return true

    // Find if the current path matches any sidebar item (or its sub-paths)
    const matchedItem = allMenuItems
      .filter((item) => {
        const basePath = item.path ? item.path.split('?')[0] : ''
        return pathname === basePath || (basePath !== '/' && pathname.startsWith(`${basePath}/`))
      })
      .sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0))[0]



    const isHiddenAllowed = hiddenAllowedPaths.some(
      (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)),
    )

    if (isHiddenAllowed) return true

    if (!matchedItem) {
      return false
    }

    // Re-implement the visibility logic from the Sidebar component
    if (matchedItem.requiredPermission && !hasPermission(matchedItem.requiredPermission)) {
      return false
    }
    if (matchedItem.requiredPermissions && !matchedItem.requiredPermissions.some((p) => hasPermission(p))) {
      return false
    }
    if (matchedItem.requiredRole && role !== matchedItem.requiredRole) {
      return false
    }

    return true
  }, [pathname, allMenuItems, user, hasPermission, role])

  const dispatch = useDispatch()
  const { isSidebarCollapsed } = useSelector((state: RootState) => state.layout)
  const isSidebarCollapsedRef = useRef(isSidebarCollapsed)

  useEffect(() => {
    isSidebarCollapsedRef.current = isSidebarCollapsed
  }, [isSidebarCollapsed])

  useEffect(() => {
    const updateSidebarBasedOnWidth = () => {
      const windowWidth = window.innerWidth
      const currentCollapsed = isSidebarCollapsedRef.current

      if (windowWidth >= 992 && windowWidth <= 1280) {
        if (!currentCollapsed) {
          dispatch(setSidebarCollapsed(true))
        }
      } else if (windowWidth > 1280) {
        if (currentCollapsed) {
          dispatch(setSidebarCollapsed(false))
        }
      }
    }

    updateSidebarBasedOnWidth()
    window.addEventListener('resize', updateSidebarBasedOnWidth)
    return () => window.removeEventListener('resize', updateSidebarBasedOnWidth)
  }, [dispatch])

  const lastPathnameRef = useRef(pathname)

  useEffect(() => {
    // Only trigger auto-collapse/expand when route actually changes
    if (lastPathnameRef.current !== pathname) {
      setTimeout(() => {
        setIsMobileMenuOpen(false)
      }, 0)

      const collapseRoutes: string[] = []

      // We only collapse for the Messages/Inbox module to maximize workspace
      if (collapseRoutes.includes(pathname as string)) {
        if (!isSidebarCollapsedRef.current) {
          dispatch(setSidebarCollapsed(true))
        }
      } else {
        // Return to default state for other modules if shared width allows
        if (isSidebarCollapsedRef.current && window.innerWidth > 1280) {
          dispatch(setSidebarCollapsed(false))
        }
      }
      lastPathnameRef.current = pathname
    }
  }, [pathname, dispatch])


  const direction = useAppDirection()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LANDING)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || isProfileLoading || !isAuthenticated) {
    return null
  }

  if (!isRouteAllowed && !isLoading && isAuthenticated) {
    return <NotFound />
  }

  return (
    <div className="flex h-screen gap-0 min-[992px]:gap-3 overflow-hidden transition-all duration-500 relative bg-(--light-body)">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"></div>

      {/* Mobile Menu Backdrop */}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 min-[992px]:hidden flex justify-start">
          {/* Dimmed Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-light-body/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar Content */}
          <div className={cn("relative z-50 h-full", direction === 'rtl' ? 'animate-slide-in-right' : 'animate-slide-in-left')}>
            <div className="h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} dir={direction} />
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          'hidden min-[992px]:block flex-shrink-0 z-[50] transition-all duration-500 ease-in-out ',
          isSidebarCollapsed ? 'w-20' : 'w-[260px]',
        )}
      >
        <Sidebar onLogoClick={() => router.push(ROUTES.DASHBOARD)} dir={direction} />
      </div>

      {/* Floating Main Content Area */}
      <div
        className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden relative z-10 transition-all duration-500"
      >
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} dir={direction} />
        <main
          dir={direction}
          className={cn(
            'flex-1 min-[992px]:p-8 px-4 pt-0! xl1280:p-8 lg991:p-4! lg991:pt-0! md:pb-6 pb-4 bg-transparent no-scrollbar bg-glass-bg backdrop-blur-3xl border-glass-border',
            'overflow-y-auto overflow-x-hidden'
          )}
        >
          <div
            className={cn(
              'w-full',
              'animate-fade-in'
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
