import api from './api'

export const imageService = {
  async generateImage(prompt, size = '1024x1024', quality = 'standard') {
    const response = await api.post('/api/images/generate', { prompt, size, quality })
    return response.data
  },

  async getMyImages(page = 1, limit = 10) {
    const response = await api.get(`/api/images?page=${page}&limit=${limit}`)
    return response.data
  },

  async getImageById(id) {
    const response = await api.get(`/api/images/${id}`)
    return response.data
  },

  async deleteImage(id) {
    const response = await api.delete(`/api/images/${id}`)
    return response.data
  },

  async downloadImage(id) {
    const response = await api.post(`/api/images/${id}/download`)
    return response.data
  },

  async likeImage(id) {
    const response = await api.post(`/api/images/${id}/like`)
    return response.data
  },

  async getPublicGallery(page = 1, limit = 20, sort = 'latest') {
    const response = await api.get(`/api/images/gallery?page=${page}&limit=${limit}&sort=${sort}`)
    return response.data
  },
}