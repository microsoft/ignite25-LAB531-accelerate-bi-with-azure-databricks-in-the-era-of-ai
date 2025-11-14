import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data extracted from figma codebase
const customerGrowthData = [
  { month: 'Jan', new: 1245, returning: 3421, total: 4666 },
  { month: 'Feb', new: 1389, returning: 3654, total: 5043 },
  { month: 'Mar', new: 1567, returning: 3891, total: 5458 },
  { month: 'Apr', new: 1423, returning: 4123, total: 5546 },
  { month: 'May', new: 1689, returning: 4456, total: 6145 },
  { month: 'Jun', new: 1834, returning: 4789, total: 6623 }
];

const segmentData = [
  { name: 'High Value', value: 23, color: '#ff5a5f' },
  { name: 'Regular', value: 45, color: '#00a699' },
  { name: 'At Risk', value: 18, color: '#ffb400' },
  { name: 'New', value: 14, color: '#484848' }
];

const metricsData = [
  {
    title: 'Total Customers',
    value: '847,392',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
    description: '90-day active users'
  },
  {
    title: 'Customer Lifetime Value',
    value: '$2,847',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'Average CLV'
  },
  {
    title: 'Retention Rate',
    value: '78.4%',
    change: '+5.1%',
    changeType: 'positive' as const,
    icon: Calendar,
    description: '12-month retention'
  },
  {
    title: 'Churn Risk',
    value: '12.8%',
    change: '-2.3%',
    changeType: 'positive' as const,
    icon: AlertTriangle,
    description: 'High-risk customers'
  }
];

export function CustomerOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="border-gray-200 bg-white hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="flex items-center gap-1">
                  {metric.changeType === 'positive' ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {metric.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Growth Trend */}
        <Card className="lg:col-span-2 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Customer Growth Trend</CardTitle>
            <CardDescription>New vs returning customers over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerGrowthData}>
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
                <Legend />
                <Bar dataKey="new" stackId="a" fill="#ff5a5f" name="New Customers" />
                <Bar dataKey="returning" stackId="a" fill="#00a699" name="Returning Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Customer Segments</CardTitle>
            <CardDescription>Distribution by customer value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={false}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {segmentData.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm text-gray-700">{segment.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{segment.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality & Health */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Data Health & Quality</CardTitle>
          <CardDescription>Current status of data ingestion and quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Identity Resolution</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  94.2%
                </Badge>
              </div>
              <Progress value={94.2} className="h-2" />
              <p className="text-xs text-gray-500">847K profiles unified from 1.2M records</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Data Completeness</span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  87.6%
                </Badge>
              </div>
              <Progress value={87.6} className="h-2" />
              <p className="text-xs text-gray-500">Critical fields populated across profiles</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Real-time Sync</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  99.1%
                </Badge>
              </div>
              <Progress value={99.1} className="h-2" />
              <p className="text-xs text-gray-500">Events processed with &lt;5min latency</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}