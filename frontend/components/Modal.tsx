
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`bg-white rounded-lg shadow-xl p-6 m-4 w-full ${sizeClasses[size]} relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear`}>
        <style>{`
          @keyframes modal-appear {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-modal-appear {
            animation: modal-appear 0.3s forwards;
          }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
