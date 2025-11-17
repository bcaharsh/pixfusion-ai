import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AdminLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [levelFilter, setLevelFilter] = useState('')

  useEffect(() => {
    loadLogs()
  }, [currentPage, levelFilter])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await adminService.getLogs(levelFilter, currentPage)
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Logs
        </h1>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white">{log.message}</p>
                    {log.details && (
                      <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminLogs