import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  Target,
  RefreshCw,
  Download,
  Zap,
  MapPin
} from 'lucide-react';
import { ForecastingOverview } from './forecasting/ForecastingOverview';
import { SeasonalityAnalysis } from './forecasting/SeasonalityAnalysis';
import { AnomalyDetection } from './forecasting/AnomalyDetection';
import { ScenarioPlanning } from './forecasting/ScenarioPlanning';
import { AccuracyMetrics } from './forecasting/AccuracyMetrics';
import { RegionalForecasts } from './forecasting/RegionalForecasts';

export function DemandForecastingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/10 pt-16">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-4">
            {/* Title and Description Row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  Demand Forecasting System
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base break-words leading-relaxed">
                  Predictive analytics for revenue optimization and operational planning
                </p>
              </div>
            </div>

            {/* Badges and Actions Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  🔵 UI Demo (No Backend)
                </Badge>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  MAPE: 8.4%
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh Models</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-6 w-full min-w-max bg-muted/50 p-1 h-auto gap-1">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="regional"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Regional</span>
              </TabsTrigger>
              <TabsTrigger
                value="seasonality"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Seasonality</span>
              </TabsTrigger>
              <TabsTrigger
                value="anomalies"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Anomalies</span>
              </TabsTrigger>
              <TabsTrigger
                value="scenarios"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Scenarios</span>
              </TabsTrigger>
              <TabsTrigger
                value="accuracy"
                className="flex items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Accuracy</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <ForecastingOverview />
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <RegionalForecasts />
          </TabsContent>

          <TabsContent value="seasonality" className="space-y-6">
            <SeasonalityAnalysis />
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <AnomalyDetection />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <ScenarioPlanning />
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-6">
            <AccuracyMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}