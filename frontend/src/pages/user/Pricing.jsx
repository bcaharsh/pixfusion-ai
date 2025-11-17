import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { subscriptionService } from '../../services/subscriptionService'
import PricingCard from '../../components/subscription/PricingCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Check } from 'lucide-react'

const Pricing = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getPlans()
      setPlans(data || [])
    } catch (error) {
      console.error('Failed to load plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId) => {
    if (!isAuthenticated) {
      navigate('/register')
      return
    }
    navigate(`/checkout/${planId}`)
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Select the perfect plan for your creative needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <PricingCard
              key={plan._id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={() => handleSelectPlan(plan._id)}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Compare Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6">Features</th>
                  {plans.map((plan) => (
                    <th key={plan._id} className="text-center py-4 px-6">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6">AI Image Generation</td>
                  {plans.map((plan) => (
                    <td key={plan._id} className="text-center py-4 px-6">
                      <Check className="inline text-green-600" size={20} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6">HD Quality</td>
                  {plans.map((plan, index) => (
                    <td key={plan._id} className="text-center py-4 px-6">
                      {index > 0 ? (
                        <Check className="inline text-green-600" size={20} />
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-4 px-6">Commercial Use</td>
                  {plans.map((plan, index) => (
                    <td key={plan._id} className="text-center py-4 px-6">
                      {index === 2 ? (
                        <Check className="inline text-green-600" size={20} />
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6">Priority Support</td>
                  {plans.map((plan, index) => (
                    <td key={plan._id} className="text-center py-4 px-6">
                      {index === 2 ? (
                        <Check className="inline text-green-600" size={20} />
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing