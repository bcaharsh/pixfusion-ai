import { useState, useEffect } from 'react'
import { imageService } from '../../services/imageService'
import ImageGrid from '../../components/image/ImageGrid'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Search, Filter } from 'lucide-react'
import Input from '../../components/common/Input'

const PublicGallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const limit = 20

  useEffect(() => {
    loadImages()
  }, [currentPage, sortBy])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await imageService.getPublicGallery(currentPage, limit, sortBy)
      setImages(data.images || [])
      setTotalPages(Math.ceil((data.total || 0) / limit))
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Public Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Explore amazing AI-generated images from our community
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search images..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="xl" />
          </div>
        ) : (
          <>
            <ImageGrid images={images} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PublicGallery