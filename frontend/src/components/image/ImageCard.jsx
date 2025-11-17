import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, Heart, Eye } from 'lucide-react'
import { imageService } from '../../services/imageService'
import ImageModal from './ImageModal'
import toast from 'react-hot-toast'

const ImageCard = ({ image, onDelete, showActions = true }) => {
  const [showModal, setShowModal] = useState(false)
  const [liked, setLiked] = useState(image?.isLiked || false)
  const [likes, setLikes] = useState(image?.likes || 0)

  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      await imageService.downloadImage(image._id)
      const link = document.createElement('a')
      link.href = image.imageUrl
      link.download = `ai-image-${image._id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    try {
      await imageService.likeImage(image._id)
      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
    } catch (error) {
      toast.error('Failed to like image')
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imageService.deleteImage(image._id)
        toast.success('Image deleted successfully')
        onDelete?.(image._id)
      } catch (error) {
        toast.error('Failed to delete image')
      }
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="relative group cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <Download size={20} className="text-gray-900" />
            </button>
            <button
              onClick={handleLike}
              className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <Heart 
                size={20} 
                className={liked ? 'text-red-600 fill-red-600' : 'text-gray-900'} 
              />
            </button>
            {showActions && (
              <button
                onClick={handleDelete}
                className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Trash2 size={20} className="text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl">
          <p className="text-sm truncate">{image.prompt}</p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="flex items-center">
              <Heart size={14} className="mr-1" /> {likes}
            </span>
            <span>{new Date(image.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      <ImageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        image={image}
      />
    </>
  )
}

export default ImageCard