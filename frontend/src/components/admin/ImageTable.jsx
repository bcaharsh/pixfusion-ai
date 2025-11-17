import Badge from '../common/Badge'
import { Eye, Trash2, Flag } from 'lucide-react'

const ImageTable = ({ images, onView, onDelete, onFlag }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Preview
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Prompt
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              User
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Size
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Likes
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Created
            </th>
            <th className="text-left py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr key={image._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-4 px-4">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </td>
              <td className="py-4 px-4 max-w-xs truncate text-gray-900 dark:text-white">
                {image.prompt}
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {image.user?.name || 'Unknown'}
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {image.size}
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {image.likes || 0}
              </td>
              <td className="py-4 px-4 text-gray-900 dark:text-white">
                {new Date(image.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onView(image)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onFlag(image)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                  >
                    <Flag size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(image)}
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

export default ImageTable