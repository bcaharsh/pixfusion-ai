import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { imageService } from '../../services/imageService'
import { subscriptionService } from '../../services/subscriptionService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ImageCard from '../../components/image/ImageCard'
import { Image, CreditCard, Zap, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentImages, setRecentImages] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [imagesData, subData] = await Promise.all([
        imageService.getMyImages(1, 6),
        subscriptionService.getCurrentSubscription()
      ])
      
      setRecentImages(imagesData.images || [])
      setSubscription(subData)
      setStats({
        totalImages: imagesData.total || 0,
        creditsUsed: user?.creditsUsed || 0,
        creditsRemaining: user?.credits || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Image className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalImages}</p>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Zap className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Credits Left</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.creditsRemaining}</p>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Credits Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.creditsUsed}</p>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <CreditCard className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscription?.plan?.name || 'Free'}
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/generate">
              <Button variant="primary" className="w-full">
                Generate New Image
              </Button>
            </Link>
            <Link to="/my-gallery">
              <Button variant="secondary" className="w-full">
                View My Gallery
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Images */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Creations
            </h2>
            <Link to="/my-gallery" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All →
            </Link>
          </div>

          {recentImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentImages.map((image) => (
                <ImageCard key={image._id} image={image} onDelete={loadDashboardData} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Image className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No images yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start creating your first AI-generated image
              </p>
              <Link to="/generate">
                <Button variant="primary">Generate Image</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard