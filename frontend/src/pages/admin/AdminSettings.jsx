import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    apiKey: '',
    maxImageSize: 1024,
    enablePublicGallery: true,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await adminService.getSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminService.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        System Settings
      </h1>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          API Configuration
        </h2>
        <div className="space-y-4">
          <Input
            label="OpenAI API Key"
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          />
          <Input
            label="Max Image Size"
            type="number"
            value={settings.maxImageSize}
            onChange={(e) => setSettings({ ...settings, maxImageSize: e.target.value })}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          General Settings
        </h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.enablePublicGallery}
              onChange={(e) => setSettings({ ...settings, enablePublicGallery: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="text-gray-900 dark:text-white">Enable Public Gallery</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <span className="text-gray-900 dark:text-white">Maintenance Mode</span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={loading}>
          <Save size={20} className="mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

export default AdminSettings