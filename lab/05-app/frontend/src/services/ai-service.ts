/**
 * AI Assistant API Service
 * Handles communication with the backend AI Assistant endpoint
 */
import { configService } from './config';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

export interface AIAssistantRequest {
  message: string;
  conversation_id?: string;
}

export interface AIAssistantResponse {
  success: boolean;
  conversation_id?: string;
  needs_clarification?: boolean;
  message: string;
  properties?: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    price_per_night: number;
    property_type: string;
    max_guests: number;
    bedrooms: number;
    bathrooms: number;
    rating: number;
    review_count: number;
    images: string[];
    amenities: string[];
  }>;
  search_metadata?: {
    destination?: string;
    guests?: number;
    dates?: string;
    property_count: number;
  };
  error?: string;
}

class AIService {
  constructor() {
    // Use the same configuration service as the main API
    configService.info('AI Service initialized with base URL:', configService.apiBaseUrl);
  }

  /**
   * Get the correct API URL for AI Assistant endpoints
   */
  private getApiUrl(endpoint: string): string {
    return configService.getApiUrl(endpoint);
  }

  async sendMessage(message: string, conversationId?: string): Promise<AIAssistantResponse> {
    try {
      const requestBody: AIAssistantRequest = {
        message: message.trim(),
      };

      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      const apiUrl = this.getApiUrl('ai-assistant/search');
      configService.debug('AI Service - API URL:', apiUrl);
      configService.debug('AI Service - Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AIAssistantResponse = await response.json();

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('AI Assistant API Error:', error);
      
      // Enhanced error logging for debugging deployment issues
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          apiUrl: this.getApiUrl('ai-assistant/search'),
          environment: {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            isDatabricks: configService.isDatabricksEnv
          }
        });
      }

      // Return error response in expected format
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Failed to communicate with AI Assistant'
      };
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a chat message object
   */
  createMessage(content: string, role: 'user' | 'assistant', isError = false): ChatMessage {
    return {
      id: this.generateMessageId(),
      content,
      role,
      timestamp: new Date(),
      isError
    };
  }
}

// Export singleton instance
export const aiService = new AIService();