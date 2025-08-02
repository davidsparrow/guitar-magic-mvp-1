import { useState } from 'react'

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">Sign up/Sign in coming soon!</p>
        <button 
          onClick={onClose}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default AuthModal
