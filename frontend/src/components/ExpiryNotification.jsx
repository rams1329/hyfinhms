// frontend/src/components/ExpiryNotification.jsx
import React from 'react';

const ExpiryNotification = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center relative animate-fade-in">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Account Expired</h2>
        <p className="text-gray-700 mb-4">{message || 'Your account is expired. Please contact the administrator for assistance.'}</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExpiryNotification;
