import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  async register(name, email, password) {
    const response = await api.post('/api/auth/register', { name, email, password })
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/api/auth/profile', data)
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/api/auth/reset-password', { token, newPassword })
    return response.data
  },
}