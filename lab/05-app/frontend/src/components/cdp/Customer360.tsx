import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock customer data extracted from figma codebase
const mockCustomers = [
  {
    id: 'USR_001',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1-555-0123',
    location: 'San Francisco, CA',
    joinDate: '2023-03-15',
    lastActivity: '2024-09-17',
    segment: 'High Value',
    clv: 4250,
    totalBookings: 12,
    churnRisk: 0.15,
    satisfaction: 4.8,
    demographics: {
      age: 32,
      occupation: 'Product Manager',
      income: 'High',
      travelFrequency: 'Business'
    },
    behavioral: {
      avgSessionDuration: '8m 32s',
      pageViewsPerSession: 12,
      conversionRate: 24,
      preferredDevices: ['Desktop', 'Mobile']
    },
    bookingHistory: [
      { month: 'Jan', bookings: 2, revenue: 1200 },
      { month: 'Feb', bookings: 1, revenue: 450 },
      { month: 'Mar', bookings: 3, revenue: 1800 },
      { month: 'Apr', bookings: 2, revenue: 950 },
      { month: 'May', bookings: 1, revenue: 650 },
      { month: 'Jun', bookings: 3, revenue: 2100 }
    ],
    preferences: {
      destinations: ['Tokyo', 'New York', 'London'],
      propertyTypes: ['Hotel', 'Apartment'],
      amenities: ['Wi-Fi', 'Gym', 'Pool'],
      priceRange: '$150-$300/night'
    }
  },
  {
    id: 'USR_002',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@gmail.com',
    phone: '+1-555-0456',
    location: 'Austin, TX',
    joinDate: '2022-11-08',
    lastActivity: '2024-09-17',
    segment: 'At Risk',
    clv: 890,
    totalBookings: 3,
    churnRisk: 0.78,
    satisfaction: 3.2,
    demographics: {
      age: 28,
      occupation: 'Software Engineer',
      income: 'Medium',
      travelFrequency: 'Leisure'
    },
    behavioral: {
      avgSessionDuration: '3m 18s',
      pageViewsPerSession: 6,
      conversionRate: 8,
      preferredDevices: ['Mobile']
    },
    bookingHistory: [
      { month: 'Jan', bookings: 0, revenue: 0 },
      { month: 'Feb', bookings: 1, revenue: 180 },
      { month: 'Mar', bookings: 0, revenue: 0 },
      { month: 'Apr', bookings: 1, revenue: 220 },
      { month: 'May', bookings: 0, revenue: 0 },
      { month: 'Jun', bookings: 1, revenue: 165 }
    ],
    preferences: {
      destinations: ['Dubai', 'Singapore'],
      propertyTypes: ['Budget Hotel'],
      amenities: ['Wi-Fi', 'Breakfast'],
      priceRange: '$50-$150/night'
    }
  }
];

export function Customer360() {
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'High Value': return 'bg-green-50 text-green-700 border-green-200';
      case 'At Risk': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Regular': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-600';
    if (risk < 0.6) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Customer Search & List */}
      <Card className="lg:col-span-1 border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Customer Search</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedCustomer.id === customer.id
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-red-100 to-teal-100 text-gray-700">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${getSegmentColor(customer.segment)}`}>
                    {customer.segment}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Customer Profile Details */}
      <div className="lg:col-span-3 space-y-6">
        {/* Profile Header */}
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-red-100 to-teal-100 text-lg text-gray-700">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {selectedCustomer.location}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(selectedCustomer.joinDate).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`${getSegmentColor(selectedCustomer.segment)}`}>
                {selectedCustomer.segment}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-gray-200 bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">CLV</p>
                  <p className="text-xl font-bold text-gray-900">${selectedCustomer.clv.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCustomer.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCustomer.satisfaction}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Churn Risk</p>
                  <p className={`text-xl font-bold ${getRiskColor(selectedCustomer.churnRisk)}`}>
                    {(selectedCustomer.churnRisk * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age</span>
                    <span className="font-medium">{selectedCustomer.demographics.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupation</span>
                    <span className="font-medium">{selectedCustomer.demographics.occupation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Income Level</span>
                    <span className="font-medium">{selectedCustomer.demographics.income}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel Type</span>
                    <span className="font-medium">{selectedCustomer.demographics.travelFrequency}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Last activity: {new Date(selectedCustomer.lastActivity).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Session Duration</span>
                    <span className="font-medium">{selectedCustomer.behavioral.avgSessionDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages per Session</span>
                    <span className="font-medium">{selectedCustomer.behavioral.pageViewsPerSession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium">{selectedCustomer.behavioral.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Devices</span>
                    <span className="font-medium">{selectedCustomer.behavioral.preferredDevices.join(', ')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Booking Confirmation</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Property Search</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-gray-50">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Email Campaign Opened</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Booking History</CardTitle>
                <CardDescription>Monthly booking activity and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedCustomer.bookingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="bookings" fill="#ff5a5f" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Travel Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Favorite Destinations</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.preferences.destinations.map((dest, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Property Types</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.preferences.propertyTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Preferred Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.preferences.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Price Range</p>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {selectedCustomer.preferences.priceRange}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm font-medium text-gray-900">High-Value Retention</p>
                      <p className="text-xs text-gray-600 mt-1">Send personalized luxury property recommendations</p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                      <p className="text-sm font-medium text-gray-900">Loyalty Program</p>
                      <p className="text-xs text-gray-600 mt-1">Invite to VIP tier based on booking frequency</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-sm font-medium text-gray-900">Travel Insurance Upsell</p>
                      <p className="text-xs text-gray-600 mt-1">Business traveler profile suggests insurance interest</p>
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