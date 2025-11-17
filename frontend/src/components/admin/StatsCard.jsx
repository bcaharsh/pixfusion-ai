import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../common/Card'

const StatsCard = ({ title, value, change, icon: Icon, trend = 'up' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{change}%</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Icon className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default StatsCard