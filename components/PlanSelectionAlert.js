// components/PlanSelectionAlert.js - Standardized Plan Selection Alert
import { useRouter } from 'next/router'

export default function PlanSelectionAlert({ isOpen, onClose, onNavigateAway }) {
  const router = useRouter()

  console.log('🔍 PlanSelectionAlert: Component function called, isOpen:', isOpen)

  if (!isOpen) return null

  console.log('🔍 PlanSelectionAlert: Component rendered, isOpen:', isOpen)

  const handleSelectPlan = () => {
    console.log('🔍 PlanSelectionAlert: SELECT PLAN button clicked')
    console.log('🔍 PlanSelectionAlert: router object:', router)
    console.log('🔍 PlanSelectionAlert: Current URL:', window.location.href)
    onClose()
    if (onNavigateAway) onNavigateAway()
    console.log('🔍 PlanSelectionAlert: About to navigate to /pricing')
    try {
      router.push('/pricing')
      console.log('🔍 PlanSelectionAlert: Navigation command sent successfully')
    } catch (error) {
      console.error('🔍 PlanSelectionAlert: Navigation error:', error)
    }
  }

  const handleCancel = () => {
    onClose()
    router.push('/')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-600">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-white">
            Alert. No need to panic. Yet.
          </h3>
        </div>
        
        {/* Message */}
        <div className="px-6 py-4">
          <p className="text-white text-base">
            Please select a Plan to plug-in. Get started without a credit card.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-600 flex space-x-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-600 hover:bg-gray-700 text-white"
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              console.log('🔍 PlanSelectionAlert: Button clicked - inline function')
              handleSelectPlan()
            }}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-pink-500 hover:bg-pink-600 text-white"
          >
            SELECT PLAN
          </button>
        </div>
      </div>
    </div>
  )
}
