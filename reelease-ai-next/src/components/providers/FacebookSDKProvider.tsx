'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import Script from 'next/script'
import useSettings from '@/hooks/useSettings'
import { FacebookContextType } from '@/types'

const FacebookContext = createContext<FacebookContextType>({
  isSDKReady: false,
  appId: null,
})

export const useFacebookSDK = () => useContext(FacebookContext)

export const FacebookSDKProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings()
  const [isSDKReady, setIsSDKReady] = useState(false)
  const isInitializedRef = useRef(false)
  
  const appId = settings?.facebook_app_id || null
  const apiVersion = settings?.facebook_api_version || 'v18.0'

  useEffect(() => {
    if (appId) {
      if (typeof window !== 'undefined') {
        // Define fbAsyncInit as early as possible
        window.fbAsyncInit = function() {
          if (!window.FB || isInitializedRef.current) return;
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: apiVersion
          })
          isInitializedRef.current = true
          setIsSDKReady(true)
        }

        // If FB is already loaded, initialize it manually
        if (window.FB && !isInitializedRef.current) {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: apiVersion
          })
          isInitializedRef.current = true
          setTimeout(() => {
            setIsSDKReady(true)
          }, 0)
        }
      }
    }
  }, [appId, apiVersion])

  return (
    <FacebookContext.Provider value={{ isSDKReady, appId }}>
      {appId && (
        <Script
          id="facebook-sdk"
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
          onLoad={() => {
            // Manual check if fbAsyncInit didn't fire
            if (window.FB && !isInitializedRef.current) {
              const facebookAppId = settings?.facebook_app_id
              if (facebookAppId) {
                window.FB.init({
                  appId: facebookAppId,
                  cookie: true,
                  xfbml: true,
                  version: settings?.facebook_api_version || 'v18.0'
                })
                isInitializedRef.current = true
                setIsSDKReady(true)
              }
            }
          }}
        />
      )}
      {children}
    </FacebookContext.Provider>
  )
}

