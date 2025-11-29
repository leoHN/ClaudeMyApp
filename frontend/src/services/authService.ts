import api from './api'
import type { LoginCredentials, RegisterData, User, ApiResponse } from '../types'

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    )
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
    }
    return data.data
  },

  register: async (userData: RegisterData) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      userData
    )
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
    }
    return data.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data.data
  },

  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },
}
