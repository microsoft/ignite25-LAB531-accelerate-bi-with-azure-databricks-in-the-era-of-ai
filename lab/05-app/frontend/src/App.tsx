import { useState, useEffect } from 'react';
import { ViewType, AppState, User } from './types/api';
import { configService } from './services/config';
import { authService } from './services/auth';

// Import components
import Header from './components/Header';
import { CountryManagerDashboard } from './components/CountryManagerDashboard';
import { CustomerDataPlatform } from './components/CustomerDataPlatform';
import { DemandForecastingDashboard } from './components/DemandForecastingDashboard';
import ErrorAlert from './components/ErrorAlert';

/**
 * Main application component managing state and routing
 * Handles the complete user journey: search → results → detail → booking → confirmation
 */
type PersonaType = 'countryManager' | 'customerData' | 'demandForecasting';

function App() {
  // Application state
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('countryManager');
  const [appState, setAppState] = useState<AppState>({
    currentView: 'search' as ViewType,
    searchData: {
      destination: '',
      check_in: '',
      check_out: '',
      guests: 2,
      page: 1,
      limit: 20,
    },
    selectedPropertyId: null,
    isLoading: false,
    error: null,
  });

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize authentication and configuration
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppState(prev => ({ ...prev, isLoading: true, error: null }));

        // Initialize authentication
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        // Log configuration info
        configService.info('App initialized', {
          isDatabricksEnv: configService.isDatabricksEnv,
          useMockData: configService.useMockData,
          user: user?.name || 'Anonymous',
        });

      } catch (error) {
        configService.error('App initialization failed:', error);
        setAppState(prev => ({
          ...prev,
          error: 'Failed to initialize application. Please refresh the page.',
        }));
      } finally {
        setAppState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeApp();
  }, []);

  /**
   * Handle error dismissal
   */
  const handleErrorDismiss = () => {
    setAppState(prev => ({ ...prev, error: null }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        currentView={appState.currentView}
        user={currentUser}
        onLogoClick={() => setAppState(prev => ({ ...prev, currentView: 'search' }))}
        currentPersona={currentPersona}
        onPersonaChange={setCurrentPersona}
      />

      {/* Error Alert */}
      {appState.error && (
        <ErrorAlert
          message={appState.error}
          onDismiss={handleErrorDismiss}
        />
      )}

      {/* Main Content */}
      <main className="relative">
        {currentPersona === 'countryManager' ? (
          <CountryManagerDashboard />
        ) : currentPersona === 'customerData' ? (
          <CustomerDataPlatform />
        ) : (
          <DemandForecastingDashboard />
        )}
      </main>

      {/* Footer - only show on search page */}
      {appState.currentView === 'search' && (
        <footer className="bg-gray-50 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-600">
              © 2024 Wanderbricks Travel Platform. Built for Databricks Apps.
            </p>
            {configService.useMockData && (
              <p className="text-xs text-gray-500 mt-2">
                🧪 Demo Mode - Using mock data for development
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
