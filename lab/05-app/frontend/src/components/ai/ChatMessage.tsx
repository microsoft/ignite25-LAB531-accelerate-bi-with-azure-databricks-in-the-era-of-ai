import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/ai';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          S
        </div>
      )}

      <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
        <div className={`
          rounded-lg px-4 py-3 text-sm
          ${message.role === 'user'
            ? 'bg-red-500 text-white ml-auto'
            : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-800'
          }
        `}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
          U
        </div>
      )}
    </div>
  );
};