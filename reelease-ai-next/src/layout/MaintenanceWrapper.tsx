'use client'

import DataLoader from '@/components/reusable/DataLoader'
import StatusPage from '@/components/reusable/StatusPage'
import useSettings from '@/hooks/useSettings'
import { useAppSelector } from '@/redux/hooks'
import { MaintenanceWrapperProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { Wrench } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

const MaintenanceWrapper = ({ children }: MaintenanceWrapperProps) => {
  const { settings, isLoading: isSettingsLoading } = useSettings()
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const pathname = usePathname()

  if (isSettingsLoading || isAuthLoading) {
    return null
  }

  const isAuthRoute =
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.includes('/forgot-password') ||
    pathname?.includes('/verify-otp') ||
    pathname?.includes('/reset-password')

  const isMaintenanceMode = Boolean(settings?.maintenance_mode) || settings?.maintenance_mode === '1' || settings?.maintenance_mode === 1
  const isSuperAdmin = user?.role === 'super_admin'

  const userIp = settings?.userIp
  const allowedIps = settings?.maintenance_allowed_ips || []

  // Enhanced IP Checker for strict match, wildcard, and basic IPv4 CIDR validation
  const checkIpMatch = (allowed: string, user?: string) => {
    if (!user) return false;
    if (allowed === user) return true;
    
    // Wildcard match (e.g. 192.168.*)
    if (allowed.includes('*')) {
      const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
      return regex.test(user);
    }
    
    // IPv4 CIDR Match (e.g. 192.168.29.78/24)
    if (allowed.includes('/') && user.includes('.')) {
      try {
        const [subnetIp, maskStr] = allowed.split('/');
        const mask = parseInt(maskStr, 10);
        
        const ipToNum = (ipStr: string) => ipStr.split('.').reduce((num, octet) => (num << 8) + parseInt(octet, 10), 0) >>> 0;
        
        const userNum = ipToNum(user);
        const subnetNum = ipToNum(subnetIp);
        const maskNum = ~((1 << (32 - mask)) - 1) >>> 0;
        
        return (userNum & maskNum) === (subnetNum & maskNum);
      } catch {
        return false;
      }
    }
    return false;
  }

  const isIpAllowed = allowedIps.some((ip: string) => checkIpMatch(ip, userIp))

  if (isMaintenanceMode && !isSuperAdmin && !isIpAllowed && !isAuthRoute) {
    return (
      <StatusPage
        title={settings?.maintenance_title || t('maintenance_mode_title')}
        description={settings?.maintenance_message || t('maintenance_mode_desc')}
        image={getMediaUrl(settings?.maintenance_image_url)}
        icon={Wrench}
        showHome={false}
        isMaintenance={true}
      />
    )
  }

  return <>{children}</>
}

export default MaintenanceWrapper
