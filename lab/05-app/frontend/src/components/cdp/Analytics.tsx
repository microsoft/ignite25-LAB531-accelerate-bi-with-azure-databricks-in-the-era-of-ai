import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DollarSign,
  TrendingUp,
  UserX,
  Target,
  Download,
  AlertTriangle,
  Mail,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock analytics data
const kpiMetrics = {
  acquisitionCost: {
    value: 89.50,
    change: '+5.2%',
    period: 'vs last period',
    trend: 'up'
  },
  lifetimeValue: {
    value: 2847,
    change: '+12.8%',
    period: 'vs last period',
    trend: 'up'
  },
  churnRate: {
    value: 4.2,
    change: '-0.3%',
    period: 'vs last period',
    trend: 'down'
  },
  npsScore: {
    value: 72,
    change: '+3 points',
    period: 'vs last period',
    trend: 'up'
  }
};

const lifecycleTrendsData = [
  { month: 'Jan', acquired: 32000, retained: 28500, churned: 1800, reactivated: 950 },
  { month: 'Feb', acquired: 34200, retained: 29800, churned: 1650, reactivated: 1120 },
  { month: 'Mar', acquired: 36500, retained: 31200, churned: 1900, reactivated: 1350 },
  { month: 'Apr', acquired: 38900, retained: 32800, churned: 1750, reactivated: 1450 },
  { month: 'May', acquired: 41200, retained: 34500, churned: 1600, reactivated: 1680 },
  { month: 'Jun', acquired: 43800, retained: 36200, churned: 1550, reactivated: 1850 }
];

const conversionFunnelData = [
  { name: 'Website Visitors', value: 2843392, percentage: 100.0, color: '#ff5a5f' },
  { name: 'Inquiry Made', value: 643392, percentage: 22.6, color: '#ff5a5f' },
  { name: 'Search Results', value: 234487, percentage: 8.2, color: '#ff5a5f' },
  { name: 'Property Detail Views', value: 156789, percentage: 5.5, color: '#ff5a5f' },
  { name: 'Booking Started', value: 92354, percentage: 3.2, color: '#ff5a5f' },
  { name: 'Booking Completed', value: 84456, percentage: 2.9, color: '#ff5a5f' }
];

// Value Analysis Data
const customerValueData = [
  { segment: 'Platinum', count: 2847, avgClv: 4250, totalRevenue: 12106975 },
  { segment: 'Gold', count: 8932, avgClv: 2180, totalRevenue: 19471760 },
  { segment: 'Silver', count: 23451, avgClv: 950, totalRevenue: 22278450 },
  { segment: 'Bronze', count: 45672, avgClv: 420, totalRevenue: 19182240 },
  { segment: 'New', count: 67234, avgClv: 180, totalRevenue: 12102120 }
];

// Retention Analysis Data
const retentionCohortData = [
  { cohort: 'Jan 2024', month0: 100, month1: 68, month2: 45, month3: 32, month4: 24, month5: 19 },
  { cohort: 'Feb 2024', month0: 100, month1: 72, month2: 48, month3: 35, month4: 27, month5: 21 },
  { cohort: 'Mar 2024', month0: 100, month1: 75, month2: 52, month3: 38, month4: 29, month5: 23 },
  { cohort: 'Apr 2024', month0: 100, month1: 78, month2: 55, month3: 41, month4: 32, month5: null },
  { cohort: 'May 2024', month0: 100, month1: 81, month2: 58, month3: 44, month4: null, month5: null },
  { cohort: 'Jun 2024', month0: 100, month1: 84, month2: 61, month3: null, month4: null, month5: null }
];

// Predictions Data
const churnPredictionData = [
  { riskLevel: 'Very High', count: 12847, probability: '85-100%', color: '#dc2626' },
  { riskLevel: 'High', count: 23456, probability: '70-85%', color: '#ea580c' },
  { riskLevel: 'Medium', count: 45678, probability: '50-70%', color: '#d97706' },
  { riskLevel: 'Low', count: 89234, probability: '25-50%', color: '#65a30d' },
  { riskLevel: 'Very Low', count: 156789, probability: '0-25%', color: '#059669' }
];

