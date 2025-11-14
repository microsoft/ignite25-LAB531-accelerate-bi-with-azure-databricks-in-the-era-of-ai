import { User, AuthContext } from '../types/api';
import { configService } from './config';

/**
 * Authentication service for Databricks Apps integration
 * Handles authentication headers and user context
 */
class AuthService {
  private _authContext: AuthContext | null = null;

  /**
   * Initialize authentication context
   */
  private async initializeAuth(): Promise<AuthContext> {
    if (configService.isDatabricksEnv) {
      // In Databricks Apps, authentication headers are automatically provided
      return this.getDatabricksAuth();
    } else {
      // Local development - use mock authentication
      return this.getMockAuth();
    }
  }

  /**
   * Get Databricks Apps authentication from headers
   */
  private getDatabricksAuth(): AuthContext {
    try {
      // In Databricks Apps, these headers are automatically available
      const token = this.getHeaderValue('x-forwarded-access-token');
      const userId = this.getHeaderValue('x-forwarded-user-id');
      const userEmail = this.getHeaderValue('x-forwarded-user-email');

      if (!token || !userId || !userEmail) {
        configService.debug('Databricks auth headers not found, falling back to mock auth');
        return this.getMockAuth();
      }

      const user: User = {
        id: userId,
        email: userEmail,
        name: this.extractNameFromEmail(userEmail),
        avatar_url: this.generateAvatarUrl(userEmail),
      };

      configService.info('Databricks authentication initialized:', { userId, userEmail });

      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        token,
      };
    } catch (error) {
      configService.error('Failed to initialize Databricks auth:', error);
      return this.getMockAuth();
    }
  }

  /**
   * Get mock authentication for local development
   */
  private getMockAuth(): AuthContext {
    const mockUser: User = {
      id: 'admin-user-123',
      email: 'admin@wanderbricks.com',
      name: 'Admin User',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    };

    configService.info('Mock authentication initialized:', mockUser);

    return {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token-123',
    };
  }

  /**
   * Get header value (simulated for local development)
   */
  private getHeaderValue(_headerName: string): string | null {
    if (configService.isDatabricksEnv) {
      // In actual Databricks Apps, these would be available via server-side rendering
      // For now, we'll simulate them
      return null;
    }
    return null;
  }

  /**
   * Extract display name from email
   */
  private extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    return localPart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate avatar URL from email (using Gravatar-style service)
   */
  private generateAvatarUrl(email: string): string {
    const hash = this.simpleHash(email.toLowerCase().trim());
    return `https://images.unsplash.com/photo-${1500000000 + Math.abs(hash) % 100000000}?w=150&h=150&fit=crop&crop=face`;
  }

  /**
   * Simple hash function for demo purposes
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Get current authentication context
   */
  async getAuthContext(): Promise<AuthContext> {
    if (!this._authContext) {
      this._authContext = await this.initializeAuth();
    }
    return this._authContext;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const authContext = await this.getAuthContext();
    return authContext.user;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const authContext = await this.getAuthContext();
    return authContext.isAuthenticated;
  }

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    const authContext = await this.getAuthContext();
    return authContext.token;
  }

  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    
    if (!token) {
      return {};
    }

    const headers: Record<string, string> = {};

    if (configService.isDatabricksEnv) {
      // In Databricks Apps, use the forwarded headers
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Local development
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-User-ID'] = 'admin-user-123';
    }

    return headers;
  }

  /**
   * Logout (mainly for local development)
   */
  async logout(): Promise<void> {
    this._authContext = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    };
    
    configService.info('User logged out');
  }

  /**
   * Refresh authentication (for token renewal)
   */
  async refresh(): Promise<AuthContext> {
    this._authContext = null;
    return this.getAuthContext();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
