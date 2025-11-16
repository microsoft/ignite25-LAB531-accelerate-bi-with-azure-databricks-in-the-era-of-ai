import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        S
      </div>

      <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">AI Assistant is thinking...</span>
      </div>
    </div>
  );
};