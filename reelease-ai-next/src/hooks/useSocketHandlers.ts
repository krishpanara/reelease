'use client'

import { SOCKET } from '@/constants/socket'
import { useNotifications } from '@/hooks/useNotifications'
import useSettings from '@/hooks/useSettings'
import { adminSettingApi } from '@/redux/api/adminSettingApi'
import { notificationApi } from '@/redux/api/notificationApi'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { getMediaUrl } from '@/utils'
import { isBrowser } from '@/utils/environment'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { toast } from 'sonner'

export const useSocketHandlers = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { settings } = useSettings()
  const { user } = useAppSelector((state) => state.auth)
  const { sendNotification, startBlinking, requestPermission } = useNotifications()
  const unreadMessagesRef = useRef<string[]>([])

  const notificationIcon = settings?.favicon_notification_logo_url
    ? getMediaUrl(settings.favicon_notification_logo_url)
    : settings?.favicon_url
      ? getMediaUrl(settings.favicon_url)
      : '/favicon.ico';

  useEffect(() => {
    // Request notification permission on mount if user is logged in
    if (user && isBrowser) {
      requestPermission();
    }
  }, [user, requestPermission])

  useEffect(() => {
    if (!user) return



    const handleNewNotification = (notification: any) => {
      if (notification.type !== 'AGENT_REQUEST') {
        toast.success(notification.title, { description: notification.message })


        if (typeof document !== 'undefined' && !document.hasFocus()) {
          const body = notification.message;
          unreadMessagesRef.current.push(`${notification.title}: ${body}`);

          sendNotification(notification.title, {
            body,
            icon: notificationIcon,
            onClick: () => {
              window.focus();
              if (notification.link) {
                router.push(notification.link);
              }
            }
          });

          startBlinking(unreadMessagesRef.current);
        }
      }
    }

    const handleAdminSettingsUpdated = () => {
      dispatch(adminSettingApi.util.invalidateTags(['AdminSettings']))
    }

    const handleUserNotification = (notification: any) => {
      handleNewNotification(notification)
      dispatch(notificationApi.util.invalidateTags(['Notification']))
    }

    // Register listeners
    socket.on('admin-settings-updated', handleAdminSettingsUpdated)
    socket.on(SOCKET.Listeners.New_Notification, handleNewNotification)
    socket.on(`notification-${user.id}`, handleUserNotification)
    
    return () => {
      // Unregister listeners
      socket.off('admin-settings-updated', handleAdminSettingsUpdated)
      socket.off(SOCKET.Listeners.New_Notification, handleNewNotification)
      socket.off(`notification-${user.id}`, handleUserNotification)
    }
  }, [user, dispatch,notificationIcon, router, sendNotification, startBlinking])
}
