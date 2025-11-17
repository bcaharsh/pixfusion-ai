import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscriptionService } from '../../services/subscriptionService'
import { paymentService } from '../../services/paymentService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import CheckoutForm from '../../components/payment/CheckoutForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Check } from 'lucide-react'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadPlanDetails()
  }, [planId])

  const loadPlanDetails = async () => {
    try {
      const plans = await subscriptionService.getPlans()
      const selectedPlan = plans.find(p => p._id === planId)
      setPlan(selectedPlan)
    } catch (error) {
      console.error('Failed to load plan:', error)
      toast.error('Failed to load plan details')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (paymentMethod) => {
    setProcessing(true)
    try {
      await subscriptionService.subscribe(planId, paymentMethod)
      toast.success('Subscription successful!')
      navigate('/payment/success')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed')
      navigate('/payment/failure')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Plan not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Purchase
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                ${plan.price}
                <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="text-green-600" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary-600">${plan.price}</span>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Information
            </h2>
            <CheckoutForm onSubmit={handlePayment} loading={processing} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Checkout