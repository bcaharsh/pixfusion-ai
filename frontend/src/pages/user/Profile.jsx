import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from 'react-hook-form'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { User, Mail, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await updateProfile(data)
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Account Stats */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.totalImages || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Credits Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.credits || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Profile