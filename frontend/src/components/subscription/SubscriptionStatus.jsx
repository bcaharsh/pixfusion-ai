import { useState, useEffect } from 'react'
import { subscriptionService } from '../../services/subscriptionService'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { Calendar, CreditCard, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const data = await subscriptionService.getCurrentSubscription()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    try {
      await subscriptionService.cancelSubscription()
      toast.success('Subscription cancelled successfully')
      loadSubscription()
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  if (loading) return null

  if (!subscription) {
    return (
      <Card>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Subscribe to a plan to get more credits
          </p>
          <Button variant="primary">View Plans</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Current Subscription
        </h3>
        <Badge variant={subscription.status === 'active' ? 'success' : 'warning'}>
          {subscription.status}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {subscription.plan?.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${subscription.plan?.price}/month
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Credits</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.plan?.credits}/month
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span className="text-sm">
            Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" className="flex-1">
            Upgrade Plan
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleCancel}>
            Cancel Subscription
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default SubscriptionStatus