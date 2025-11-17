import { useState, useEffect } from 'react'
import Card from '../common/Card'

const RevenueChart = ({ data }) => {
  // Simple bar chart visualization
  const maxValue = Math.max(...(data?.map(d => d.value) || [100]))

  return (
    <Card>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Revenue Overview
      </h3>
      
      <div className="space-y-4">
        {data?.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                ${item.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RevenueChart