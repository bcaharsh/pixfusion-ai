import api from './api'

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/api/notifications')
    return response.data
  },

  async markAsRead(notificationId) {
    const response = await api.put(`/api/notifications/${notificationId}/read`)
    return response.data
  },

  async markAllAsRead() {
    const response = await api.post('/api/notifications/read-all')
    return response.data
  },

  async deleteNotification(notificationId) {
    const response = await api.delete(`/api/notifications/${notificationId}`)
    return response.data
  },
}