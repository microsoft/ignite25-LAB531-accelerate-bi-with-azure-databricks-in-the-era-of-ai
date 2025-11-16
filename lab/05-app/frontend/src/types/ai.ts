/**
 * AI Assistant Type Definitions
 */

export interface AIAssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  waitingForClarification: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

export interface SearchResults {
  properties: Property[];
  metadata: {
    destination?: string;
    guests?: number;
    dates?: string;
    property_count: number;
  };
}

export interface Property {
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
}