import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { imageService } from '../../services/imageService'
import Card from '../../components/common/Card'
import GenerateForm from '../../components/image/GenerateForm'
import ImagePreview from '../../components/image/ImagePreview'
import toast from 'react-hot-toast'

const Generate = () => {
  const [generatedImage, setGeneratedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGenerate = async (data) => {
    setLoading(true)
    try {
      const result = await imageService.generateImage(data.prompt, data.size, data.quality)
      setGeneratedImage(result)
      toast.success('Image generated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate image')
      console.error('Generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      await imageService.downloadImage(generatedImage._id)
      
      // Create download link
      const link = document.createElement('a')
      link.href = generatedImage.imageUrl
      link.download = `ai-image-${generatedImage._id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Generate AI Image
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Describe what you want to create and let AI do the magic
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <div>
            <GenerateForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {/* Preview Area */}
          <div>
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Preview
              </h2>
              <ImagePreview 
                image={generatedImage} 
                loading={loading}
                onDownload={handleDownload}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Generate