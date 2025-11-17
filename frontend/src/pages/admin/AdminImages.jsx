import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Pagination from '../../components/common/Pagination'
import ImageTable from '../../components/admin/ImageTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminImages = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    loadImages()
  }, [currentPage])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllImages(currentPage, 20)
      setImages(data.images || [])
      setTotalPages(Math.ceil((data.total || 0) / 20))
    } catch (error) {
      console.error('Failed to load images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (image) => {
    setSelectedImage(image)
    setShowViewModal(true)
  }

  const handleDelete = async (image) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }

    try {
      await adminService.deleteAnyImage(image._id)
      toast.success('Image deleted successfully')
      loadImages()
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const handleFlag = async (image) => {
    try {
      await adminService.moderateImage(image._id, 'flagged', 'Inappropriate content')
      toast.success('Image flagged successfully')
      loadImages()
    } catch (error) {
      toast.error('Failed to flag image')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Image Management
      </h1>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : images.length > 0 ? (
          <>
            <ImageTable
              images={images}
              onView={handleView}
              onDelete={handleDelete}
              onFlag={handleFlag}
            />
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            No images found
          </p>
        )}
      </Card>

      {/* View Image Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Image Details"
        size="lg"
      >
        {selectedImage && (
          <div>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.prompt}
              className="w-full rounded-lg mb-4"
            />
            <p className="text-gray-900 dark:text-white">
              <strong>Prompt:</strong> {selectedImage.prompt}
            </p>
            <p className="text-gray-900 dark:text-white mt-2">
              <strong>User:</strong> {selectedImage.user?.name}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminImages