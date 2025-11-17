import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'

const PricingCard = ({ plan, billingCycle, onSelect, featured = false }) => {
  const price = billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {featured && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star size={16} className="mr-1" /> Most Popular
          </span>
        </div>
      )}
      
      <Card className={`h-full ${featured ? 'border-2 border-primary-600 shadow-xl' : ''}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${price}
            </span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">
              /{billingCycle === 'yearly' ? 'year' : 'month'}
            </span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Save ${(plan.price * 12 * 0.2).toFixed(2)}/year
            </p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <Check className="text-green-600" size={20} />
            <span className="text-gray-700 dark:text-gray-300">
              {plan.credits} Credits/month
            </span>
          </div>
          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="text-green-600" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          variant={featured ? 'primary' : 'secondary'}
          className="w-full"
          onClick={onSelect}
        >
          {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
        </Button>
      </Card>
    </motion.div>
  )
}

export default PricingCard