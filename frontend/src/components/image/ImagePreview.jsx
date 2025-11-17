import { Download } from 'lucide-react'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'

const ImagePreview = ({ image, loading, onDownload }) => {
  if (loading) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Generating your image...
          </p>
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Your generated image will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={image.imageUrl}
          alt={image.prompt}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Prompt:</strong> {image.prompt}
        </p>
        <Button variant="primary" className="w-full" onClick={onDownload}>
          <Download size={20} className="mr-2" />
          Download Image
        </Button>
      </div>
    </div>
  )
}

export default ImagePreview