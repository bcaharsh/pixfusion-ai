import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'

const AdminSubscriptions = () => {
  // Mock data - replace with actual API call
  const subscriptions = [
    { id: 1, user: 'John Doe', plan: 'Pro', status: 'active', renewalDate: '2024-02-15' },
    { id: 2, user: 'Jane Smith', plan: 'Business', status: 'active', renewalDate: '2024-02-20' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Subscription Management
      </h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4">User</th>
                <th className="text-left py-4 px-4">Plan</th>
                <th className="text-left py-4 px-4">Status</th>
                <th className="text-left py-4 px-4">Renewal Date</th>
                <th className="text-left py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-4">{sub.user}</td>
                  <td className="py-4 px-4">{sub.plan}</td>
                  <td className="py-4 px-4">
                    <Badge variant="success">{sub.status}</Badge>
                  </td>
                  <td className="py-4 px-4">{sub.renewalDate}</td>
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

export default AdminSubscriptions