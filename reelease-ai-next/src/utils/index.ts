import { isBrowser } from './environment'
import { format } from 'date-fns'
import { CookieOptions } from '@/types/app'
import Cookies from 'js-cookie'
import { User } from '../types/auth'
import { Attachment } from '@/types'

/**
 * COOKIE UTILS
 */

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  sameSite: 'Strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60, // 7 days
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  if (!isBrowser) return

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  let expires: Date | number | undefined = mergedOptions.expires
  if (mergedOptions.maxAge !== undefined && !expires) {
    expires = mergedOptions.maxAge / (24 * 60 * 60)
  }

  const cookieOptions: Cookies.CookieAttributes = {
    expires: expires,
    path: mergedOptions.path,
    domain: mergedOptions.domain,
    secure: mergedOptions.secure,
    sameSite: mergedOptions.sameSite,
  }

  Cookies.set(name, value, cookieOptions)
}

export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null
  return Cookies.get(name) || null
}

export const removeCookie = (name: string, options: CookieOptions = {}): void => {
  if (!isBrowser) return

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  const cookieOptions: Cookies.CookieAttributes = {
    path: mergedOptions.path,
    domain: mergedOptions.domain,
  }

  Cookies.remove(name, cookieOptions)
}

export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null
}

/**
 * AUTH UTILS
 */

const TOKEN_KEY = 'authToken'
const USER_KEY = 'userData'

const getCookieOptions = () => ({
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict' as const,
})

export const authUtils = {
  setToken: (token: string): void => {
    if (isBrowser) {
      setCookie(TOKEN_KEY, token, getCookieOptions())
    }
  },

  getToken: (): string | null => {
    if (isBrowser) {
      const cookieToken = getCookie(TOKEN_KEY)
      if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') return cookieToken
    }
    return null
  },

  getCookieToken: (): string | null => {
    if (isBrowser) {
      return getCookie(TOKEN_KEY) || null
    }
    return null
  },

  removeToken: (): void => {
    if (isBrowser) {
      removeCookie(TOKEN_KEY, getCookieOptions())
    }
  },

  setUser: (user: User): void => {
    if (isBrowser) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (isBrowser) {
      const userData = localStorage.getItem(USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  removeUser: (): void => {
    if (isBrowser) {
      localStorage.removeItem(USER_KEY)
    }
  },

  clearAuth: (): void => {
    authUtils.removeToken()
    authUtils.removeUser()
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken()
  },
}

export const getMediaUrl = (path: string | null | undefined | any): string => {
  if (!path) return '';

  let sourcePath = '';
  if (typeof path === 'string') {
    sourcePath = path;
  } else if (typeof path === 'object' && path !== null) {
    sourcePath = path.file_path || path.path || path.url || '';
  }

  if (!sourcePath) return '';
  if (sourcePath.startsWith('http') || sourcePath.startsWith('data:')) return sourcePath;

  let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  // Normalize backslashes and forward slashes
  let cleanPath = sourcePath.replace(/\\/g, '/').replace(/\/+/g, '/');

  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  if (!cleanPath.startsWith('/uploads')) cleanPath = '/uploads' + cleanPath;

  return `${baseUrl}${cleanPath}`;
};

/** Normalize attachment/character paths to `uploads/...` without `/api` prefix. */
export const normalizeUploadPath = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  let clean = path.replace(/\\/g, '/').replace(/^\/api\//, '').replace(/^\//, '');
  if (!clean.startsWith('uploads/')) {
    clean = `uploads/${clean.replace(/^uploads\//, '')}`;
  }
  return clean;
};

export const formatDate = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    return format(d, 'do MMM, yyyy')
  } catch {
    return '-'
  }
}

export const formatDateTime = (date: string | number | Date | null | undefined): string => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    return format(d, 'do MMM, yyyy hh:mm a')
  } catch {
    return '-'
  }
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/** Resolves media path/URL to a same-origin proxy URL to bypass CORS during downloads. */
export const getDownloadUrl = (mediaPath: string | null | undefined): string => {
  if (!mediaPath) return '';
  
  let path = mediaPath;
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    try {
      path = new URL(mediaPath).pathname;
    } catch {
      // ignore
    }
  }
  
  // Normalize backslashes and duplicate slashes
  let cleanPath = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  cleanPath = cleanPath.replace(/^\//, ''); // remove leading slash
  cleanPath = cleanPath.replace(/^uploads\//, ''); // remove uploads/ prefix
  
  return `/api/uploads/${cleanPath}`;
};
