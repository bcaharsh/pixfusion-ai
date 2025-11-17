import { useTheme } from './hooks/useTheme'
import AppRoutes from './routes'

function App() {
  const { theme } = useTheme()

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AppRoutes />
      </div>
    </div>
  )
}

export default App