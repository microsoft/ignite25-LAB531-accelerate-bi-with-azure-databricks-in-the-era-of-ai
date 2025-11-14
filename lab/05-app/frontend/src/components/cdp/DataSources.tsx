import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight,
  HardDrive,
  Cloud,
  Globe,
  Smartphone
} from 'lucide-react';

const dataSources = [
  {
    id: 'bookings',
    name: 'Bookings Database',
    type: 'Primary',
    status: 'connected',
    lastSync: '2 minutes ago',
    recordCount: 1247891,
    syncFrequency: 'Real-time',
    healthScore: 98,
    description: 'Core booking transactions and reservations',
    icon: Database,
    tables: ['bookings', 'booking_items', 'cancellations']
  },
  {
    id: 'users',
    name: 'User Profiles',
    type: 'Primary',
    status: 'connected',
    lastSync: '1 minute ago',
    recordCount: 847392,
    syncFrequency: 'Real-time',
    healthScore: 96,
    description: 'Customer demographics and account data',
    icon: Database,
    tables: ['users', 'user_preferences', 'user_sessions']
  },
  {
    id: 'payments',
    name: 'Payment System',
    type: 'Transactional',
    status: 'connected',
    lastSync: '3 minutes ago',
    recordCount: 1156743,
    syncFrequency: 'Real-time',
    healthScore: 94,
    description: 'Payment transactions, refunds, and disputes',
    icon: HardDrive,
    tables: ['payments', 'refunds', 'payment_methods']
  },
  {
    id: 'properties',
    name: 'Property Catalog',
    type: 'Master Data',
    status: 'connected',
    lastSync: '15 minutes ago',
    recordCount: 156234,
    syncFrequency: 'Hourly',
    healthScore: 99,
    description: 'Property details, amenities, and availability',
    icon: Database,
    tables: ['properties', 'amenities', 'property_images']
  },
  {
    id: 'reviews',
    name: 'Reviews & Ratings',
    type: 'Behavioral',
    status: 'connected',
    lastSync: '5 minutes ago',
    recordCount: 892456,
    syncFrequency: 'Real-time',
    healthScore: 91,
    description: 'Customer reviews, ratings, and feedback',
    icon: Database,
    tables: ['reviews', 'ratings', 'review_responses']
  },
  {
    id: 'clickstream',
    name: 'Website Analytics',
    type: 'Behavioral',
    status: 'connected',
    lastSync: '30 seconds ago',
    recordCount: 45678912,
    syncFrequency: 'Streaming',
    healthScore: 87,
    description: 'Page views, clicks, and user interactions',
    icon: Globe,
    tables: ['page_views', 'clickstream', 'session_events']
  },
  {
    id: 'mobile_events',
    name: 'Mobile App Events',
    type: 'Behavioral',
    status: 'connected',
    lastSync: '45 seconds ago',
    recordCount: 23456789,
    syncFrequency: 'Streaming',
    healthScore: 89,
    description: 'Mobile app usage and interaction events',
    icon: Smartphone,
    tables: ['app_events', 'push_notifications', 'app_sessions']
  },
  {
    id: 'support',
    name: 'Customer Support',
    type: 'Engagement',
    status: 'warning',
    lastSync: '2 hours ago',
    recordCount: 234567,
    syncFrequency: 'Daily',
    healthScore: 76,
    description: 'Support tickets, chats, and resolutions',
    icon: Database,
    tables: ['support_tickets', 'chat_logs', 'support_agents']
  },
  {
    id: 'email_campaigns',
    name: 'Email Marketing',
    type: 'Marketing',
    status: 'connected',
    lastSync: '10 minutes ago',
    recordCount: 567890,
    syncFrequency: 'Hourly',
    healthScore: 93,
    description: 'Email campaigns, opens, clicks, and unsubscribes',
    icon: Cloud,
    tables: ['email_campaigns', 'email_events', 'subscriber_lists']
  }
];

const integrationPipeline = [
  {
    stage: 'Data Ingestion',
    description: 'Extract data from source systems',
    status: 'active',
    throughput: '15.2M records/hour',
    latency: '< 2 minutes'
  },
  {
    stage: 'Data Validation',
    description: 'Quality checks and schema validation',
    status: 'active',
    throughput: '14.8M records/hour',
    latency: '< 1 minute'
  },
  {
    stage: 'Identity Resolution',
    description: 'Merge and deduplicate customer records',
    status: 'active',
    throughput: '12.1M records/hour',
    latency: '< 3 minutes'
  },
  {
    stage: 'Data Enrichment',
    description: 'Add computed fields and predictions',
    status: 'active',
    throughput: '11.9M records/hour',
    latency: '< 2 minutes'
  },
  {
    stage: 'Data Loading',
    description: 'Store in customer data platform',
    status: 'active',
    throughput: '11.7M records/hour',
    latency: '< 1 minute'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected': return CheckCircle2;
    case 'warning': return AlertTriangle;
    case 'error': return AlertTriangle;
    default: return Clock;
  }
};

const getHealthColor = (score: number) => {
  if (score >= 95) return 'text-green-600';
  if (score >= 85) return 'text-yellow-600';
  return 'text-red-600';
};

export function DataSources() {
  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Data Sources</p>
                <p className="text-xl font-bold text-gray-900">{dataSources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Records Synced</p>
                <p className="text-xl font-bold text-gray-900">
                  {(dataSources.reduce((sum, source) => sum + source.recordCount, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                <p className="text-xl font-bold text-gray-900">2.3min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round(dataSources.reduce((sum, source) => sum + source.healthScore, 0) / dataSources.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Data Sources</CardTitle>
              <CardDescription>Connected systems and their integration status</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dataSources.map((source) => {
              const IconComponent = source.icon;
              const StatusIcon = getStatusIcon(source.status);

              return (
                <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(source.status)} gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {source.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{source.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Records</p>
                      <p className="font-medium text-gray-900">{source.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sync Frequency</p>
                      <p className="font-medium text-gray-900">{source.syncFrequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Sync</p>
                      <p className="font-medium text-gray-900">{source.lastSync}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Health Score</p>
                      <p className={`font-medium ${getHealthColor(source.healthScore)}`}>
                        {source.healthScore}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Tables: {source.tables.join(', ')}
                      </p>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Pipeline */}
      <Card className="border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Data Processing Pipeline</CardTitle>
          <CardDescription>Real-time data transformation and loading stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrationPipeline.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stage.stage}</h3>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{stage.throughput}</p>
                      <p className="text-xs text-gray-500">Throughput</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{stage.latency}</p>
                      <p className="text-xs text-gray-500">Latency</p>
                    </div>

                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1">
                        <Activity className="h-3 w-3" />
                        {stage.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {index < integrationPipeline.length - 1 && (
                  <div className="ml-4 mt-2 mb-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Data Quality Metrics</CardTitle>
            <CardDescription>Overall health and completeness of integrated data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Identity Resolution Rate</span>
                <span className="text-sm font-bold text-gray-900">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">847K unified profiles from 1.2M records</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Data Completeness</span>
                <span className="text-sm font-bold text-gray-900">87.6%</span>
              </div>
              <Progress value={87.6} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Critical fields populated across profiles</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Data Freshness</span>
                <span className="text-sm font-bold text-gray-900">98.1%</span>
              </div>
              <Progress value={98.1} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Data updated within SLA thresholds</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">Schema Compliance</span>
                <span className="text-sm font-bold text-gray-900">99.7%</span>
              </div>
              <Progress value={99.7} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Records passing validation checks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Integration Alerts</CardTitle>
            <CardDescription>Recent issues and system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Support Data Delayed</p>
                  <p className="text-xs text-gray-600">Customer support data sync is 2 hours behind</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Mobile Events Pipeline Restored</p>
                  <p className="text-xs text-gray-600">Real-time mobile event processing back online</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <Activity className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New Data Source Added</p>
                  <p className="text-xs text-gray-600">SMS marketing platform integrated successfully</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" className="w-full">
                View All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}