export function Analytics() {
  const [activeTab, setActiveTab] = useState('lifecycle');
  const [timePeriod, setTimePeriod] = useState('6months');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600 mt-1">Advanced insights and predictive analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Acquisition Cost</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-gray-900">${kpiMetrics.acquisitionCost.value}</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {kpiMetrics.acquisitionCost.change}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpiMetrics.acquisitionCost.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Lifetime Value</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-gray-900">${kpiMetrics.lifetimeValue.value.toLocaleString()}</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {kpiMetrics.lifetimeValue.change}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpiMetrics.lifetimeValue.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Churn Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-gray-900">{kpiMetrics.churnRate.value}%</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {kpiMetrics.churnRate.change}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpiMetrics.churnRate.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Net Promoter Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-gray-900">{kpiMetrics.npsScore.value}</p>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    {kpiMetrics.npsScore.change}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{kpiMetrics.npsScore.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-gray-100">
          <TabsTrigger value="lifecycle">Customer Lifecycle</TabsTrigger>
          <TabsTrigger value="value">Value Analysis</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Lifecycle Trends */}
            <Card className="border-gray-200 bg-white lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Customer Lifecycle Trends</CardTitle>
                <CardDescription>New acquisitions, retention, churn, and reactivation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={lifecycleTrendsData}>
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
                    <Line
                      type="monotone"
                      dataKey="acquired"
                      stroke="#00a699"
                      strokeWidth={2}
                      name="New Customers"
                    />
                    <Line
                      type="monotone"
                      dataKey="retained"
                      stroke="#ff5a5f"
                      strokeWidth={2}
                      name="Retained"
                    />
                    <Line
                      type="monotone"
                      dataKey="churned"
                      stroke="#484848"
                      strokeWidth={2}
                      name="Churned"
                    />
                    <Line
                      type="monotone"
                      dataKey="reactivated"
                      stroke="#ffb400"
                      strokeWidth={2}
                      name="Reactivated"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Conversion Funnel</CardTitle>
                <CardDescription>Customer journey from visitor to booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Funnel Visualization */}
                  <div className="relative h-64 flex justify-center items-center mb-6">
                    <svg width="280" height="200" viewBox="0 0 280 200" className="overflow-visible">
                      <defs>
                        <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ff5a5f" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>

                      {/* Create funnel shape */}
                      <path
                        d="M 20 20 L 260 20 L 200 80 L 80 80 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />
                      <path
                        d="M 80 80 L 200 80 L 180 120 L 100 120 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />
                      <path
                        d="M 100 120 L 180 120 L 170 150 L 110 150 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />
                      <path
                        d="M 110 150 L 170 150 L 165 170 L 115 170 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />
                      <path
                        d="M 115 170 L 165 170 L 162 185 L 118 185 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />
                      <path
                        d="M 118 185 L 162 185 L 160 195 L 120 195 Z"
                        fill="url(#funnelGradient)"
                        stroke="none"
                      />

                      {/* Add percentage labels */}
                      <text x="140" y="35" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                        100.0%
                      </text>
                      <text x="140" y="95" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                        22.6%
                      </text>
                      <text x="140" y="135" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">
                        8.2%
                      </text>
                      <text x="140" y="162" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
                        5.5%
                      </text>
                      <text x="140" y="178" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                        3.2%
                      </text>
                      <text x="140" y="190" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
                        2.9%
                      </text>
                    </svg>
                  </div>

                  {/* Funnel Data Table */}
                  <div className="space-y-2">
                    {conversionFunnelData.map((stage, index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">{stage.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{stage.value.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 ml-2">{stage.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Value Distribution */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Customer Value Segments</CardTitle>
                <CardDescription>Distribution by customer lifetime value</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerValueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="segment" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#ff5a5f" name="Customer Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Segment Pie Chart */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Revenue by Segment</CardTitle>
                <CardDescription>Total revenue contribution by customer tier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerValueData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="totalRevenue"
                      label={(entry: any) => `${entry.segment} ${(entry.percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {customerValueData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Value Analysis Table */}
            <Card className="lg:col-span-2 border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Detailed Value Analysis</CardTitle>
                <CardDescription>Customer count, average CLV, and total revenue by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Segment</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600">Customers</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600">Avg CLV</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600">Total Revenue</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerValueData.map((segment, index) => {
                        const totalRevenue = customerValueData.reduce((sum, s) => sum + s.totalRevenue, 0);
                        const percentage = ((segment.totalRevenue / totalRevenue) * 100).toFixed(1);
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                                />
                                <span className="font-medium text-gray-900">{segment.segment}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 text-gray-900">{segment.count.toLocaleString()}</td>
                            <td className="text-right py-3 text-gray-900">${segment.avgClv.toLocaleString()}</td>
                            <td className="text-right py-3 text-gray-900">${segment.totalRevenue.toLocaleString()}</td>
                            <td className="text-right py-3 text-gray-900">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          {/* Retention Cohort Analysis */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Cohort Retention Analysis</CardTitle>
              <CardDescription>Customer retention rates by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Cohort</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 0</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 1</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 2</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 3</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 4</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Month 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionCohortData.map((cohort, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">{cohort.cohort}</td>
                        <td className="text-center py-2">
                          <div className="inline-block px-2 py-1 rounded bg-red-600 text-white text-xs font-medium">
                            {cohort.month0}%
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(255, 90, 95, ${cohort.month1 / 100})`,
                              color: cohort.month1 > 50 ? 'white' : 'black'
                            }}
                          >
                            {cohort.month1}%
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div
                            className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(255, 90, 95, ${cohort.month2 / 100})`,
                              color: cohort.month2 > 50 ? 'white' : 'black'
                            }}
                          >
                            {cohort.month2}%
                          </div>
                        </td>
                        <td className="text-center py-2">
                          {cohort.month3 && (
                            <div
                              className="inline-block px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `rgba(255, 90, 95, ${cohort.month3 / 100})`,
                                color: cohort.month3 > 50 ? 'white' : 'black'
                              }}
                            >
                              {cohort.month3}%
                            </div>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month4 && (
                            <div
                              className="inline-block px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `rgba(255, 90, 95, ${cohort.month4 / 100})`,
                                color: cohort.month4 > 50 ? 'white' : 'black'
                              }}
                            >
                              {cohort.month4}%
                            </div>
                          )}
                        </td>
                        <td className="text-center py-2">
                          {cohort.month5 && (
                            <div
                              className="inline-block px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `rgba(255, 90, 95, ${cohort.month5 / 100})`,
                                color: cohort.month5 > 50 ? 'white' : 'black'
                              }}
                            >
                              {cohort.month5}%
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Color intensity represents retention rate - darker colors indicate higher retention
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Churn Risk Distribution */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Churn Risk Distribution</CardTitle>
                <CardDescription>Customers segmented by predicted churn probability</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={churnPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="riskLevel" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count">
                      {churnPredictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* High-Risk Customer Actions */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">High-Risk Customer Actions</CardTitle>
                <CardDescription>Recommended interventions for at-risk customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-gray-900">Very High Risk</span>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      12,847 customers
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Immediate intervention required - predicted churn within 30 days
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700 text-white">
                      <Mail className="h-3 w-3" />
                      Send Retention Campaign
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                      <DollarSign className="h-3 w-3" />
                      Offer Discount
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900">High Risk</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                      23,456 customers
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Early warning signs detected - proactive engagement recommended
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                      <Mail className="h-3 w-3" />
                      Personalized Offers
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-3 w-3" />
                      Customer Survey
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
                  <strong>ML Model Performance:</strong> 87% accuracy, last updated 2 hours ago
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}