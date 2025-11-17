import api from './api'

export const paymentService = {
  async createPaymentIntent(amount, planId) {
    const response = await api.post('/api/payments/create-intent', { amount, planId })
    return response.data
  },

  async confirmPayment(paymentIntentId) {
    const response = await api.post('/api/payments/confirm', { paymentIntentId })
    return response.data
  },

  async getPaymentHistory() {
    const response = await api.get('/api/payments/history')
    return response.data
  },

  async requestRefund(paymentId, reason) {
    const response = await api.post('/api/payments/refund', { paymentId, reason })
    return response.data
  },

  async getPaymentMethods() {
    const response = await api.get('/api/payments/methods')
    return response.data
  },

  async addPaymentMethod(cardToken) {
    const response = await api.post('/api/payments/methods', { cardToken })
    return response.data
  },

  async removePaymentMethod(id) {
    const response = await api.delete(`/api/payments/methods/${id}`)
    return response.data
  },
}