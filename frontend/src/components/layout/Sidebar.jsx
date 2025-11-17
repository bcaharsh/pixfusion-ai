import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Sparkles, 
  Image, 
  User, 
  CreditCard,
  Settings,
  X
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/generate', icon: Sparkles, label: 'Generate' },
    { path: '/my-gallery', icon: Image, label: 'My Gallery' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/pricing', icon: CreditCard, label: 'Subscription' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 flex flex-col
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
            <p className="text-xs opacity-90 mb-3">Get unlimited access to all features</p>
            <button className="w-full bg-white text-primary-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar