import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.resetPassword(token, data.password)
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              icon={Lock}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === watch('password') || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword