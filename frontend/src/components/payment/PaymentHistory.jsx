import { useState, useEffect } from 'react'
import { paymentService } from '../../services/paymentService'
import Card from '../common/Card'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'
import { Download } from 'lucide-react'

const PaymentHistory = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const data = await paymentService.getPaymentHistory()
      setPayments(data || [])
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Payment History
      </h3>

      {payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {payment.description}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                    ${payment.amount}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 hover:text-primary-700 flex items-center">
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
          No payment history found
        </p>
      )}
    </Card>
  )
}

export default PaymentHistory