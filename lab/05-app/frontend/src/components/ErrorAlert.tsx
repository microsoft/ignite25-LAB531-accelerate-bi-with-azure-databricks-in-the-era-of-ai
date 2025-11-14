import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'warning';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onDismiss, 
  type = 'error' 
}) => {
  const alertStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconStyles = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className={`${alertStyles[type]} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className={`h-5 w-5 ${iconStyles[type]}`} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-white/20 ${
                type === 'error' 
                  ? 'text-red-400 hover:text-red-600 focus:ring-red-500' 
                  : 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500'
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
