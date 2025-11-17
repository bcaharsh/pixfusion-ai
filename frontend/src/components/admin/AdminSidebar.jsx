import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Image, 
  CreditCard, 
  Package, 
  DollarSign, 
  Settings, 
  FileText 
} from 'lucide-react'

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/images', icon: Image, label: 'Images' },
    { path: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/admin/plans', icon: Package, label: 'Plans' },
    { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/logs', icon: FileText, label: 'Logs' },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h2>
      </div>
      
      <nav className="px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors
              ${isActive 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar