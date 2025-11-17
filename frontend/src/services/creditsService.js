import api from './api'

export const creditsService = {
  async getBalance() {
    const response = await api.get('/api/credits/balance')
    return response.data
  },

  async purchaseCredits(amount, paymentMethod) {
    const response = await api.post('/api/credits/purchase', { amount, paymentMethod })
    return response.data
  },

  async getHistory(page = 1, limit = 10) {
    const response = await api.get(`/api/credits/history?page=${page}&limit=${limit}`)
    return response.data
  },

  async getTransactions() {
    const response = await api.get('/api/credits/transactions')
    return response.data
  },
}