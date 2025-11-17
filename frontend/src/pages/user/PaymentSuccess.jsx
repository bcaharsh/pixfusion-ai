import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto text-green-600 mb-6" size={64} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your subscription has been activated successfully. You can now start generating amazing AI images.
        </p>
        <div className="space-y-4">
          <Link to="/dashboard">
            <Button variant="primary" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/generate">
            <Button variant="secondary" className="w-full">
              Generate Image
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default PaymentSuccess