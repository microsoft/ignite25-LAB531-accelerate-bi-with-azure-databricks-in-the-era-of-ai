import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Users, Building, DollarSign, Calendar, MapPin } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CountryOption {
  value: string;
  label: string;
  flag: string;
  property_count?: number;
}

interface MarketPerformanceData {
  total_gbv: number;
  total_revenue: number;
  total_bookings: number;
  avg_booking_value: number;
  occupancy_rate: number;
  total_properties: number;
  unique_cities: number;
  monthly_trends: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  mom_growth: number;
  last_updated: string;
}

interface CityPerformanceData {
  city_id: number;
  city_name: string;
  properties_count: number;
  booking_count: number;
  gbv: number;
  avg_booking_value: number;
  occupancy_rate: number;
  market_share: number;
}

interface CityDataResponse {
  cities: CityPerformanceData[];
  total_cities: number;
}

interface HostPerformanceData {
  active_hosts: number;
  superhost_percentage: number;
  growth_rate: number;
  churn_rate: number;
  host_distribution: {
    single_property: number;
    multi_property: number;
  };
  host_performance_metrics: Array<{
    metric: string;
    value: string | number;
    percentage: number;
    color: string;
  }>;
  total_hosts: number;
  last_updated: string;
}

interface GuestPerformanceData {
  active_guests: number;
  total_guests: number;
  repeat_guest_percentage: number;
  cancellation_rate: number;
  guest_nps: number;
  avg_guest_rating: number;
  monthly_trends: Array<{
    month: string;
    month_num: number;
    active_guests: number;
    bookings: number;
    avg_booking_value: number;
  }>;
  guest_satisfaction_metrics: Array<{
    metric: string;
    value: string | number;
    percentage: number;
    color: string;
  }>;
  last_updated: string;
}

interface PropertyPerformanceData {
  avg_nightly_rate: number;
  top_property_type: string;
  top_property_count: number;
  underperforming_count: number;
  property_type_count: number;
  property_types_performance: Array<{
    type: string;
    count: number;
    avg_price: number;
    occupancy_rate: number;
  }>;
  amenity_gaps: Array<{
    amenity: string;
    missing_percentage: number;
  }>;
  last_updated: string;
}

interface OperationsPerformanceData {
  total_employees: number;
  host_employee_ratio: number;
  support_response_time_hours: number;
  cities_covered: number;
  employee_distribution: Array<{
    city: string;
    count: number;
  }>;
  last_updated: string;
}


interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon: Icon, description, trend }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Check if this should be formatted as percentage first
      const isPercentage = title.toLowerCase().includes('rate') || 
                          title.toLowerCase().includes('percentage') || 
                          title.toLowerCase().includes('growth');
      
      if (isPercentage) return `${val.toFixed(1)}%`;
      
      // Check if this should be formatted as currency
      const isCurrency = title.toLowerCase().includes('gbv') || 
                          title.toLowerCase().includes('revenue') || 
                          title.toLowerCase().includes('value');
      
      if (isCurrency) {
        if (val > 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val > 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toLocaleString()}`;
      }
      
      // Format non-currency numbers (counts, etc.)
      if (val > 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val > 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <Card className="relative overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${getTrendColor()}`}>
            {TrendIcon && <TrendIcon className="mr-1 h-3 w-3" />}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            <span className="ml-1 text-gray-400">vs last month</span>
          </div>
        )}
        {description && !change && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function CountryManagerDashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [activeTab, setActiveTab] = useState<string>('market');
  const [marketData, setMarketData] = useState<MarketPerformanceData | null>(null);
  const [cityData, setCityData] = useState<CityDataResponse | null>(null);
  const [hostData, setHostData] = useState<HostPerformanceData | null>(null);
  const [guestData, setGuestData] = useState<GuestPerformanceData | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyPerformanceData | null>(null);
  const [operationsData, setOperationsData] = useState<OperationsPerformanceData | null>(null);
  
  
  // Track which tabs have been loaded to prevent re-fetching
  const [loadedTabs, setLoadedTabs] = useState(new Set(['market']));
  
  const [error, setError] = useState<string | null>(null);

  // Fetch available countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/dashboard/countries');
        const data = await response.json();
        setCountries(data.countries || []);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };

    fetchCountries();
  }, []);

  // Individual data fetching functions
  const fetchMarketData = async (country: string) => {
    console.log('🔍 Fetching market performance for:', country);
    const countryParam = `?country=${country}`;
    setError(null);
    
    try {
      const response = await fetch(`/api/dashboard/market-performance${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setMarketData(result);
      }
    } catch (err) {
      console.error('Market data error:', err);
      setError('Failed to fetch market data');
    } finally {
    }
  };

  const fetchCityData = async (country: string) => {
    console.log('🏙️ Fetching city performance for:', country);
    const countryParam = `?country=${country}`;
    
    try {
      const response = await fetch(`/api/dashboard/city-performance${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('City data error:', result.error);
      } else {
        setCityData(result);
      }
    } catch (err) {
      console.error('City data fetch error:', err);
    } finally {
    }
  };

  const fetchHostData = async (country: string) => {
    console.log('👥 Fetching host performance for:', country);
    const countryParam = `?country=${country}`;
    
    try {
      const response = await fetch(`/api/dashboard/host-performance${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('Host data error:', result.error);
      } else {
        setHostData(result);
      }
    } catch (err) {
      console.error('Host data fetch error:', err);
    } finally {
    }
  };

  const fetchGuestData = async (country: string) => {
    console.log('🏠 Fetching guest performance for:', country);
    const countryParam = `?country=${country}`;
    
    try {
      const response = await fetch(`/api/dashboard/guest-performance${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('Guest data error:', result.error);
      } else {
        setGuestData(result);
      }
    } catch (err) {
      console.error('Guest data fetch error:', err);
    } finally {
    }
  };

  const fetchPropertyData = async (country: string) => {
    console.log('🏘️ Fetching property performance for:', country);
    const countryParam = `?country=${country}`;
    
    try {
      const response = await fetch(`/api/dashboard/property-performance${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('Property data error:', result.error);
      } else {
        setPropertyData(result);
      }
    } catch (err) {
      console.error('Property data fetch error:', err);
    } finally {
    }
  };

  const fetchOperationsData = async (country: string) => {
    console.log('⚙️ Fetching operations performance for:', country);
    const countryParam = `?country=${country}`;
    
    try {
      const response = await fetch(`/api/dashboard/operations${countryParam}`);
      const result = await response.json();
      
      if (result.error) {
        console.error('Operations data error:', result.error);
      } else {
        setOperationsData(result);
      }
    } catch (err) {
      console.error('Operations data fetch error:', err);
    } finally {
    }
  };


  // Load only Market Performance data initially
  useEffect(() => {
    fetchMarketData(selectedCountry);
  }, [selectedCountry]);

  // Refresh all loaded tabs when country changes
  useEffect(() => {
    // Skip initial load (handled above)
    if (loadedTabs.size === 0) return;
    
    // Refresh data for all previously loaded tabs
    loadedTabs.forEach(tab => {
      switch (tab) {
        case 'market':
          fetchMarketData(selectedCountry);
          break;
        case 'cities':
          fetchCityData(selectedCountry);
          break;
        case 'hosts':
          fetchHostData(selectedCountry);
          break;
        case 'guests':
          fetchGuestData(selectedCountry);
          break;
        case 'properties':
          fetchPropertyData(selectedCountry);
          break;
        case 'operations':
          fetchOperationsData(selectedCountry);
          break;
      }
    });
  }, [selectedCountry, loadedTabs]);

  // Handle tab changes with lazy loading
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    
    // Only fetch data if this tab hasn't been loaded yet
    if (!loadedTabs.has(tabValue)) {
      setLoadedTabs(prev => new Set([...prev, tabValue]));
      
      switch (tabValue) {
        case 'cities':
          fetchCityData(selectedCountry);
          break;
        case 'hosts':
          fetchHostData(selectedCountry);
          break;
        case 'guests':
          fetchGuestData(selectedCountry);
          break;
        case 'properties':
          fetchPropertyData(selectedCountry);
          break;
        case 'operations':
          fetchOperationsData(selectedCountry);
          break;
      }
    }
  };

  // When country changes, reset loaded tabs
  useEffect(() => {
    setLoadedTabs(new Set(['market']));
    // Only reload if we're currently on a non-market tab
    if (activeTab !== 'market') {
      // Reset the tab data to null so it needs to reload
      switch (activeTab) {
        case 'cities':
          setCityData(null);
          break;
        case 'hosts':
          setHostData(null);
          break;
        case 'guests':
          setGuestData(null);
          break;
        case 'properties':
          setPropertyData(null);
          break;
        case 'operations':
          setOperationsData(null);
          break;
      }
    }
  }, [selectedCountry]);

  // Show error if there's a critical error (only for market data since it loads first)
  if (error && !marketData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Country Manager Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor performance, identify opportunities, and drive growth</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[200px] bg-white border-gray-300">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
              Last Updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="market" className="rounded-lg">Market</TabsTrigger>
            <TabsTrigger value="cities" className="rounded-lg">Cities</TabsTrigger>
            <TabsTrigger value="hosts" className="rounded-lg">Hosts</TabsTrigger>
            <TabsTrigger value="guests" className="rounded-lg">Guests</TabsTrigger>
            <TabsTrigger value="properties" className="rounded-lg">Properties</TabsTrigger>
            <TabsTrigger value="operations" className="rounded-lg">Operations</TabsTrigger>
          </TabsList>

          {/* Market Performance Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Gross Booking Value"
                value={marketData?.total_gbv || 0}
                change={marketData?.mom_growth}
                icon={DollarSign}
                trend={marketData?.mom_growth && marketData?.mom_growth > 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Revenue (15% Commission)"
                value={marketData?.total_revenue || 0}
                change={marketData?.mom_growth}
                icon={TrendingUp}
                trend={marketData?.mom_growth && marketData?.mom_growth > 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Occupancy Rate"
                value={marketData?.occupancy_rate || 0}
                change={marketData?.mom_growth && marketData?.mom_growth * 0.5}
                icon={Calendar}
                trend={marketData?.mom_growth && marketData?.mom_growth > 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Booking Volume"
                value={marketData?.total_bookings || 0}
                change={marketData?.mom_growth}
                icon={Building}
                trend={marketData?.mom_growth && marketData?.mom_growth > 0 ? 'up' : 'down'}
              />
              <MetricCard
                title="Avg Booking Value"
                value={marketData?.avg_booking_value || 0}
                change={marketData?.mom_growth && marketData?.mom_growth * 0.3}
                icon={Users}
                trend={marketData?.mom_growth && marketData?.mom_growth > 0 ? 'up' : 'down'}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    Revenue Trend (Last 6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart 
                      data={marketData?.monthly_trends || []} 
                      margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff5a5f" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff5a5f" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis 
                        stroke="#666" 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }} 
                        formatter={(value) => [`$${(Number(value) / 1000).toFixed(1)}K`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#ff5a5f" fillOpacity={1} fill="url(#revenueGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-500" />
                    Booking Volume by Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={marketData?.monthly_trends || []} 
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis 
                        stroke="#666" 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        width={50}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }} 
                        formatter={(value) => [`${Number(value).toLocaleString()}`, 'Bookings']}
                      />
                      <Bar dataKey="bookings" fill="#00a699" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* City Performance Tab */}
          <TabsContent value="cities" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Top Performing Cities by GBV
                  </CardTitle>
                  <p className="text-sm text-gray-600">Cities generating the highest revenue</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cityData?.cities?.slice(0, 6).map((city, index) => {
                      const maxGbv = Math.max(...(cityData.cities.map(c => Number(c.gbv) || 0)));
                      const cityGbv = Number(city.gbv) || 0;
                      const percentage = maxGbv > 0 ? (cityGbv / maxGbv) * 100 : 0;
                      
                      return (
                        <div key={city.city_id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-700 w-4 text-center">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-900 min-w-[100px]">
                                {city.city_name}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              ${(cityGbv / 1000000).toFixed(1)}M
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: `${percentage}%`,
                                minWidth: percentage > 0 ? '8px' : '0px'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{city.properties_count} properties</span>
                            <span>{city.market_share.toFixed(1)}% market share</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {(!cityData?.cities || cityData.cities.length === 0) && (
                      <div className="flex items-center justify-center py-12 text-gray-500">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No city data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-teal-500" />
                    City Occupancy Rates
                  </CardTitle>
                  <p className="text-sm text-gray-600">Property utilization by city</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={cityData?.cities.slice(0, 6) || []} 
                      margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="city_name" 
                        stroke="#666" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#666" 
                        tickFormatter={(value) => `${value.toFixed(0)}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="occupancy_rate" fill="#00a699" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle>City Performance Summary</CardTitle>
                <p className="text-sm text-gray-600">Detailed metrics for each city</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cityData?.cities.map((city, index) => (
                    <div key={city.city_id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{city.city_name}</h4>
                          <p className="text-sm text-gray-500">{city.properties_count} properties</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">${(city.gbv / 1000000).toFixed(1)}M</p>
                          <p className="text-gray-500">GBV</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{city.occupancy_rate.toFixed(1)}%</p>
                          <p className="text-gray-500">Occupancy</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{city.market_share.toFixed(1)}%</p>
                          <p className="text-gray-500">Market Share</p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No city data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hosts Performance Tab */}
          <TabsContent value="hosts" className="space-y-6">
            {/* Host Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Active Hosts"
                value={hostData?.active_hosts || 0}
                icon={Users}
                description={`Out of ${hostData?.total_hosts || 0} total hosts`}
              />
              <MetricCard
                title="Superhost %"
                value={`${(hostData?.superhost_percentage || 0).toFixed(1)}%`}
                icon={TrendingUp}
                description="High-performing hosts"
              />
              <MetricCard
                title="Host Growth Rate"
                value={`${(hostData?.growth_rate || 0).toFixed(1)}%`}
                icon={TrendingUp}
                description="New hosts joining"
              />
              <MetricCard
                title="Host Churn Rate"
                value={`${(hostData?.churn_rate || 0).toFixed(1)}%`}
                icon={TrendingDown}
                description="Hosts leaving platform"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Host Distribution Pie Chart */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Host Distribution
                  </CardTitle>
                  <p className="text-sm text-gray-600">Single vs multi-property hosts</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      {/* Custom SVG Pie Chart */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="20"
                          strokeDasharray={`${(hostData?.host_distribution?.multi_property || 87) * 2.51} 251.2`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="20"
                          strokeDasharray={`${(hostData?.host_distribution?.single_property || 13) * 2.51} 251.2`}
                          strokeDashoffset={`-${(hostData?.host_distribution?.multi_property || 87) * 2.51}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{hostData?.total_hosts || 0}</div>
                          <div className="text-sm text-gray-500">Total Hosts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-900">Multi Property</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{(hostData?.host_distribution?.multi_property || 87).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-900">Single Property</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{(hostData?.host_distribution?.single_property || 13).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Host Performance Metrics */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Host Performance Metrics
                  </CardTitle>
                  <p className="text-sm text-gray-600">Key performance indicators</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {hostData?.host_performance_metrics?.map((metric, index) => {
                      const getColor = (color: string) => {
                        const colors = {
                          blue: 'from-blue-400 to-blue-500',
                          green: 'from-green-400 to-green-500',
                          purple: 'from-purple-400 to-purple-500',
                          red: 'from-red-400 to-red-500'
                        };
                        return colors[color as keyof typeof colors] || 'from-gray-400 to-gray-500';
                      };
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {metric.metric}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {metric.value}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getColor(metric.color)} rounded-full transition-all duration-700 ease-out`}
                              style={{ 
                                width: `${Math.min(100, Math.max(0, metric.percentage))}%`,
                                minWidth: metric.percentage > 0 ? '8px' : '0px'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          </div>
                        </div>
                      );
                    }) || (
                      <div className="flex items-center justify-center py-8 text-gray-500">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No host metrics available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            {/* Guest Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Guests"
                value={guestData?.active_guests || 0}
                icon={Users}
                description="Active guests this year"
                trend={guestData?.active_guests && guestData?.total_guests ? (guestData.active_guests > 0 ? 'up' : 'neutral') : 'neutral'}
              />
              <MetricCard
                title="Repeat Guest %"
                value={`${(guestData?.repeat_guest_percentage || 0).toFixed(1)}%`}
                change={(guestData?.repeat_guest_percentage || 0)}
                icon={Users}
                description="Repeat bookings rate"
                trend={guestData?.repeat_guest_percentage && guestData.repeat_guest_percentage > 50 ? 'up' : 'neutral'}
              />
              <MetricCard
                title="Cancellation Rate"
                value={`${(guestData?.cancellation_rate || 0).toFixed(1)}%`}
                change={-(guestData?.cancellation_rate || 0)}
                icon={Calendar}
                description="Booking cancellations"
                trend={guestData?.cancellation_rate && guestData.cancellation_rate < 20 ? 'up' : guestData?.cancellation_rate && guestData.cancellation_rate > 30 ? 'down' : 'neutral'}
              />
              <MetricCard
                title="Guest NPS"
                value={Math.round(guestData?.guest_nps || 85)}
                change={guestData?.guest_nps || 85}
                icon={TrendingUp}
                description="Net Promoter Score"
                trend={guestData?.guest_nps && guestData.guest_nps > 70 ? 'up' : 'neutral'}
              />
            </div>

            {/* Guest Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Guest Satisfaction Metrics */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Guest Satisfaction Metrics</CardTitle>
                  <p className="text-sm text-gray-500">Key indicators of guest experience</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {guestData?.guest_satisfaction_metrics?.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                        <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            metric.color === 'blue' ? 'bg-blue-500' :
                            metric.color === 'green' ? 'bg-green-500' :
                            metric.color === 'teal' ? 'bg-teal-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Guest satisfaction data will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guest Engagement Trends */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Guest Engagement Trends</CardTitle>
                  <p className="text-sm text-gray-500">Monthly guest activity</p>
                </CardHeader>
                <CardContent>
                  {guestData?.monthly_trends && guestData.monthly_trends.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={guestData.monthly_trends}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="active_guests" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                            name="Active Guests"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="bookings" 
                            stroke="#f59e0b" 
                            fill="#f59e0b" 
                            fillOpacity={0.2}
                            strokeWidth={2}
                            name="Bookings"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Guest engagement trends will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            {/* Property Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Avg Nightly Rate"
                value={`$${Math.round(propertyData?.avg_nightly_rate || 0)}`}
                icon={DollarSign}
                description="Average property price"
                trend="neutral"
              />
              <MetricCard
                title="Top Property Type"
                value={propertyData?.top_property_type || 'Loft'}
                icon={Building}
                description={`${propertyData?.top_property_count || 0} properties`}
                trend="neutral"
              />
              <MetricCard
                title="Underperforming"
                value={propertyData?.underperforming_count || 0}
                icon={TrendingDown}
                description="Properties with 0 bookings (90 days)"
                trend={propertyData?.underperforming_count && propertyData.underperforming_count > 50 ? 'down' : 'neutral'}
              />
              <MetricCard
                title="Property Types"
                value={propertyData?.property_type_count || 6}
                icon={Building}
                description="Different accommodation types"
                trend="neutral"
              />
            </div>

            {/* Property Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Property Types Performance */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Property Types Performance</CardTitle>
                  <p className="text-sm text-gray-500">Bookings by property type</p>
                </CardHeader>
                <CardContent>
                  {propertyData?.property_types_performance && propertyData.property_types_performance.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={propertyData.property_types_performance.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="type" className="text-xs" angle={-45} textAnchor="end" height={80} />
                          <YAxis className="text-xs" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${Number(value).toLocaleString()}`, 'Property Count']}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="#ff5a5f" 
                            radius={[4, 4, 0, 0]}
                            name="Property Count"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Property performance data will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amenity Coverage Gaps */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Amenity Coverage Gaps</CardTitle>
                  <p className="text-sm text-gray-500">% of properties missing key amenities</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {propertyData?.amenity_gaps && propertyData.amenity_gaps.length > 0 ? 
                    propertyData.amenity_gaps.slice(0, 5).map((gap, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{gap.amenity}</span>
                          <span className="text-sm font-semibold text-red-600">{gap.missing_percentage.toFixed(1)}% missing</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-orange-400 to-red-500"
                            style={{ width: `${Math.min(gap.missing_percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Amenity gap analysis will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Property Type Analysis */}
            {propertyData?.property_types_performance && propertyData.property_types_performance.length > 0 && (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Property Type Analysis</CardTitle>
                  <p className="text-sm text-gray-500">Detailed breakdown of each property type</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyData.property_types_performance.slice(0, 6).map((property, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            index === 0 ? 'bg-red-500' :
                            index === 1 ? 'bg-orange-500' :
                            index === 2 ? 'bg-yellow-500' :
                            index === 3 ? 'bg-green-500' :
                            index === 4 ? 'bg-blue-500' : 'bg-purple-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{property.type}</h4>
                            <p className="text-sm text-gray-500">{property.count} properties</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${Math.round(property.avg_price)} Avg Price</p>
                          <p className="text-sm text-gray-500">{property.occupancy_rate.toFixed(1)}% Occupancy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            {/* Operations Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Employees"
                value={operationsData?.total_employees || 0}
                icon={Users}
                description="Active employees"
              />
              <MetricCard
                title="Host-Employee Ratio"
                value={`${(operationsData?.host_employee_ratio || 0).toFixed(1)}:1`}
                icon={TrendingUp}
                description="Host to employee ratio"
              />
              <MetricCard
                title="Support Response Time"
                value={`${(operationsData?.support_response_time_hours || 0).toFixed(1)}h`}
                icon={Calendar}
                description="Average response time"
              />
              <MetricCard
                title="Cities Covered"
                value={operationsData?.cities_covered || 0}
                icon={MapPin}
                description="Service coverage areas"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Employee Distribution Chart */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-500" />
                    Employee Distribution by City
                  </CardTitle>
                  <p className="text-sm text-gray-600">Staff allocation across cities</p>
                </CardHeader>
                <CardContent>
                  {operationsData?.employee_distribution && operationsData.employee_distribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={operationsData.employee_distribution.slice(0, 6)} 
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="city" 
                          stroke="#666" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#666" 
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }} 
                          formatter={(value) => [`${Number(value)} employees`, 'Count']}
                        />
                        <Bar dataKey="count" fill="#00a699" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No employee distribution data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operational Metrics Summary */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-500" />
                    Operational Metrics
                  </CardTitle>
                  <p className="text-sm text-gray-600">Key performance indicators</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Response Time</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(operationsData?.support_response_time_hours || 0).toFixed(1)}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, 100 - ((operationsData?.support_response_time_hours || 0) / 8 * 100)))}%`,
                            minWidth: operationsData?.support_response_time_hours ? '8px' : '0px'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                      <p className="text-xs text-gray-500">Target: &lt; 4 hours</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Coverage Ratio</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {(operationsData?.host_employee_ratio || 0).toFixed(1)}:1
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${Math.min(100, ((operationsData?.host_employee_ratio || 0) / 3) * 100)}%`,
                            minWidth: operationsData?.host_employee_ratio ? '8px' : '0px'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                      <p className="text-xs text-gray-500">Optimal: 2-3:1 ratio</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">City Coverage</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {operationsData?.cities_covered || 0} cities
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${Math.min(100, ((operationsData?.cities_covered || 0) / 10) * 100)}%`,
                            minWidth: operationsData?.cities_covered ? '8px' : '0px'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                      <p className="text-xs text-gray-500">Expanding coverage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}