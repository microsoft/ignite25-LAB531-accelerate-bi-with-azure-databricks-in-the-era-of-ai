// Core data types for the travel booking platform

export interface AvailabilityDate {
  date: string;
  available: boolean;
  price?: number;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  property_type: 'apartment' | 'house' | 'villa' | 'condo';
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night: number;
  rating: number;
  review_count: number;
  images: string[];
  amenities: string[];
  description: string;
  host_id: string;
  is_superhost: boolean;
  availability_calendar: AvailabilityDate[];
}

export interface SearchCriteria {
  destination: string;
  check_in: string;
  check_out: string;
  guests: number;
  page: number;
  limit: number;
}

export interface BookingRequest {
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  // Demo mode: payment details excluded
}

export interface Booking {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
}

export interface Host {
  id: string;
  name: string;
  avatar_url: string;
  is_superhost: boolean;
  joined_date: string;
  response_rate: number;
  response_time: string;
  verified: boolean;
}

export interface Review {
  id: string;
  guest_name: string;
  guest_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
  property_id: string;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface SearchResponse extends ApiResponse<Property[]> {
  filters?: {
    price_range: [number, number];
    property_types: string[];
    amenities: string[];
  };
}

// Application state types
export type ViewType = 'search' | 'results' | 'detail' | 'booking' | 'confirmation';

export interface AppState {
  currentView: ViewType;
  searchData: SearchCriteria;
  selectedPropertyId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SearchData {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Predefined destinations for demo
export const DEMO_DESTINATIONS = [
  'Tokyo, Japan', 
  'New York, United States',
  'London, United Kingdom',
  'Dubai, United Arab Emirates',
  'Singapore, Singapore',
  'Rome, Italy'
] as const;

export type DemoDestination = typeof DEMO_DESTINATIONS[number];

// User authentication types (for Databricks Apps integration)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Environment configuration types
export interface Config {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isDataricksEnv: boolean;
  enableMockData: boolean;
  debugMode: boolean;
}
