'use client'

import { UseInternetConnectionReturn } from '@/types'
import { isBrowser, isNavigator } from '@/utils/environment'
import { useCallback, useEffect, useState } from 'react'

const useInternetConnection = (): UseInternetConnectionReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)

    try {
      // First: trust navigator.onLine as the fast path
      if (isNavigator && !navigator.onLine) {
        setIsOnline(false)
        setIsChecking(false)
        return
      }

      // Second: fetch a same-origin resource only (iOS blocks cross-origin HEAD requests)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal,
        })
        setIsOnline(true)
      } catch {
        // If same-origin fetch fails, trust navigator.onLine value
        setIsOnline(isNavigator ? navigator.onLine : false)
      } finally {
        clearTimeout(timeoutId)
      }
    } catch {
      setIsOnline(false)
    } finally {
      setIsChecking(false)
    }
  }, [])

  const retry = useCallback(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    // Initial sync with navigator.onLine
    if (isNavigator) {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => {
      checkConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsChecking(false)
    }

    if (isBrowser) {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    const initialCheck = setTimeout(() => {
      checkConnection()
    }, 100)

    return () => {
      clearTimeout(initialCheck)
      if (isBrowser) {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [checkConnection])

  return {
    isOnline,
    isChecking,
    retry,
  }
}

export default useInternetConnection
