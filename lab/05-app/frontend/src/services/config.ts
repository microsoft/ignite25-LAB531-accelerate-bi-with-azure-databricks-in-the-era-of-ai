import { Config } from '../types/api';

/**
 * Configuration service for environment detection and settings
 * Handles Databricks Apps vs local development environments
 */
class ConfigService {
  private _config: Config | null = null;

  /**
   * Initialize and detect the current environment
   */
  private detectEnvironment(): Config {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    console.log('🔧 Environment detection - hostname:', hostname);
    console.log('🔧 Environment detection - protocol:', protocol);
    console.log('🔧 Environment detection - port:', port);
    console.log('🔧 Environment detection - full URL:', window.location.href);
    
    // Enhanced Databricks Apps environment detection
    const isDatabricksEnv = !!(
      hostname.includes('databricks') ||
      hostname.includes('dbc-') ||
      hostname.includes('cloud.databricks.com') ||
      hostname.includes('azuredatabricks.net') ||
      hostname.includes('gcp.databricks.com') ||
      hostname.includes('aws-databricks.com') ||
      // Additional patterns for Databricks Apps
      hostname.match(/^[a-z0-9-]+\.apps\.databricks\.com$/) ||
      hostname.match(/^[a-z0-9-]+\.[0-9]+\.[a-z0-9-]+\.databricks\.com$/) ||
      // If it's HTTPS and not localhost, assume it's deployed
      (protocol === 'https:' && hostname !== 'localhost' && hostname !== '127.0.0.1')
    );

    // Determine API base URL based on environment
    const apiBaseUrl = isDatabricksEnv
      ? '' // Use relative URLs in Databricks Apps
      : 'http://localhost:8000'; // Local development server

    const config: Config = {
      apiBaseUrl,
      isDevelopment: !isDatabricksEnv,
      isDataricksEnv: isDatabricksEnv,
      enableMockData: false, // DISABLED - Always use real API
      debugMode: !isDatabricksEnv,
    };

    console.log('🔧 Environment detected:', {
      isDatabricksEnv,
      apiBaseUrl,
      isDevelopment: config.isDevelopment,
      debugMode: config.debugMode
    });

    return config;
  }

  /**
   * Get current configuration
   */
  get config(): Config {
    if (!this._config) {
      this._config = this.detectEnvironment();
      
      if (this._config.debugMode) {
        console.log('🔧 Config Service initialized:', this._config);
      }
    }

    return this._config;
  }

  /**
   * Check if running in Databricks environment
   */
  get isDatabricksEnv(): boolean {
    return this.config.isDataricksEnv;
  }

  /**
   * Check if in development mode
   */
  get isDevelopment(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Check if mock data should be used
   */
  get useMockData(): boolean {
    return this.config.enableMockData;
  }

  /**
   * Get API base URL
   */
  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Get full API endpoint URL
   */
  getApiUrl(endpoint: string): string {
    const baseUrl = this.apiBaseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Handle API prefix
    const apiEndpoint = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
    
    return `${baseUrl}${apiEndpoint}`;
  }

  /**
   * Log debug information
   */
  debug(...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log('🐛 [Wanderbricks Debug]', ...args);
    }
  }

  /**
   * Log info messages
   */
  info(...args: unknown[]): void {
    if (this.config.debugMode) {
      console.info('ℹ️ [Wanderbricks]', ...args);
    }
  }

  /**
   * Log error messages
   */
  error(...args: unknown[]): void {
    console.error('🚨 [Wanderbricks Error]', ...args);
  }

  /**
   * Get environment-specific feature flags
   */
  getFeatureFlags(): Record<string, boolean> {
    return {
      enablePayments: false, // Disabled for demo
      enableRealTimeChat: false,
      enableNotifications: false,
      enableAdvancedSearch: true,
      enableBookingHistory: true,
      enableUserReviews: true,
      enableMobileApp: false,
    };
  }

  /**
   * Get environment-specific limits
   */
  getLimits(): Record<string, number> {
    return {
      maxSearchResults: 20,
      maxImages: 10,
      maxAmenities: 20,
      searchTimeout: 30000, // 30 seconds
      apiTimeout: 10000, // 10 seconds
    };
  }
}

// Export singleton instance
export const configService = new ConfigService();
export default configService;
