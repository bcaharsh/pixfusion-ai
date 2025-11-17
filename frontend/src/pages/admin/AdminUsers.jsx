import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Pagination from '../../components/common/Pagination'
import UserTable from '../../components/admin/UserTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { Search, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebounce } from '../../hooks/useDebounce'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    loadUsers()
  }, [currentPage, debouncedSearch, statusFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers(currentPage, 20, debouncedSearch, statusFilter)
      setUsers(data.users || [])
      setTotalPages(Math.ceil((data.total || 0) / 20))
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return
    }

    try {
      await adminService.deleteUser(user._id)
      toast.success('User deleted successfully')
      loadUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleBlock = async (user) => {
    try {
      if (user.status === 'active') {
        await adminService.blockUser(user._id)
        toast.success('User blocked successfully')
      } else {
        await adminService.unblockUser(user._id)
        toast.success('User unblocked successfully')
      }
      loadUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <Button variant="primary">
          <UserPlus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length > 0 ? (
          <>
            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBlock={handleBlock}
            />
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 py-12">
            No users found
          </p>
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <div className="space-y-4">
          <Input label="Name" defaultValue={selectedUser?.name} />
          <Input label="Email" type="email" defaultValue={selectedUser?.email} />
          <Input label="Credits" type="number" defaultValue={selectedUser?.credits} />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers