import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Zap,
  Mail,
  Smartphone,
  Target,
  Play,
  Pause,
  Settings,
  Eye,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  Send,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

const activeCampaigns = [
  {
    id: 'CAM_001',
    name: 'Welcome Series - New Customers',
    type: 'Email',
    status: 'active',
    segment: 'New Customers',
    audienceSize: 12847,
    startDate: '2024-09-15',
    endDate: '2024-10-15',
    sent: 8934,
    opened: 3567,
    clicked: 892,
    converted: 127,
    revenue: 38450,
    openRate: 39.9,
    clickRate: 10.0,
    conversionRate: 1.4
  },
  {
    id: 'CAM_002',
    name: 'Win-Back Campaign - At Risk',
    type: 'Email + SMS',
    status: 'active',
    segment: 'At Risk Customers',
    audienceSize: 23456,
    startDate: '2024-09-10',
    endDate: '2024-09-30',
    sent: 23456,
    opened: 9382,
    clicked: 1877,
    converted: 234,
    revenue: 78900,
    openRate: 40.0,
    clickRate: 8.0,
    conversionRate: 1.0
  },
  {
    id: 'CAM_003',
    name: 'Summer Vacation Deals',
    type: 'Push + Email',
    status: 'paused',
    segment: 'High Value Customers',
    audienceSize: 8932,
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    sent: 8932,
    opened: 5359,
    clicked: 1250,
    converted: 398,
    revenue: 156700,
    openRate: 60.0,
    clickRate: 14.0,
    conversionRate: 4.5
  },
  {
    id: 'CAM_004',
    name: 'Business Travel Promotion',
    type: 'Email',
    status: 'scheduled',
    segment: 'Business Travelers',
    audienceSize: 19876,
    startDate: '2024-09-25',
    endDate: '2024-10-25',
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0
  }
];

const audienceExports = [
  {
    id: 'EXP_001',
    name: 'High Value Customers Q3',
    destination: 'Google Ads',
    size: 28543,
    status: 'synced',
    lastSync: '2024-09-18 10:30',
    nextSync: '2024-09-18 22:30'
  },
  {
    id: 'EXP_002',
    name: 'Churned Customers Lookalike',
    destination: 'Facebook Ads',
    size: 45621,
    status: 'syncing',
    lastSync: '2024-09-18 09:15',
    nextSync: '2024-09-18 21:15'
  },
  {
    id: 'EXP_003',
    name: 'Repeat Travelers Email List',
    destination: 'Mailchimp',
    size: 67234,
    status: 'synced',
    lastSync: '2024-09-18 08:45',
    nextSync: '2024-09-18 20:45'
  },
  {
    id: 'EXP_004',
    name: 'At Risk Customers SMS',
    destination: 'Twilio',
    size: 15678,
    status: 'error',
    lastSync: '2024-09-17 14:22',
    nextSync: 'Manual retry required'
  }
];

const channelPerformance = [
  { channel: 'Email', campaigns: 15, avgOpenRate: 42.3, avgClickRate: 8.7, revenue: 234567 },
  { channel: 'SMS', campaigns: 8, avgOpenRate: 98.2, avgClickRate: 15.4, revenue: 123456 },
  { channel: 'Push', campaigns: 12, avgOpenRate: 87.1, avgClickRate: 12.3, revenue: 89012 },
  { channel: 'In-App', campaigns: 6, avgOpenRate: 76.8, avgClickRate: 18.9, revenue: 67890 }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'synced': return 'bg-green-100 text-green-800 border-green-200';
    case 'syncing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return Play;
    case 'paused': return Pause;
    case 'scheduled': return Clock;
    case 'synced': return CheckCircle2;
    case 'syncing': return Clock;
    case 'error': return AlertTriangle;
    default: return Clock;
  }
};

export function Activation() {
  const [selectedCampaign, setSelectedCampaign] = useState(activeCampaigns[0]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');

  return (
    <div className="space-y-6">
      {/* Activation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-xl font-bold text-gray-900">
                  {activeCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(activeCampaigns.reduce((sum, c) => sum + c.audienceSize, 0) / 1000)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {(activeCampaigns.reduce((sum, c) => sum + c.openRate, 0) / activeCampaigns.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
                <p className="text-xl font-bold text-gray-900">
                  ${Math.round(activeCampaigns.reduce((sum, c) => sum + c.revenue, 0) / 1000)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-gray-100">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="audiences">Audience Export</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Campaign List */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Active Campaigns</CardTitle>
                  <CardDescription>Manage and monitor your marketing campaigns</CardDescription>
                </div>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => {
                  const StatusIcon = getStatusIcon(campaign.status);
                  return (
                    <div
                      key={campaign.id}
                      className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                        selectedCampaign.id === campaign.id ? 'border-red-300 bg-red-50' : ''
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {campaign.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {campaign.segment}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(campaign.status)} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Audience</p>
                          <p className="font-medium text-gray-900">{campaign.audienceSize.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sent</p>
                          <p className="font-medium text-gray-900">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Open Rate</p>
                          <p className="font-medium text-gray-900">{campaign.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Click Rate</p>
                          <p className="font-medium text-gray-900">{campaign.clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conversions</p>
                          <p className="font-medium text-gray-900">{campaign.converted}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="font-medium text-gray-900">${campaign.revenue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Settings className="h-3 w-3" />
                          Edit
                        </Button>
                        {campaign.status === 'active' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Pause className="h-3 w-3" />
                            Pause
                          </Button>
                        ) : campaign.status === 'paused' ? (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Resume
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Create New Campaign</CardTitle>
              <CardDescription>Set up a targeted marketing campaign for your selected audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Campaign Name</label>
                  <Input
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="e.g., Spring Break Special"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Channel</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="multi">Multi-channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Campaign Description</label>
                <Textarea
                  value={newCampaignDescription}
                  onChange={(e) => setNewCampaignDescription(e.target.value)}
                  placeholder="Describe your campaign objectives and messaging"
                  rows={3}
                />
              </div>

              {/* Audience Selection */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Target Audience</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_value">High-Value Customers (28,543)</SelectItem>
                    <SelectItem value="at_risk">At-Risk Customers (15,678)</SelectItem>
                    <SelectItem value="repeat">Repeat Travelers (45,621)</SelectItem>
                    <SelectItem value="new">New Customers (67,234)</SelectItem>
                    <SelectItem value="business">Business Travelers (19,876)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campaign Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Start Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">End Date</label>
                  <Input type="date" />
                </div>
              </div>

              {/* Preview & Actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimated Reach</p>
                    <p className="text-xs text-gray-500">Based on selected audience</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">28,543</p>
                    <p className="text-xs text-gray-500">customers</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="gap-1">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button className="gap-1 bg-red-600 hover:bg-red-700 text-white">
                    <Send className="h-4 w-4" />
                    Launch Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Audience Exports</CardTitle>
                  <CardDescription>Sync customer segments to external platforms</CardDescription>
                </div>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4" />
                  New Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {audienceExports.map((export_) => {
                  const StatusIcon = getStatusIcon(export_.status);
                  return (
                    <div key={export_.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{export_.name}</h3>
                          <p className="text-sm text-gray-600">{export_.destination}</p>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(export_.status)} gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {export_.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Audience Size</p>
                          <p className="font-medium text-gray-900">{export_.size.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Sync</p>
                          <p className="font-medium text-gray-900">{export_.lastSync}</p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Next sync: {export_.nextSync}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1 flex-1">
                          <Copy className="h-3 w-3" />
                          Sync Now
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 flex-1">
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Channel Performance</CardTitle>
              <CardDescription>Compare performance across different marketing channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Channel</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Campaigns</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Avg Open Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Avg Click Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelPerformance.map((channel, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {channel.channel === 'Email' && <Mail className="h-4 w-4 text-red-600" />}
                            {channel.channel === 'SMS' && <Smartphone className="h-4 w-4 text-purple-600" />}
                            {channel.channel === 'Push' && <Zap className="h-4 w-4 text-yellow-600" />}
                            {channel.channel === 'In-App' && <Target className="h-4 w-4 text-green-600" />}
                            <span className="font-medium text-gray-900">{channel.channel}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 text-gray-900">{channel.campaigns}</td>
                        <td className="text-right py-3 text-gray-900">{channel.avgOpenRate}%</td>
                        <td className="text-right py-3 text-gray-900">{channel.avgClickRate}%</td>
                        <td className="text-right py-3 text-gray-900">${channel.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Campaign ROI */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Campaign ROI Analysis</CardTitle>
              <CardDescription>Return on investment for recent campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-gray-600">Total Investment</p>
                  <p className="text-2xl font-bold text-gray-900">$45,678</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-gray-600">Revenue Generated</p>
                  <p className="text-2xl font-bold text-gray-900">$274K</p>
                  <p className="text-xs text-gray-500">From campaigns</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-gray-900">413%</p>
                  <p className="text-xs text-green-600">+23% vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}