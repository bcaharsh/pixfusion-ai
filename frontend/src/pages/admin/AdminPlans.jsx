import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

const AdminPlans = () => {
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const data = await adminService.getAllSubscriptions()
      setPlans(data || [])
    } catch (error) {
      toast.error('Failed to load plans')
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan._id, data)
        toast.success('Plan updated successfully')
      } else {
        await adminService.createPlan(data)
        toast.success('Plan created successfully')
      }
      setShowModal(false)
      reset()
      loadPlans()
    } catch (error) {
      toast.error('Failed to save plan')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    reset(plan)
    setShowModal(true)
  }

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return
    }

    try {
      await adminService.deletePlan(planId)
      toast.success('Plan deleted successfully')
      loadPlans()
    } catch (error) {
      toast.error('Failed to delete plan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Plan Management
        </h1>
        <Button variant="primary" onClick={() => {
          setEditingPlan(null)
          reset({})
          setShowModal(true)
        }}>
          <Plus size={20} className="mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id}>
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                ${plan.price}
                <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
              </p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="text-gray-700 dark:text-gray-300">
                {plan.credits} Credits/month
              </li>
              {plan.features?.map((feature, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex space-x-2">
              <Button variant="secondary" className="flex-1" onClick={() => handleEdit(plan)}>
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(plan._id)}>
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? 'Edit Plan' : 'Create Plan'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Plan Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            {...register('price', { required: 'Price is required' })}
            error={errors.price?.message}
          />
          <Input
            label="Credits"
            type="number"
            {...register('credits', { required: 'Credits are required' })}
            error={errors.credits?.message}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingPlan ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminPlans