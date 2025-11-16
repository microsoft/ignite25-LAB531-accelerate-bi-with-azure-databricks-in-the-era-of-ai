import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Building,
  Home,
  Hotel,
  UserCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock regional data
const regionData = [
  {
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    current: {
      bookings: 15420,
      revenue: 12400000,
      occupancy: 82.4,
      avgPrice: 180
    },
    forecast: {
      bookings: 18200,
      revenue: 15600000,
      occupancy: 88.1,
      avgPrice: 195
    },
    growth: {
      bookings: 18.0,
      revenue: 25.8,
      occupancy: 6.9,
      price: 8.3
    },
    seasonality: 'High summer demand, Olympics effect',
    trend: 'positive',
    confidence: 94.2
  },
  {
    city: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    current: {
      bookings: 22340,
      revenue: 18900000,
      occupancy: 76.8,
      avgPrice: 245
    },
    forecast: {
      bookings: 24580,
      revenue: 21200000,
      occupancy: 79.2,
      avgPrice: 255
    },
    growth: {
      bookings: 10.0,
      revenue: 12.2,
      occupancy: 3.1,
      price: 4.1
    },
    seasonality: 'Steady business travel',
    trend: 'positive',
    confidence: 91.8
  },
  {
    city: 'London',
    country: 'UK',
    flag: '🇬🇧',
    current: {
      bookings: 18750,
      revenue: 14200000,
      occupancy: 73.2,
      avgPrice: 165
    },
    forecast: {
      bookings: 19890,
      revenue: 15100000,
      occupancy: 75.8,
      avgPrice: 172
    },
    growth: {
      bookings: 6.1,
      revenue: 6.3,
      occupancy: 3.6,
      price: 4.2
    },
    seasonality: 'Summer tourist season',
    trend: 'positive',
    confidence: 89.4
  },
  {
    city: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    current: {
      bookings: 12680,
      revenue: 11800000,
      occupancy: 85.9,
      avgPrice: 220
    },
    forecast: {
      bookings: 16200,
      revenue: 16400000,
      occupancy: 91.3,
      avgPrice: 240
    },
    growth: {
      bookings: 27.8,
      revenue: 39.0,
      occupancy: 6.3,
      price: 9.1
    },
    seasonality: 'Winter peak season',
    trend: 'positive',
    confidence: 96.1
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    current: {
      bookings: 9840,
      revenue: 8900000,
      occupancy: 79.1,
      avgPrice: 190
    },
    forecast: {
      bookings: 11340,
      revenue: 10800000,
      occupancy: 82.6,
      avgPrice: 205
    },
    growth: {
      bookings: 15.2,
      revenue: 21.3,
      occupancy: 4.4,
      price: 7.9
    },
    seasonality: 'Business hub stability',
    trend: 'positive',
    confidence: 88.7
  },
  {
    city: 'Rome',
    country: 'Italy',
    flag: '🇮🇹',
    current: {
      bookings: 14230,
      revenue: 9600000,
      occupancy: 71.4,
      avgPrice: 145
    },
    forecast: {
      bookings: 15680,
      revenue: 10900000,
      occupancy: 74.8,
      avgPrice: 155
    },
    growth: {
      bookings: 10.2,
      revenue: 13.5,
      occupancy: 4.8,
      price: 6.9
    },
    seasonality: 'Summer tourism peak',
    trend: 'positive',
    confidence: 85.3
  }
];

const monthlyTrends = [
  { month: 'Jan', Tokyo: 14200, NewYork: 21800, London: 17200, Dubai: 16800, Singapore: 9200, Rome: 11200 },
  { month: 'Feb', Tokyo: 13800, NewYork: 22100, London: 17600, Dubai: 18200, Singapore: 9500, Rome: 11800 },
  { month: 'Mar', Tokyo: 15600, NewYork: 23400, London: 19200, Dubai: 17200, Singapore: 10100, Rome: 13600 },
  { month: 'Apr', Tokyo: 16800, NewYork: 24200, London: 20100, Dubai: 15600, Singapore: 10400, Rome: 14800 },
  { month: 'May', Tokyo: 17200, NewYork: 23800, London: 19800, Dubai: 14200, Singapore: 10200, Rome: 15200 },
  { month: 'Jun', Tokyo: 18400, NewYork: 24600, London: 21200, Dubai: 12800, Singapore: 11200, Rome: 16400 },
  { month: 'Jul', Tokyo: 20500, NewYork: 25200, London: 22800, Dubai: 11400, Singapore: 11800, Rome: 18200 },
  { month: 'Aug', Tokyo: 19800, NewYork: 24800, London: 22200, Dubai: 10800, Singapore: 11600, Rome: 17800 },
  { month: 'Sep', Tokyo: 18200, NewYork: 24100, London: 20600, Dubai: 12200, Singapore: 11000, Rome: 16200 },
  { month: 'Oct', Tokyo: 17600, NewYork: 23600, London: 19400, Dubai: 14800, Singapore: 10600, Rome: 15400 },
  { month: 'Nov', Tokyo: 16400, NewYork: 22800, London: 18200, Dubai: 16200, Singapore: 10200, Rome: 14200 },
  { month: 'Dec', Tokyo: 15800, NewYork: 22200, London: 17800, Dubai: 17800, Singapore: 9800, Rome: 13800 }
];

const propertyTypeByCity = {
  'Tokyo': [
    { type: 'Apartment', current: 68, forecast: 72, growth: 5.9 },
    { type: 'Hotel Room', current: 18, forecast: 16, growth: -11.1 },
    { type: 'Villa', current: 8, forecast: 7, growth: -12.5 },
    { type: 'Shared Room', current: 6, forecast: 5, growth: -16.7 }
  ],
  'New York': [
    { type: 'Apartment', current: 52, forecast: 54, growth: 3.8 },
    { type: 'Hotel Room', current: 28, forecast: 26, growth: -7.1 },
    { type: 'Villa', current: 12, forecast: 13, growth: 8.3 },
    { type: 'Shared Room', current: 8, forecast: 7, growth: -12.5 }
  ],
  'Dubai': [
    { type: 'Villa', current: 45, forecast: 52, growth: 15.6 },
    { type: 'Apartment', current: 32, forecast: 28, growth: -12.5 },
    { type: 'Hotel Room', current: 18, forecast: 15, growth: -16.7 },
    { type: 'Shared Room', current: 5, forecast: 5, growth: 0 }
  ]
};

export function RegionalForecasts() {
  const [selectedCity, setSelectedCity] = useState('Tokyo');
  const [timeframe, setTimeframe] = useState('3m');

  const selectedCityData = regionData.find(city => city.city === selectedCity);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Regional Demand Forecasts</h2>
          <p className="text-muted-foreground">City-level predictions and market analysis</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Export Data</Button>
        </div>
      </div>

      {/* Regional Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regionData.map((region, index) => (
          <Card
            key={index}
            className={`border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer ${
              selectedCity === region.city ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCity(region.city)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{region.flag}</span>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">{region.city}</CardTitle>
                    <CardDescription className="text-xs">{region.country}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    region.confidence > 90 ? 'bg-success/10 text-success border-success/20' :
                    region.confidence > 85 ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                  }`}
                >
                  {region.confidence}% confident
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Bookings</p>
                  <p className="font-semibold text-foreground">{region.forecast.bookings.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+{region.growth.bookings}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold text-foreground">${(region.forecast.revenue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+{region.growth.revenue}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Occupancy</p>
                  <p className="font-semibold text-foreground">{region.forecast.occupancy}%</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+{region.growth.occupancy}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Price</p>
                  <p className="font-semibold text-foreground">${region.forecast.avgPrice}</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">+{region.growth.price}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border/20">
                <p className="text-xs text-muted-foreground">{region.seasonality}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Monthly Demand Trends</CardTitle>
            <CardDescription>Booking volumes across all major markets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Tokyo" stroke="#ff5a5f" strokeWidth={2} />
                <Line type="monotone" dataKey="NewYork" stroke="#00a699" strokeWidth={2} />
                <Line type="monotone" dataKey="London" stroke="#484848" strokeWidth={2} />
                <Line type="monotone" dataKey="Dubai" stroke="#ffb400" strokeWidth={2} />
                <Line type="monotone" dataKey="Singapore" stroke="#767676" strokeWidth={2} />
                <Line type="monotone" dataKey="Rome" stroke="#c13515" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Selected City Details */}
        {selectedCityData && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">{selectedCityData.flag}</span>
                {selectedCityData.city} Details
              </CardTitle>
              <CardDescription>Detailed forecast breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Bookings</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{selectedCityData.forecast.bookings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">vs {selectedCityData.current.bookings.toLocaleString()} current</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium text-foreground">Revenue</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">${(selectedCityData.forecast.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">vs ${(selectedCityData.current.revenue / 1000000).toFixed(1)}M current</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-foreground">Occupancy</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{selectedCityData.forecast.occupancy}%</p>
                    <p className="text-xs text-muted-foreground">vs {selectedCityData.current.occupancy}% current</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/20">
                <h4 className="font-medium text-foreground mb-2">Market Insights</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Confidence Level: {selectedCityData.confidence}%</p>
                  <p>• Seasonality: {selectedCityData.seasonality}</p>
                  <p>• Price Trend: +{selectedCityData.growth.price}% increase expected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Property Type Breakdown */}
      {selectedCity && propertyTypeByCity[selectedCity as keyof typeof propertyTypeByCity] && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Property Type Forecast - {selectedCity}
            </CardTitle>
            <CardDescription>Demand distribution by property type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {propertyTypeByCity[selectedCity as keyof typeof propertyTypeByCity].map((type, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {type.type === 'Apartment' && <Building className="h-6 w-6 text-primary" />}
                    {type.type === 'Villa' && <Home className="h-6 w-6 text-secondary" />}
                    {type.type === 'Hotel Room' && <Hotel className="h-6 w-6 text-warning" />}
                    {type.type === 'Shared Room' && <UserCheck className="h-6 w-6 text-accent" />}
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{type.type}</h3>
                  <p className="text-lg font-bold text-foreground">{type.forecast}%</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {type.growth > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">+{type.growth}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">{type.growth}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}