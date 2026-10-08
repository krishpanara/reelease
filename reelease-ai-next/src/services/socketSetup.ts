import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['polling', 'websocket'], 
  // Keep retrying (every 1-5s) so live updates recover on their own after the API restarts.
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 45000, 
  forceNew: true,
  upgrade: true,
  rememberUpgrade: true,
})
