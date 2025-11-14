import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Target,
  Users,
  Plus,
  Save,
  Play,
  BarChart3,
  Mail,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock segmentation data extracted from figma codebase
const predefinedSegments = [
  {
    id: 'high_value',
    name: 'High-Value Customers',
    description: 'Customers with CLV > $2,500',
    size: 28543,
    criteria: [
      { field: 'clv', operator: '>', value: '2500' },
      { field: 'total_bookings', operator: '>=', value: '5' }
    ],
    color: '#ff5a5f',
    growth: '+12.3%',
    conversionRate: 34.2,
    activeCampaigns: 3
  },
  {
    id: 'at_risk',
    name: 'At-Risk Customers',
    description: 'High churn probability customers',
    size: 15678,
    criteria: [
      { field: 'churn_score', operator: '>', value: '0.7' },
      { field: 'days_since_last_booking', operator: '>', value: '90' }
    ],
    color: '#ffb400',
    growth: '+8.7%',
    conversionRate: 18.5,
    activeCampaigns: 2
  },
  {
    id: 'repeat_travelers',
    name: 'Repeat Travelers',
    description: 'Customers with 3+ bookings',
    size: 45621,
    criteria: [
      { field: 'total_bookings', operator: '>=', value: '3' },
      { field: 'booking_frequency', operator: '>', value: '0.5' }
    ],
    color: '#00a699',
    growth: '+15.6%',
    conversionRate: 28.9,
    activeCampaigns: 4
  },
  {
    id: 'price_sensitive',
    name: 'Price-Sensitive',
    description: 'Customers who abandon at high prices',
    size: 32145,
    criteria: [
      { field: 'avg_booking_value', operator: '<', value: '200' },
      { field: 'abandoned_high_price', operator: '=', value: 'true' }
    ],
    color: '#484848',
    growth: '+5.4%',
    conversionRate: 12.8,
    activeCampaigns: 1
  },
  {
    id: 'business_travelers',
    name: 'Business Travelers',
    description: 'Weekday bookers with corporate patterns',
    size: 19876,
    criteria: [
      { field: 'booking_pattern', operator: '=', value: 'weekday' },
      { field: 'stay_duration', operator: '<=', value: '3' }
    ],
    color: '#7b68ee',
    growth: '+22.1%',
    conversionRate: 31.7,
    activeCampaigns: 2
  }
];

const segmentPerformanceData = predefinedSegments.map(segment => ({
  name: segment.name.split(' ')[0],
  size: segment.size,
  conversion: segment.conversionRate,
  revenue: Math.floor(segment.size * segment.conversionRate * 0.75)
}));

const fieldOptions = [
  { value: 'clv', label: 'Customer Lifetime Value' },
  { value: 'total_bookings', label: 'Total Bookings' },
  { value: 'churn_score', label: 'Churn Risk Score' },
  { value: 'avg_booking_value', label: 'Average Booking Value' },
  { value: 'days_since_last_booking', label: 'Days Since Last Booking' },
  { value: 'satisfaction_score', label: 'Satisfaction Score' },
  { value: 'booking_frequency', label: 'Booking Frequency' },
  { value: 'age', label: 'Customer Age' },
  { value: 'location', label: 'Customer Location' }
];

const operatorOptions = [
  { value: '>', label: 'Greater than' },
  { value: '>=', label: 'Greater than or equal' },
  { value: '<', label: 'Less than' },
  { value: '<=', label: 'Less than or equal' },
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not equals' }
];

export function SegmentationEngine() {
  const [activeTab, setActiveTab] = useState('existing');
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDescription, setNewSegmentDescription] = useState('');
  const [segmentCriteria, setSegmentCriteria] = useState([
    { field: '', operator: '', value: '' }
  ]);

  const addCriteria = () => {
    setSegmentCriteria([...segmentCriteria, { field: '', operator: '', value: '' }]);
  };

  const updateCriteria = (index: number, field: string, value: string) => {
    const updated = [...segmentCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setSegmentCriteria(updated);
  };

  const removeCriteria = (index: number) => {
    setSegmentCriteria(segmentCriteria.filter((_, i) => i !== index));
  };

  const totalCustomers = 141863;
  const avgConversion = 25.2;
  const totalActiveCampaigns = 12;

  // Calculate percentages for pie chart labels
  const totalSize = predefinedSegments.reduce((sum, seg) => sum + seg.size, 0);
  const pieChartData = predefinedSegments.map(segment => ({
    ...segment,
    percentage: Math.round((segment.size / totalSize) * 100)
  }));

  const renderPieLabel = (entry: any) => {
    return `${entry.name.split(' ')[0]} ${entry.percentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Segments</p>
                <p className="text-xl font-bold text-gray-900">{predefinedSegments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                <p className="text-xl font-bold text-gray-900">{avgConversion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-xl font-bold text-gray-900">{totalActiveCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100">
          <TabsTrigger value="existing">Existing Segments</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-6">
          {/* Existing Segments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predefinedSegments.map((segment) => (
              <Card key={segment.id} className="border-gray-200 bg-white hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{segment.name}</CardTitle>
                      <CardDescription className="mt-1">{segment.description}</CardDescription>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="text-lg font-bold text-gray-900">{segment.size.toLocaleString()}</p>
                      <p className="text-xs text-green-600">{segment.growth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-lg font-bold text-gray-900">{segment.conversionRate}%</p>
                    </div>
                  </div>

                  {/* Criteria Preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Criteria</p>
                    <div className="space-y-1">
                      {segment.criteria.slice(0, 2).map((criteria, index) => (
                        <div key={index} className="text-xs text-gray-700 bg-gray-50 rounded px-2 py-1">
                          {criteria.field.replace('_', ' ')} {criteria.operator} {criteria.value}
                        </div>
                      ))}
                      {segment.criteria.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{segment.criteria.length - 2} more criteria
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 gap-1 bg-red-600 hover:bg-red-700 text-white">
                      <Play className="h-3 w-3" />
                      Create Campaign
                    </Button>
                  </div>

                  {/* Active Campaigns Badge */}
                  {segment.activeCampaigns > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 w-fit">
                      {segment.activeCampaigns} active campaign{segment.activeCampaigns > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Create New Segment</CardTitle>
              <CardDescription>Define criteria to create a targeted customer segment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Segment Name</label>
                  <Input
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    placeholder="e.g., Weekend Warriors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                  <Input
                    value={newSegmentDescription}
                    onChange={(e) => setNewSegmentDescription(e.target.value)}
                    placeholder="e.g., Customers who book weekend stays"
                  />
                </div>
              </div>

              {/* Criteria Builder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Segment Criteria</h3>
                  <Button size="sm" variant="outline" onClick={addCriteria} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Criteria
                  </Button>
                </div>

                <div className="space-y-3">
                  {segmentCriteria.map((criteria, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        <label className="text-xs text-gray-500 mb-1 block">Field</label>
                        <Select
                          value={criteria.field}
                          onValueChange={(value) => updateCriteria(index, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 mb-1 block">Operator</label>
                        <Select
                          value={criteria.operator}
                          onValueChange={(value) => updateCriteria(index, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operatorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 mb-1 block">Value</label>
                        <Input
                          value={criteria.value}
                          onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>

                      <div className="col-span-2">
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCriteria(index)}
                            className="w-full"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview & Actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimated Size</p>
                    <p className="text-xs text-gray-500">Based on current criteria</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">~42,350</p>
                    <p className="text-xs text-gray-500">customers</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="gap-1">
                    <Eye className="h-4 w-4" />
                    Preview Results
                  </Button>
                  <Button className="gap-1 bg-red-600 hover:bg-red-700 text-white">
                    <Save className="h-4 w-4" />
                    Save Segment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segment Performance Chart */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Segment Performance</CardTitle>
                <CardDescription>Size vs conversion rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="size" fill="#ff5a5f" name="Size" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Segment Distribution */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Customer Distribution</CardTitle>
                <CardDescription>Percentage breakdown by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="size"
                      label={renderPieLabel}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Segment Trends */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Growth Trends</CardTitle>
              <CardDescription>Month-over-month segment growth rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {predefinedSegments.map((segment, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: segment.color }}
                    />
                    <p className="text-sm font-medium text-gray-900">{segment.name.split(' ')[0]}</p>
                    <p className="text-lg font-bold text-gray-900">{segment.growth}</p>
                    <p className="text-xs text-gray-500">growth</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}