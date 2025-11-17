import Modal from '../common/Modal'
import Button from '../common/Button'
import { Download, Heart, Calendar, Image as ImageIcon } from 'lucide-react'

const ImageModal = ({ isOpen, onClose, image }) => {
  if (!image) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Image Details" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.prompt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Prompt
            </h3>
            <p className="text-gray-900 dark:text-white">{image.prompt}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Size
              </h3>
              <p className="text-gray-900 dark:text-white">{image.size}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Quality
              </h3>
              <p className="text-gray-900 dark:text-white">{image.quality}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Created
            </h3>
            <p className="text-gray-900 dark:text-white flex items-center">
              <Calendar size={16} className="mr-2" />
              {new Date(image.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Engagement
            </h3>
            <p className="text-gray-900 dark:text-white flex items-center">
              <Heart size={16} className="mr-2" />
              {image.likes || 0} likes
            </p>
          </div>

          <Button variant="primary" className="w-full">
            <Download size={20} className="mr-2" />
            Download Image
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageModal