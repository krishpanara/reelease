import { AuthState } from '@/types'
import { authUtils } from '@/utils'
import { createSlice } from '@reduxjs/toolkit'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const token = authUtils.getToken()
      const user = authUtils.getUser()

      if (token && user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true

        if (typeof window !== 'undefined') {
          const cookieToken = authUtils.getCookieToken()
          if (!cookieToken && token) {
            authUtils.setToken(token)
          }
        }
      }
      state.isLoading = false
    },
    setAuth: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) =>
        action.type === 'api/executeQuery/fulfilled' && action.meta?.arg?.endpointName === 'getProfile',
      (state, action: any) => {
        if (action.payload?.user) {
          const userWithPermissions = {
            ...action.payload.user,
            permissions: action.payload.user.permissions || [],
          }
          state.user = userWithPermissions
          authUtils.setUser(userWithPermissions)
        }
      },
    )
  },
})

export const { initializeAuth, setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
