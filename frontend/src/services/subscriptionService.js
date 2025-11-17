import api from './api'

export const subscriptionService = {
  async getPlans() {
    const response = await api.get('/api/subscriptions/plans')
    return response.data
  },

  async subscribe(planId, paymentMethod) {
    const response = await api.post('/api/subscriptions/subscribe', { planId, paymentMethod })
    return response.data
  },

  async getCurrentSubscription() {
    const response = await api.get('/api/subscriptions/current')
    return response.data
  },

  async cancelSubscription() {
    const response = await api.post('/api/subscriptions/cancel')
    return response.data
  },

  async upgradeSubscription(newPlanId) {
    const response = await api.post('/api/subscriptions/upgrade', { newPlanId })
    return response.data
  },

  async getSubscriptionHistory() {
    const response = await api.get('/api/subscriptions/history')
    return response.data
  },
}