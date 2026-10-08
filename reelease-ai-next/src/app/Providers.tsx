'use client'

import { Toaster } from '@/components/ui/sonner'
import DynamicMetadata from '@/layout/DynamicMetadata'
import InternetConnectionWrapper from '@/layout/InternetConnectionWrapper'
import MaintenanceWrapper from '@/layout/MaintenanceWrapper'
import SocketProvider from '@/layout/SocketProvider'
import { FacebookSDKProvider } from '@/components/providers/FacebookSDKProvider'
import i18n from '@/lib/i18n'
import { ProviderProps } from '@/types/app'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { useEffect, useRef } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { initializeAuth } from '../redux/slices/authSlice'
import { initializeLayout } from '../redux/slices/layoutSlice'
import { store } from '../redux/store'

import { useAppSelector } from '@/redux/hooks'
import { useGetProfileQuery } from '@/redux/api/authApi'
import useSettings from '@/hooks/useSettings'
import DataLoader from '@/components/reusable/DataLoader'

const InitialLoadWrapper = ({ children }: { children: React.ReactNode }) => {
  const { settings, isLoading: isSettingsLoading } = useSettings()
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const { isLoading: isProfileLoading } = useGetProfileQuery(undefined, { skip: !isAuthenticated })
  const hasLoadedSettingsRef = useRef(false)

  if (settings && !hasLoadedSettingsRef.current) {
    hasLoadedSettingsRef.current = true
  }

  const shouldShowLoader = (isSettingsLoading && !hasLoadedSettingsRef.current) || isAuthLoading || isProfileLoading

  if (shouldShowLoader) {
    return <DataLoader fullPage />
  }

  return <>{children}</>
}

const Providers = ({ children }: ProviderProps) => {
  useEffect(() => {
    store.dispatch(initializeAuth())
    store.dispatch(initializeLayout())
  }, [])


  return (
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <SocketProvider>
            <FacebookSDKProvider>
              <DynamicMetadata />
              <InternetConnectionWrapper>
                <InitialLoadWrapper>
                  <MaintenanceWrapper>{children}</MaintenanceWrapper>
                </InitialLoadWrapper>
              </InternetConnectionWrapper>
            </FacebookSDKProvider>
          </SocketProvider>
          <Toaster richColors position="top-center" />
          <NextTopLoader showSpinner={false} />
        </ThemeProvider>
      </I18nextProvider>
    </ReduxProvider>
  )
}

export default Providers
