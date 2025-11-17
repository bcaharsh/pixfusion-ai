import { useForm } from 'react-hook-form'
import { CreditCard, Calendar, Lock } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

const CheckoutForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Card Number"
        type="text"
        icon={CreditCard}
        placeholder="1234 5678 9012 3456"
        {...register('cardNumber', {
          required: 'Card number is required',
          pattern: {
            value: /^[0-9]{16}$/,
            message: 'Invalid card number'
          }
        })}
        error={errors.cardNumber?.message}
      />

      <Input
        label="Cardholder Name"
        type="text"
        placeholder="John Doe"
        {...register('cardName', {
          required: 'Cardholder name is required'
        })}
        error={errors.cardName?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry Date"
          type="text"
          icon={Calendar}
          placeholder="MM/YY"
          {...register('expiry', {
            required: 'Expiry date is required',
            pattern: {
              value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
              message: 'Invalid expiry date'
            }
          })}
          error={errors.expiry?.message}
        />

        <Input
          label="CVV"
          type="text"
          icon={Lock}
          placeholder="123"
          {...register('cvv', {
            required: 'CVV is required',
            pattern: {
              value: /^[0-9]{3,4}$/,
              message: 'Invalid CVV'
            }
          })}
          error={errors.cvv?.message}
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Lock size={16} />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" loading={loading}>
        Complete Payment
      </Button>
    </form>
  )
}

export default CheckoutForm