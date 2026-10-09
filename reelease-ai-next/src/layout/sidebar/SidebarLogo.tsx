import useSettings from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import { getMediaUrl } from '@/utils'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const SidebarLogo = ({ isCollapsed, onClick }: { isCollapsed?: boolean; onClick?: () => void }) => {
  const { settings } = useSettings()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  // Brand Logo 1: Expanded (Main Brand Logo)
  const darkExpanded = settings?.logo_dark_url ? getMediaUrl(settings.logo_dark_url) : '/images/dark-logo1.png'
  const lightExpanded = settings?.logo_light_url ? getMediaUrl(settings.logo_light_url) : '/images/light-logo1.png'
  const expandedLogoUrl = !mounted ? darkExpanded : (isDark ? darkExpanded : lightExpanded)

  // Brand Logo 2: Collapsed (Small Logo/Icon)
  const darkCollapsed = settings?.sidebar_logo_url ? getMediaUrl(settings.sidebar_logo_url) : '/images/logo.png'
  const lightCollapsed = settings?.sidebar_light_logo_url ? getMediaUrl(settings.sidebar_light_logo_url) : '/images/logo.png'
  const collapsedLogoUrl = !mounted ? darkCollapsed : (isDark ? darkCollapsed : lightCollapsed)

  const appName = settings?.app_name || 'My Application'

  return (
    <div className={cn('p-6 pt-3! pb-2!', isCollapsed && 'px-0')} onClick={onClick}>
      <div className="relative flex items-center w-full h-12 cursor-pointer overflow-hidden group">
        {/* Collapsed Logo (Brand Logo 2) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-500',
            isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none',
          )}
        >
          <Image
            src={collapsedLogoUrl as string}
            alt={appName}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Expanded Logo (Brand Logo 1) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-start transition-all duration-500 origin-left rtl:origin-right',
            isCollapsed ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100',
          )}
        >
          <Image
            src={expandedLogoUrl as string}
            alt={appName}
            width={150}
            height={40}
            unoptimized
            className="w-auto h-9 max-w-full object-contain rtl:ml-auto"
          />
        </div>
      </div>
    </div>
  )
}

export default SidebarLogo
