import { useState } from 'react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { Edit, Trash2, Ban, CheckCircle } from 'lucide-react'

const UserTable = ({ users, onEdit, onDelete, onBlock }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              User
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Email
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Plan
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Credits
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Joined
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user.name}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {user.email}
              </td>
              <td className="py-4 px-4">
                <Badge variant="primary">{user.plan || 'Free'}</Badge>
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {user.credits}
              </td>
              <td className="py-4 px-4">
                <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                  {user.status}
                </Badge>
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onBlock(user)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                  >
                    {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable