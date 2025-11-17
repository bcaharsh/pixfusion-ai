import { useState, useEffect } from 'react'
import { imageService } from '../../services/imageService'
import ImageGrid from '../../components/image/ImageGrid'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Image as ImageIcon } from 'lucide-react'

const MyGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 12

  useEffect(() => {
    loadImages()
  }, [currentPage])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await imageService.getMyImages(currentPage, limit)
      setImages(data.images || [])
      setTotalPages(Math.ceil((data.total || 0) / limit))
    } catch (error) {
      console.error('Failed to load images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageId) => {
    try {
      await imageService.deleteImage(imageId)
      loadImages()
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            All your AI-generated creations in one place
          </p>
        </div>

        {images.length > 0 ? (
          <>
            <ImageGrid images={images} onDelete={handleDelete} showActions />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              No images yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start creating your first AI-generated image
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGallery