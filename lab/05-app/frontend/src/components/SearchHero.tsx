import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, ChevronDown, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import type { SearchData } from '../types/api';
import { AIAssistantModal } from './ai/AIAssistantModal';
import { SearchResults } from '../types/ai';

interface SearchHeroProps {
  onSearch: (searchData: SearchData) => void;
  onAISearchResults?: (properties: Property[], searchData: SearchData) => void;
  searchData: SearchData;
}

// Import Property type from api types
import type { Property } from '../types/api';

const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, onAISearchResults, searchData }) => {
  const [formData, setFormData] = useState<SearchData>({
    destination: searchData.destination || '',
    checkIn: searchData.checkIn || '',
    checkOut: searchData.checkOut || '',
    guests: searchData.guests || 2,
  });

  const [availableCities, setAvailableCities] = useState<{ city: string; country: string; display: string }[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'traditional' | 'ai'>('traditional');

  // Get default dates (today + 1 day for check-in, today + 3 days for check-out)
  const getDefaultDates = () => {
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() + 3);
    
    return {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
    };
  };

  // Set default dates if not provided and load cities
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) {
      const defaultDates = getDefaultDates();
      setFormData(prev => ({
        ...prev,
        checkIn: prev.checkIn || defaultDates.checkIn,
        checkOut: prev.checkOut || defaultDates.checkOut,
      }));
    }
    
    // Load available cities
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        console.log('🏙️ Loading cities from API...');
        const cities = await apiService.getCities();
        console.log('🏙️ Cities loaded:', cities);
        
        // Define top 6 priority cities (using actual cities from database)
        const topCities = [
          'Tokyo, Japan', 'New York, United States', 'London, United Kingdom',
          'Dubai, United Arab Emirates', 'Singapore, Singapore', 'Rome, Italy'
        ];
        
        // Sort cities: top 6 first, then others
        const sortedCities = cities.sort((a, b) => {
          const aIndex = topCities.indexOf(a.display);
          const bIndex = topCities.indexOf(b.display);
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex; // Both are top cities, sort by priority
          } else if (aIndex !== -1) {
            return -1; // a is a top city, b is not
          } else if (bIndex !== -1) {
            return 1; // b is a top city, a is not
          } else {
            return a.display.localeCompare(b.display); // Neither are top cities, sort alphabetically
          }
        });
        
        setAvailableCities(sortedCities);
      } catch (error) {
        console.error('❌ Failed to load cities:', error);
        // Set fallback cities
        const fallbackCities = [
          { city: "Paris", country: "France", display: "Paris, France" },
          { city: "Tokyo", country: "Japan", display: "Tokyo, Japan" },
          { city: "New York", country: "United States", display: "New York, United States" },
          { city: "London", country: "United Kingdom", display: "London, United Kingdom" },
          { city: "Barcelona", country: "Spain", display: "Barcelona, Spain" },
          { city: "Amsterdam", country: "Netherlands", display: "Amsterdam, Netherlands" },
          { city: "Agra", country: "India", display: "Agra, India" }
        ];
        console.log('🏙️ Using fallback cities:', fallbackCities);
        setAvailableCities(fallbackCities);
      } finally {
        setIsLoadingCities(false);
      }
    };
    
    loadCities();
  }, []);

  const handleDestinationSelect = (destination: string) => {
    console.log('📍 Destination selected:', destination);
    setFormData(prev => ({ ...prev, destination }));
    console.log('📍 Destination set in form data');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.destination) {
      alert('Please select a destination');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    console.log('🚀 Submitting search with data:', formData);
    onSearch(formData);
  };

  // AI Assistant handlers
  const handleAIAssistantOpen = () => {
    setSearchMode('ai');
    setIsAIAssistantOpen(true);
  };

  const handleAIAssistantClose = () => {
    setIsAIAssistantOpen(false);
  };

  const handleAISearchResults = (results: SearchResults) => {
    console.log('🤖 AI Search Results:', results);

    // Extract search parameters from metadata
    const searchParams: SearchData = {
      destination: results.metadata.destination || '',
      checkIn: formData.checkIn, // Use current form dates since metadata may not have exact format
      checkOut: formData.checkOut,
      guests: results.metadata.guests || formData.guests,
    };

    // If we have an AI search results handler, use it to bypass traditional search
    if (onAISearchResults && results.properties.length > 0) {
      console.log('🤖 Using AI search results directly with', results.properties.length, 'properties');
      // Cast AI properties to match API property interface
      onAISearchResults(results.properties as any[], searchParams);
    } else {
      // Fallback to traditional search if no AI handler or no results
      console.log('🤖 Falling back to traditional search');
      onSearch(searchParams);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Vibrant background with colorful gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/80 to-pink-50/60">
        {/* Colorful floating shapes for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-300/15 rounded-full animate-float shadow-md" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-300/15 rounded-full animate-float shadow-md" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-300/15 rounded-full animate-float shadow-md" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-indigo-300/15 rounded-full animate-float shadow-md" style={{ animationDelay: '1s' }} />
        <div className="absolute top-60 left-1/3 w-14 h-14 bg-gradient-to-br from-emerald-400/20 to-teal-300/15 rounded-full animate-float shadow-md" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-60 right-1/3 w-18 h-18 bg-gradient-to-br from-violet-400/20 to-purple-300/15 rounded-full animate-float shadow-md" style={{ animationDelay: '5s' }} />
        
        {/* Additional colorful blur elements */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-primary/8 to-pink-400/8 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-l from-secondary/8 to-blue-400/8 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-br from-yellow-300/8 to-orange-400/8 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Colorful geometric shapes */}
        <div className="absolute top-32 right-32 w-8 h-8 bg-gradient-to-br from-indigo-400/25 to-blue-500/20 rounded-lg rotate-45 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-gradient-to-br from-rose-400/25 to-pink-500/20 rounded-lg rotate-12 animate-float shadow-lg" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-1/2 right-16 w-10 h-10 bg-gradient-to-br from-green-400/25 to-emerald-500/20 rounded-full animate-float shadow-lg" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Hero Text */}
        <div className="mb-12">
          <h1 className="text-hero text-foreground mb-6 animate-fade-in">
            Find your next
            <span className="block text-primary">
              adventure
            </span>
          </h1>
          <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Discover amazing places to stay with our traditional search or ask our AI
            assistant to find the perfect match for your needs.
          </p>

          {/* Search Mode Toggle - Matching Figma Design */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={() => setSearchMode('traditional')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                searchMode === 'traditional'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Quick Search</span>
            </button>

            <button
              onClick={handleAIAssistantOpen}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                searchMode === 'ai'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Traditional Search Form - Only show when traditional mode is selected */}
        {searchMode === 'traditional' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-500/10 border border-gradient-to-r from-purple-200/30 via-pink-200/30 to-blue-200/30 p-6 md:p-8 animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.6s' }}>
            {/* Colorful border gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl"></div>
            <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Search Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Destination Select */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Where
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    value={formData.destination}
                    onChange={(e) => {
                      console.log('📍 Destination selected:', e.target.value);
                      setFormData(prev => ({ ...prev, destination: e.target.value }));
                    }}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">Select destination</option>
                    {availableCities.map((city) => (
                      <option key={city.display} value={city.display}>
                        {city.display}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Check-in Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Check-in
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Check-out
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                  <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Guests
                </label>
                <div className="relative">
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                  <Users className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-primary via-pink-500 to-purple-600 hover:from-primary-hover hover:via-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-pink-500/30 transform hover:scale-110 transition-all duration-300 flex items-center space-x-2 relative overflow-hidden"
              >
                <Search className="w-5 h-5" />
                <span>Search Properties</span>
              </button>
            </div>
          </form>
          </div>
          </div>
        )}

        {/* Popular Destinations */}
        {!isLoadingCities && availableCities.length > 0 && (
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <p className="text-muted-foreground text-sm font-medium mb-4">Popular destinations</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Tokyo, Japan', 'New York, United States', 'London, United Kingdom', 'Dubai, United Arab Emirates', 'Singapore, Singapore', 'Rome, Italy'].map((cityName) => {
                const cityExists = availableCities.find(c => c.display === cityName);
                if (!cityExists) return null;
                
                const emojiMap: Record<string, string> = {
                  'Japan': '🇯🇵',
                  'United States': '🇺🇸',
                  'United Kingdom': '🇬🇧',
                  'United Arab Emirates': '🇦🇪',
                  'Singapore': '🇸🇬',
                  'Italy': '🇮🇹'
                };
                const emoji = emojiMap[cityExists.country] || '🌍';
                
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => {
                      console.log('🔥 Popular destination clicked:', cityName);
                      handleDestinationSelect(cityName);
                    }}
                    className="bg-white/95 backdrop-blur-sm border border-purple-200/50 text-foreground px-4 py-2 rounded-full hover:border-primary hover:text-primary hover:bg-gradient-to-r hover:from-pink-100/80 hover:to-blue-100/80 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-pink-500/20 transform hover:scale-110"
                  >
                    <span>{emoji}</span>
                    <span className="text-sm font-medium">{cityName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={handleAIAssistantClose}
        onSearchResults={handleAISearchResults}
      />
    </div>
  );
};

export default SearchHero;