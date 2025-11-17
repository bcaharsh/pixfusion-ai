import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import Card from '../common/Card'
import { Sparkles } from 'lucide-react'

const GenerateForm = ({ onGenerate, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      prompt: '',
      size: '1024x1024',
      quality: 'standard'
    }
  })

  const promptLength = watch('prompt')?.length || 0

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Image Configuration
      </h2>

      <form onSubmit={handleSubmit(onGenerate)} className="space-y-6">
        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe your image
          </label>
          <textarea
            {...register('prompt', {
              required: 'Please describe what you want to generate',
              minLength: {
                value: 10,
                message: 'Prompt must be at least 10 characters'
              }
            })}
            rows={4}
            className="input-field resize-none"
            placeholder="A serene landscape with mountains and a lake at sunset..."
          />
          <div className="flex justify-between mt-2">
            {errors.prompt && (
              <p className="text-sm text-red-600">{errors.prompt.message}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">{promptLength} characters</p>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Size
          </label>
          <select {...register('size')} className="input-field">
            <option value="1024x1024">Square (1024x1024)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
          </select>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quality
          </label>
          <select {...register('quality')} className="input-field">
            <option value="standard">Standard</option>
            <option value="hd">HD (uses more credits)</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
        >
          <Sparkles size={20} className="mr-2" />
          Generate Image
        </Button>
      </form>
    </Card>
  )
}

export default GenerateForm