import { 
  Property, 
  SearchCriteria, 
  BookingRequest, 
  Booking, 
  ApiResponse, 
  SearchResponse,
  Host,
  Review
} from '../types/api';
import { configService } from './config';
import { authService } from './auth';
import { mockDataService } from './mockData';

/**
 * API service for centralized API communication
 * Handles both real API calls and mock data fallback
 */
class ApiService {
  /**
   * Get request headers with authentication
   */
  private async getHeaders(): Promise<Record<string, string>> {
    const authHeaders = await authService.getAuthHeaders();
    
    return {
      'Content-Type': 'application/json',
      ...authHeaders,
    };
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = configService.getApiUrl(endpoint);
    const headers = await this.getHeaders();

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      configService.debug('API Request:', { url, method: options.method || 'GET' });

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      configService.debug('API Response:', data);
      
      return data;
    } catch (error) {
      configService.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Search properties with criteria
   */
  async searchProperties(criteria: SearchCriteria): Promise<Property[]> {
    console.log('🔍 API Service - searchProperties called with:', criteria);
    console.log('🔍 API Service - useMockData:', configService.useMockData);
    console.log('🔍 API Service - apiBaseUrl:', configService.apiBaseUrl);
    
    if (configService.useMockData) {
      // Use mock data for local development
      configService.info('Using mock data for property search');
      
      const properties = mockDataService.searchProperties({
        destination: criteria.destination,
        guests: criteria.guests,
      });

      // Simulate API delay
      await this.simulateDelay();
      
      // Apply pagination
      const start = (criteria.page - 1) * criteria.limit;
      const end = start + criteria.limit;
      
      return properties.slice(start, end);
    }

    try {
      console.log('🔍 API Service - Making real API request to backend');
      const response = await this.request<SearchResponse>('/properties/search', {
        method: 'POST',
        body: JSON.stringify(criteria),
      });

      console.log('🔍 API Service - Response received:', response);
      return response.data;
    } catch (error) {
      configService.error('Property search failed, falling back to mock data', error);
      
      // Fallback to mock data
      const properties = mockDataService.searchProperties({
        destination: criteria.destination,
        guests: criteria.guests,
      });
      
      return properties.slice(0, criteria.limit);
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    if (configService.useMockData) {
      configService.info('Using mock data for property details');
      await this.simulateDelay();
      return mockDataService.getPropertyById(id) || null;
    }

    try {
      const response = await this.request<ApiResponse<Property>>(`/properties/${id}`);
      return response.data;
    } catch (error) {
      configService.error('Property fetch failed, falling back to mock data');
      return mockDataService.getPropertyById(id) || null;
    }
  }

  /**
   * Get host information
   */
  async getHostById(hostId: string): Promise<Host | null> {
    if (configService.useMockData) {
      await this.simulateDelay();
      return mockDataService.getHostById(hostId) || null;
    }

    try {
      const response = await this.request<ApiResponse<Host>>(`/hosts/${hostId}`);
      return response.data;
    } catch (error) {
      configService.error('Host fetch failed, falling back to mock data');
      return mockDataService.getHostById(hostId) || null;
    }
  }

  /**
   * Get reviews for a property
   */
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    if (configService.useMockData) {
      await this.simulateDelay();
      return mockDataService.getReviewsForProperty(propertyId);
    }

    try {
      const response = await this.request<ApiResponse<Review[]>>(`/properties/${propertyId}/reviews`);
      return response.data;
    } catch (error) {
      configService.error('Reviews fetch failed, falling back to mock data');
      return mockDataService.getReviewsForProperty(propertyId);
    }
  }

  /**
   * Create a booking (demo-friendly)
   */
  async createBooking(bookingRequest: BookingRequest): Promise<Booking> {
    if (configService.useMockData) {
      configService.info('Creating mock booking');
      await this.simulateDelay();
      
      // Create mock booking response
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        ...bookingRequest,
        booking_status: 'confirmed',
        payment_status: 'paid', // Mock payment success
        guest_name: bookingRequest.guest_name || 'Demo User',
        guest_email: bookingRequest.guest_email || 'demo@wanderbricks.com',
        guest_phone: bookingRequest.guest_phone || '+1-555-0123',
        created_at: new Date().toISOString(),
      };

      configService.info('Mock booking created:', booking);
      return booking;
    }

    try {
      const response = await this.request<ApiResponse<Booking>>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingRequest),
      });

      return response.data;
    } catch (error) {
      configService.error('Booking creation failed, creating mock booking');
      
      // Fallback to mock booking
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        ...bookingRequest,
        booking_status: 'confirmed',
        payment_status: 'paid',
        guest_name: bookingRequest.guest_name || 'Demo User',
        guest_email: bookingRequest.guest_email || 'demo@wanderbricks.com', 
        guest_phone: bookingRequest.guest_phone || '+1-555-0123',
        created_at: new Date().toISOString(),
      };

      return booking;
    }
  }

  /**
   * Get featured properties for homepage
   */
  async getFeaturedProperties(): Promise<Property[]> {
    if (configService.useMockData) {
      await this.simulateDelay();
      return mockDataService.getFeaturedProperties(6);
    }

    try {
      const response = await this.request<ApiResponse<Property[]>>('/properties/featured');
      return response.data;
    } catch (error) {
      configService.error('Featured properties fetch failed, using mock data');
      return mockDataService.getFeaturedProperties(6);
    }
  }

  /**
   * Get available cities for search
   */
  async getCities(): Promise<{ city: string; country: string; display: string }[]> {
    console.log('🏙️ API Service - getCities called');
    console.log('🏙️ API Service - useMockData:', configService.useMockData);
    
    if (configService.useMockData) {
      console.log('🏙️ API Service - Using mock cities');
      await this.simulateDelay();
      return [
        { city: "Paris", country: "France", display: "Paris, France" },
        { city: "Tokyo", country: "Japan", display: "Tokyo, Japan" },
        { city: "New York", country: "USA", display: "New York, USA" },
        { city: "London", country: "England", display: "London, England" },
        { city: "Barcelona", country: "Spain", display: "Barcelona, Spain" },
        { city: "Amsterdam", country: "Netherlands", display: "Amsterdam, Netherlands" }
      ];
    }

    try {
      console.log('🏙️ API Service - Making real API request for cities');
      const response = await this.request<ApiResponse<{ city: string; country: string; display: string }[]>>('/cities');
      console.log('🏙️ API Service - Cities response:', response);
      return response.data;
    } catch (error) {
      console.error('🏙️ API Service - Cities fetch failed:', error);
      configService.error('Cities fetch failed, using fallback cities');
      const fallbackCities = [
        { city: "Paris", country: "France", display: "Paris, France" },
        { city: "Tokyo", country: "Japan", display: "Tokyo, Japan" },
        { city: "New York", country: "USA", display: "New York, USA" },
        { city: "London", country: "England", display: "London, England" },
        { city: "Barcelona", country: "Spain", display: "Barcelona, Spain" },
        { city: "Amsterdam", country: "Netherlands", display: "Amsterdam, Netherlands" }
      ];
      console.log('🏙️ API Service - Using fallback cities:', fallbackCities);
      return fallbackCities;
    }
  }

  /**
   * Check property availability
   */
  async checkAvailability(
    propertyId: string, 
    checkIn: string, 
    checkOut: string
  ): Promise<boolean> {
    if (configService.useMockData) {
      await this.simulateDelay();
      // Mock availability check - 90% chance of being available
      return Math.random() > 0.1;
    }

    try {
      const response = await this.request<ApiResponse<{ available: boolean }>>(
        `/properties/${propertyId}/availability`,
        {
          method: 'POST',
          body: JSON.stringify({ check_in: checkIn, check_out: checkOut }),
        }
      );

      return response.data.available;
    } catch (error) {
      configService.error('Availability check failed, assuming available');
      return true;
    }
  }

  /**
   * Get health check status
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.request<{ status: string }>('/health');
      return {
        ...response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      configService.error('Health check failed');
      return {
        status: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Simulate network delay for better UX during development
   */
  private async simulateDelay(ms: number = 500): Promise<void> {
    if (configService.isDevelopment) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
