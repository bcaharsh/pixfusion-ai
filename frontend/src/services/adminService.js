import api from './api'

export const adminService = {
  // Dashboard Stats
  async getDashboardStats() {
    const response = await api.get('/api/admin/stats')
    return response.data
  },

  async getRevenueStats(period = 'month') {
    const response = await api.get(`/api/admin/stats/revenue?period=${period}`)
    return response.data
  },

  async getUsageStats() {
    const response = await api.get('/api/admin/stats/usage')
    return response.data
  },

  // User Management
  async getUsers(page = 1, limit = 20, search = '', status = '') {
    const response = await api.get(
      `/api/admin/users?page=${page}&limit=${limit}&search=${search}&status=${status}`
    )
    return response.data
  },

  async getUserById(id) {
    const response = await api.get(`/api/admin/users/${id}`)
    return response.data
  },

  async updateUser(id, data) {
    const response = await api.put(`/api/admin/users/${id}`, data)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/api/admin/users/${id}`)
    return response.data
  },

  async blockUser(id) {
    const response = await api.post(`/api/admin/users/${id}/block`)
    return response.data
  },

  async unblockUser(id) {
    const response = await api.post(`/api/admin/users/${id}/unblock`)
    return response.data
  },

  async manageUserCredits(id, credits, action) {
    const response = await api.post(`/api/admin/users/${id}/credits`, { credits, action })
    return response.data
  },

  // Image Management
  async getAllImages(page = 1, limit = 20, userId = '') {
    const response = await api.get(
      `/api/admin/images?page=${page}&limit=${limit}&userId=${userId}`
    )
    return response.data
  },

  async deleteAnyImage(id) {
    const response = await api.delete(`/api/admin/images/${id}`)
    return response.data
  },

  async moderateImage(id, status, reason) {
    const response = await api.put(`/api/admin/images/${id}/moderate`, { status, reason })
    return response.data
  },

  // Subscriptions
  async getAllSubscriptions() {
    const response = await api.get('/api/admin/subscriptions')
    return response.data
  },

  async createPlan(data) {
    const response = await api.post('/api/admin/subscriptions/plans', data)
    return response.data
  },

  async updatePlan(id, data) {
    const response = await api.put(`/api/admin/subscriptions/plans/${id}`, data)
    return response.data
  },

  async deletePlan(id) {
    const response = await api.delete(`/api/admin/subscriptions/plans/${id}`)
    return response.data
  },

  // Settings
  async getSettings() {
    const response = await api.get('/api/admin/settings')
    return response.data
  },

  async updateSettings(data) {
    const response = await api.put('/api/admin/settings', data)
    return response.data
  },

  async getLogs(level = '', page = 1) {
    const response = await api.get(`/api/admin/logs?level=${level}&page=${page}`)
    return response.data
  },
}