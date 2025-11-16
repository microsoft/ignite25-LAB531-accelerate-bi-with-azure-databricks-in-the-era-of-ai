import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Users,
  Database,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';
import { CustomerOverview } from './cdp/CustomerOverview';
import { Customer360 } from './cdp/Customer360';
import { SegmentationEngine } from './cdp/SegmentationEngine';
import { Analytics } from './cdp/Analytics';
import { DataSources } from './cdp/DataSources';
import { Activation } from './cdp/Activation';

export function CustomerDataPlatform() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-50/20 pt-16">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Data Platform</h1>
              <p className="text-gray-600 text-lg">
                Unified customer insights, segmentation, and activation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                🔵 UI Demo (No Backend)
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full bg-gray-100 p-1 h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="customer360"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Customer 360
            </TabsTrigger>
            <TabsTrigger
              value="segmentation"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Target className="h-4 w-4" />
              Segmentation
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Database className="h-4 w-4" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="activation"
              className="flex items-center gap-2 py-3 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4" />
              Activation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CustomerOverview />
          </TabsContent>

          <TabsContent value="customer360" className="space-y-6">
            <Customer360 />
          </TabsContent>

          <TabsContent value="segmentation" className="space-y-6">
            <SegmentationEngine />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataSources />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics />
          </TabsContent>

          <TabsContent value="activation" className="space-y-6">
            <Activation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}