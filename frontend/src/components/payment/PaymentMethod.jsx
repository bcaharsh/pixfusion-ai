import { useState, useEffect } from 'react'
import { paymentService } from '../../services/paymentService'
import Card from '../common/Card'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { CreditCard, Trash2, Plus, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const PaymentMethod = () => {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  })

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentService.getPaymentMethods()
      setPaymentMethods(data || [])
    } catch (error) {
      console.error('Failed to load payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async () => {
    try {
      // In production, use Stripe tokenization
      const cardToken = 'tok_' + Math.random().toString(36).substr(2, 9)
      await paymentService.addPaymentMethod(cardToken)
      toast.success('Card added successfully')
      setShowAddModal(false)
      setNewCard({ cardNumber: '', cardName: '', expiry: '', cvv: '' })
      loadPaymentMethods()
    } catch (error) {
      toast.error('Failed to add card')
    }
  }

  const handleRemoveCard = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this card?')) {
      return
    }

    try {
      await paymentService.removePaymentMethod(methodId)
      toast.success('Card removed successfully')
      loadPaymentMethods()
    } catch (error) {
      toast.error('Failed to remove card')
    }
  }

  const maskCardNumber = (number) => {
    return '**** **** **** ' + number.slice(-4)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Payment Methods
        </h3>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-2" />
          Add Card
        </Button>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method._id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {maskCardNumber(method.cardNumber)}
                    </p>
                    {method.isDefault && (
                      <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <CheckCircle size={14} className="mr-1" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires {method.expiry}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveCard(method._id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No payment methods added yet
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Your First Card
          </Button>
        </div>
      )}

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Payment Method"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              value={newCard.cardNumber}
              onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={newCard.cardName}
              onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength="5"
                value={newCard.expiry}
                onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                maxLength="4"
                value={newCard.cvv}
                onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCard}>
              Add Card
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

export default PaymentMethod