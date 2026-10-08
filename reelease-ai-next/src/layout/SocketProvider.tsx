'use client'

import { useSocketHandlers } from '@/hooks/useSocketHandlers'
import { useAppSelector } from '@/redux/hooks'
import { socket } from '@/services/socketSetup'
import { SocketProviderProps } from '@/types'
import { useEffect, useRef } from 'react'
import { SOCKET } from '@/constants/socket'

const SocketProvider = ({ children }: SocketProviderProps) => {
  const { user, token } = useAppSelector((store) => store.auth)
  const prevUserRef = useRef<typeof user>(null)
  
  useSocketHandlers()

  useEffect(() => {
    if (user && token) {
      if (!socket.connected) {
        socket.connect()
      }

      const handleConnect = () => {
        socket.emit(SOCKET.Emitters.Join_Room, user.id)
      }

      // The client retries automatically, so a warning is enough (console.error raises the Next.js dev overlay).
      const handleConnectError = (error: Error) => {
        console.warn('Socket connection failed, retrying:', error.message)
      }

      socket.on('connect', handleConnect)
      socket.on('connect_error', handleConnectError)

      if (socket.connected) {
        socket.emit(SOCKET.Emitters.Join_Room, user.id)
      }

      prevUserRef.current = user

      return () => {
        socket.off('connect', handleConnect)
        socket.off('connect_error', handleConnectError)
      }
    } else {
      if (prevUserRef.current && socket.connected) {
        socket.disconnect()
      }
      prevUserRef.current = null
    }
  }, [user, token])

  return <>{children}</>
}

export default SocketProvider
