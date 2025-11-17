import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

const LoginForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <Button type="submit" variant="primary" className="w-full" loading={loading}>
        Login
      </Button>
    </form>
  )
}

export default LoginForm