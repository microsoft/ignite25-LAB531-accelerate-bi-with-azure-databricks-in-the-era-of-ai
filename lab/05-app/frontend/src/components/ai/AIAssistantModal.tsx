import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { aiService } from '../../services/ai-service';
import { ChatMessage as ChatMessageType, SearchResults } from '../../types/ai';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResults?: (results: SearchResults) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSearchResults
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample conversation starters
  const sampleQuestions = [
    "What properties are available in Paris for 2 guests from Oct 20 to Oct 22?",
    "Can you show me listings in Singapore for 4 people from Oct 1 to Oct 3?",
    "Are there any accommodations in Tokyo for 3 guests from Oct 15 to Oct 17?",
    "Which properties in San Francisco can host 5 guests for the dates from Oct 3 to Oct 4?"
  ];

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = aiService.createMessage(
        "👋 Hi! I'm your Wanderbricks booking assistant. I can help you find the perfect accommodation. Just tell me what you're looking for in natural language!",
        'assistant'
      );
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = aiService.createMessage(messageContent, 'user');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send message to AI Assistant
      const response = await aiService.sendMessage(messageContent, conversationId || undefined);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get response from AI Assistant');
      }

      // Update conversation ID if this is the first message
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response to chat
      const assistantMessage = aiService.createMessage(response.message, 'assistant');
      setMessages(prev => [...prev, assistantMessage]);

      // Handle property search results
      if (response.properties && response.properties.length > 0) {
        // Close modal and navigate to results
        setTimeout(() => {
          if (onSearchResults) {
            onSearchResults({
              properties: response.properties!,
              metadata: response.search_metadata || { property_count: response.properties!.length }
            });
          }
          onClose();
        }, 1000); // Give user time to read the message
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = aiService.createMessage(
        `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        'assistant',
        true
      );
      setMessages(prev => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    // Re-initialize with welcome message
    const welcomeMessage = aiService.createMessage(
      "👋 Hi! I'm your Wanderbricks booking assistant. I can help you find the perfect accommodation. Just tell me what you're looking for in natural language!",
      'assistant'
    );
    setMessages([welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
              🏠
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900">AI Booking Assistant</h2>
              <p className="text-sm text-gray-600">
                Tell me what you're looking for in natural language, and I'll help you find the perfect stay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset chat button */}
            <button
              onClick={resetChat}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Start new conversation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12a8 8 0 018-8V2.5L14.5 5 12 7.5V6a6 6 0 106 6h1.5a7.5 7.5 0 11-7.5-7.5z"/>
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.36 6.64a1 1 0 00-1.41 0L12 11.59 7.05 6.64a1 1 0 10-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 101.41 1.41L12 13.41l4.95 4.95a1 1 0 101.41-1.41L13.41 12l4.95-4.95a1 1 0 000-1.41z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <TypingIndicator />}

          {/* Sample questions (show only when no conversation started) */}
          {messages.length <= 1 && !isLoading && (
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-3">Try asking:</div>
              <div className="grid gap-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuestion(question)}
                    className="text-left p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask in natural language... e.g., 'I need a hotel in Tokyo for 2 people next weekend'"
        />
      </div>
    </div>
  );
};