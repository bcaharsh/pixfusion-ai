import { Check, X } from 'lucide-react'
import Card from '../common/Card'

const PlanComparison = () => {
  const features = [
    {
      category: 'Image Generation',
      items: [
        { name: 'Monthly Credits', free: '10', pro: '100', business: 'Unlimited' },
        { name: 'Image Quality', free: 'Standard', pro: 'HD', business: 'HD + 4K' },
        { name: 'Image Size Options', free: '1', pro: '3', business: 'All' },
        { name: 'Batch Generation', free: false, pro: true, business: true },
        { name: 'Priority Generation', free: false, pro: false, business: true },
      ]
    },
    {
      category: 'Storage & Gallery',
      items: [
        { name: 'Image Storage', free: '10 images', pro: 'Unlimited', business: 'Unlimited' },
        { name: 'Private Gallery', free: true, pro: true, business: true },
        { name: 'Public Sharing', free: true, pro: true, business: true },
        { name: 'Collections', free: false, pro: '5', business: 'Unlimited' },
        { name: 'Download History', free: false, pro: true, business: true },
      ]
    },
    {
      category: 'Commercial Use',
      items: [
        { name: 'Personal Use', free: true, pro: true, business: true },
        { name: 'Commercial License', free: false, pro: false, business: true },
        { name: 'Resell Rights', free: false, pro: false, business: true },
        { name: 'White Label', free: false, pro: false, business: true },
      ]
    },
    {
      category: 'Support',
      items: [
        { name: 'Email Support', free: true, pro: true, business: true },
        { name: 'Priority Support', free: false, pro: true, business: true },
        { name: 'Phone Support', free: false, pro: false, business: true },
        { name: 'Dedicated Account Manager', free: false, pro: false, business: true },
      ]
    }
  ]

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="text-green-600 dark:text-green-400" size={20} />
      ) : (
        <X className="text-gray-400" size={20} />
      )
    }
    return <span className="text-gray-900 dark:text-white font-medium">{value}</span>
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Detailed Plan Comparison
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                Features
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                Free
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                <div className="inline-flex items-center justify-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm">
                  Popular
                </div>
                <div className="mt-2">Pro</div>
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                Business
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td colSpan="4" className="py-3 px-6 font-semibold text-gray-900 dark:text-white">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderValue(item.free)}
                    </td>
                    <td className="py-4 px-6 text-center bg-primary-50/30 dark:bg-primary-900/10">
                      {renderValue(item.pro)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {renderValue(item.business)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Need a custom plan?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Contact our sales team for enterprise solutions with custom pricing, dedicated support, and tailored features.
        </p>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Contact Sales
        </button>
      </div>
    </Card>
  )
}

export default PlanComparison