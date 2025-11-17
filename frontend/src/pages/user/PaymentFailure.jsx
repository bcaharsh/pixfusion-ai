import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const PaymentFailure = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center">
        <XCircle className="mx-auto text-red-600 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We couldn't process your payment. Please check your payment details and try again.
        </p>
        <div className="space-y-4">
          <Link to="/pricing">
            <Button variant="primary" className="w-full">
              Try Again
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default PaymentFailure