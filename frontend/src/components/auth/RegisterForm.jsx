import { useForm } from 'react-hook-form'
import { User, Mail, Lock } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

const RegisterForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        icon={User}
        {...register('name', { 
          required: 'Name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters'
          }
        })}
        error={errors.name?.message}
      />

      <Input
        label="Email"
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

      <Input
        label="Password"
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
        Create Account
      </Button>
    </form>
  )
}

export default RegisterForm