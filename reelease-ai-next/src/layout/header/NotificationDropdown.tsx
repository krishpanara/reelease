'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { useAppDirection } from '@/hooks/useAppDirection'
import { cn } from '@/lib/utils'
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/redux/api/notificationApi'
import { useAppSelector } from '@/redux/hooks'
import { formatDate } from '@/utils'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Bell, CheckCircle2, Info, Loader2, Mail, MessageSquare } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: {
    account_name?: string
    post_url?: string
    [key: string]: unknown
  }
}

const NotificationDropdown = () => {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
  })
  const [markAsRead] = useMarkAsReadMutation()
  const direction = useAppDirection()

  const notifications = data?.data || []
  const unreadCount = data?.unreadCount || 0

  useEffect(() => {
    // skip refetch if query is not started
  }, [user?.id])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
    } catch {
      console.error('Failed to mark notification as read')
    }
  }

  // Helper to get relative time safely
  const getRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return formatDate(dateStr)
    }
  }

  // Helper to get icon based on notification content/type
  const getNotificationIcon = (title: string, message: string) => {
    const text = (title + ' ' + message).toLowerCase()
    if (text.includes('error') || text.includes('failed') || text.includes('alert') || text.includes('unpublish'))
      return <AlertCircle className="w-5 h-5 text-red-500" />
    if (text.includes('success') || text.includes('completed') || text.includes('done') || text.includes('publish'))
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    if (text.includes('message') || text.includes('chat')) return <MessageSquare className="w-5 h-5 text-blue-500" />
    if (text.includes('mail')) return <Mail className="w-5 h-5 text-amber-500" />
    return <Info className="w-5 h-5 text-primary" />
  }

  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t('notifications')}
          className={cn(
            'relative bg-black/3! dark:bg-white/3! rounded-border-radius-inner! transition-all duration-300 h-9 w-9 sm:h-11 sm:w-11 group',
            unreadCount > 0 ? 'hover:scale-105 active:scale-95' : '',
          )}
        >
          <motion.div
            animate={
              unreadCount > 0
                ? {
                  rotate: [0, 15, -15, 15, 0],
                }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: 2,
              repeatDelay: 3,
            }}
          >
            <Bell className="w-5! h-5! text-title-color" />
          </motion.div>

          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center "
              >
                <span className="absolute inline-flex bottom-4 left-4 h-4 w-4 animate-ping rounded-full bg-primary/40 opacity-75"></span>
                <span className="absolute bottom-4 left-4 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                  {unreadCount}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        collisionPadding={16}
        className="w-[calc(100vw-32px)] sm:w-[380px] p-0 overflow-hidden bg-white/95 dark:bg-white/3 backdrop-blur-3xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
        sideOffset={8}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/2 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DropdownMenuLabel className="p-0 text-base font-bold text-title-color dark:text-white leading-none mb-1">
                {t('notifications')}
              </DropdownMenuLabel>
              <p className="text-[14px] text-subtitle-color font-medium">
                {unreadCount} {unreadCount === 1 ? 'New Message' : 'New Messages'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkAsRead('all')}
                className="h-8 px-3 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {t('mark_all_as_read', { defaultValue: 'Mark all as read' })}
              </Button>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground animate-pulse">{t('syncing_updates')}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="inline-flex p-4 bg-gray-50 dark:bg-white/[0.03] rounded-full mb-4">
                <Bell className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <h4 className="text-sm font-bold text-title-color dark:text-white mb-1">{t('stay_updated')}</h4>
              <p className="text-xs text-muted-foreground">{t('stay_updated_desc')}</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[250px] no-scrollbar overflow-auto">
              <AnimatePresence initial={false}>
                {notifications.map((notification: NotificationItem, index: number) => {
                  const text = (notification.title + ' ' + notification.message).toLowerCase()
                  const isSuccess = text.includes('success') || text.includes('completed') || text.includes('done') || text.includes('publish')
                  const isFailed = text.includes('error') || text.includes('failed') || text.includes('alert') || text.includes('unpublish')
                  const isMessage = text.includes('message') || text.includes('chat')
                  const isMail = text.includes('mail')

                  // Format title and extract account name
                  let displayTitle = notification.title
                  let accountName = notification.data?.account_name || ''

                  if (isSuccess && (displayTitle.toLowerCase().includes('success') || displayTitle.toLowerCase().includes('published'))) {
                    displayTitle = 'Published'
                  } else if (isFailed && (displayTitle.toLowerCase().includes('failed') || displayTitle.toLowerCase().includes('unpublish'))) {
                    displayTitle = 'Unpublished'
                  }

                  // If accountName is empty, try to extract it from the message parentheses (e.g. "Your post has been published to threads (Marketing Web).")
                  if (!accountName) {
                    const match = notification.message.match(/\(([^)]+)\)\.?$/)
                    if (match) {
                      accountName = match[1]
                    }
                  }

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DropdownMenuItem
                        className={cn(
                          'group mx-2 px-2 py-3 flex items-start gap-3 rounded-none!  border-b border-glass-border  cursor-pointer 1transition-all duration-300',
                          !notification.is_read ? 'bg-primary/[0.02] dark:bg-primary/[0.04]' : '',
                          'hover:bg-gray-50 dark:hover:bg-white/[0.05]',
                        )}
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkAsRead(notification.id)
                          }
                          if (notification.data?.post_url) {
                            window.open(notification.data.post_url, '_blank')
                          }
                        }}
                      >
                        <div
                          className={cn(
                            'p-1.5 rounded-xl transition-colors duration-300 flex-shrink-0 flex items-center justify-center w-8 h-8',
                            isFailed
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                              : isSuccess
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                                : isMessage
                                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                                  : isMail
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                                    : 'bg-primary/10 text-primary'
                          )}
                        >
                          {getNotificationIcon(notification.title, notification.message)}
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex flex-col gap-1 ">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-[15px] text-left rtl:text-right transition-colors duration-300',
                                  !notification.is_read
                                    ? 'font-bold text-title-color dark:text-white'
                                    : 'font-semibold text-title-color dark:text-white',
                                )}
                              >
                                {displayTitle}
                              </span>
                              {accountName && (
                                <span className="text-[15px] font-bold text-primary dark:text-primary-light">
                                  {accountName}
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                'text-sm leading-relaxed text-left transition-colors duration-300 line-clamp-2 text-subtitle-color',
                                !notification.is_read ? 'font-medium' : 'font-normal',
                              )}
                            >
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground/80 text-left rtl:text-right font-medium pt-0.5">
                              {getRelativeTime(notification.created_at)}
                            </span>
                          </div>
                        </div>

                        {!notification.is_read && (
                          <div className="mt-1 flex-shrink-0 flex items-center justify-center w-6 h-6 relative">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full hover:bg-primary/20 text-primary hidden group-hover:flex items-center justify-center p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification.id)
                              }}
                              title={t('mark_as_read', { defaultValue: 'Mark as read' })}
                            >
                              <CheckCircle2 className="w-6 h-6" />
                            </Button>
                            <div className="w-2 h-2 rounded-full bg-primary shadow-sm group-hover:hidden" />
                          </div>
                        )}
                      </DropdownMenuItem>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
