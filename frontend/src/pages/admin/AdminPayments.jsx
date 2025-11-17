import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'

const AdminPayments = () => {
  // Mock data - replace with actual API call
  const payments = [
    { id: 1, user: 'John Doe', amount: 29.99, status: 'completed', date: '2024-01-15' },
    { id: 2, user: 'Jane Smith', amount: 99.99, status: 'completed', date: '2024-01-16' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Payment Management
      </h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4">Date</th>
                <th className="text-left py-4 px-4">User</th>
                <th className="text-left py-4 px-4">Amount</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-4">{payment.date}</td>
                  <td className="py-4 px-4">{payment.user}</td>
                  <td className="py-4 px-4 font-semibold">${payment.amount}</td>
                  <td className="py-4 px-4">
                    <Badge variant="success">{payment.status}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-primary-600 hover:text-primary-700">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminPayments