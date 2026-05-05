import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-card-white w-full max-w-md rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-border-light">
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-6 ${type === 'danger' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary leading-relaxed">{message}</p>
          </div>
          
          <div className="flex gap-4 mt-8">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-3 border border-border-light rounded-xl font-semibold text-text-secondary hover:bg-light-bg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-95 ${
                type === 'danger' ? 'bg-error hover:bg-error/90 shadow-error/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
