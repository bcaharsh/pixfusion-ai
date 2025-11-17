import { Clock } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

const ActivityLog = ({ activities }) => {
  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registered':
        return 'success'
      case 'image_generated':
        return 'primary'
      case 'subscription_created':
        return 'warning'
      case 'payment_received':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {activities?.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div className="mt-1">
              <Clock size={16} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
            <Badge variant={getActivityColor(activity.type)}>
              {activity.type.replace('_', ' ')}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default ActivityLog