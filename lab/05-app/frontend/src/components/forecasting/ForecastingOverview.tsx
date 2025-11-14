import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  TrendingUp,
  Users,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock forecasting data
const demandForecastData = [
  { date: '2024-01', actual: 28450, predicted: 27890, accuracy: 98.0 },
  { date: '2024-02', actual: 32150, predicted: 31680, accuracy: 98.5 },
  { date: '2024-03', actual: 45780, predicted: 46230, accuracy: 99.0 },
  { date: '2024-04', actual: 52340, predicted: 51890, accuracy: 99.1 },
  { date: '2024-05', actual: 48920, predicted: 49560, accuracy: 98.7 },
  { date: '2024-06', actual: 67230, predicted: 66890, accuracy: 99.5 },
  { date: '2024-07', actual: null, predicted: 72500 },
  { date: '2024-08', actual: null, predicted: 69800 },
  { date: '2024-09', actual: null, predicted: 58600 },
  { date: '2024-10', actual: null, predicted: 45200 },
  { date: '2024-11', actual: null, predicted: 38900 },
  { date: '2024-12', actual: null, predicted: 52300 }
];

const keyMetrics = [
  {
    title: 'Forecast Accuracy (MAPE)',
    value: '8.4%',
    change: '-0.8%',
    changeType: 'positive' as const,
    target: '< 10%',
    icon: Target,
    description: 'Mean Absolute Percentage Error'
  },
  {
    title: 'RevPAR Forecast',
    value: '$183.2',
    change: '+15.7%',
    changeType: 'positive' as const,
    target: 'Next 90 days',
    icon: DollarSign,
    description: 'Revenue per Available Rental'
  },
  {
    title: 'Occupancy Rate Forecast',
    value: '78.2%',
    change: '+5.4%',
    changeType: 'positive' as const,
    target: 'Q3 2024',
    icon: Users,
    description: 'Average across all markets'
  },
  {
    title: 'Revenue Optimization',
    value: '+$4.8M',
    change: 'vs baseline',
    changeType: 'positive' as const,
    target: 'YTD Impact',
    icon: TrendingUp,
    description: 'Dynamic pricing gains'
  }
];

const cityDemandData = [
  { city: 'Tokyo', current: 15420, predicted: 18200, growth: 18.0, flag: '🇯🇵' },
  { city: 'New York', current: 22340, predicted: 24580, growth: 10.0, flag: '🇺🇸' },
  { city: 'London', current: 18750, predicted: 19890, growth: 6.1, flag: '🇬🇧' },
  { city: 'Dubai', current: 12680, predicted: 16200, growth: 27.8, flag: '🇦🇪' },
  { city: 'Singapore', current: 9840, predicted: 11340, growth: 15.2, flag: '🇸🇬' },
  { city: 'Rome', current: 14230, predicted: 15680, growth: 10.2, flag: '🇮🇹' }
];

const propertyTypeForecast = [
  { type: 'Apartment', current: 45.2, forecast: 48.6, demand: 'High' },
  { type: 'Villa', current: 23.8, forecast: 27.3, demand: 'Very High' },
  { type: 'Shared Room', current: 18.4, forecast: 16.2, demand: 'Moderate' },
  { type: 'Hotel Room', current: 12.6, forecast: 14.9, demand: 'High' }
];

export function ForecastingOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="flex items-center gap-1 mb-2">
                  {metric.changeType === 'positive' ? (
                    <ArrowUp className="h-3 w-3 text-success" />
                  ) : metric.changeType === 'negative' ? (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <Activity className="h-3 w-3 text-warning" />
                  )}
                  <span className={`text-xs font-medium ${
                    metric.changeType === 'positive' ? 'text-success' :
                    metric.changeType === 'negative' ? 'text-destructive' : 'text-warning'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {metric.target}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Forecast Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Demand Forecast vs Actual</CardTitle>
            <CardDescription>Booking demand trends with 6-month forecast projection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={demandForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stackId="1"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.6}
                  name="Actual Bookings"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stackId="2"
                  stroke="var(--warning)"
                  fill="var(--warning)"
                  fillOpacity={0.4}
                  strokeDasharray="5 5"
                  name="Predicted Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Model Performance</CardTitle>
            <CardDescription>Real-time accuracy metrics and health status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Prophet Model</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <Progress value={92.4} className="h-2" />
              <p className="text-xs text-muted-foreground">Accuracy: 92.4% (Last 30 days)</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Data Freshness</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  2 hours ago
                </Badge>
              </div>
              <Progress value={95.2} className="h-2" />
              <p className="text-xs text-muted-foreground">Last updated from production database</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Coverage</span>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  6 Markets
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground">All major cities monitored</p>
            </div>

            <div className="mt-6 p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dubai showing 27.8% growth - consider supply expansion
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Demand Overview */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Regional Demand Forecast</CardTitle>
            <CardDescription>30-day booking predictions by city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityDemandData.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{city.flag}</span>
                    <div>
                      <p className="font-medium text-foreground">{city.city}</p>
                      <p className="text-xs text-muted-foreground">Current: {city.current.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{city.predicted.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs font-medium text-success">+{city.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Type Forecast */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Property Type Demand</CardTitle>
            <CardDescription>Occupancy rate forecasts by property type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={propertyTypeForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="current" fill="#94a3b8" name="Current %" />
                <Bar dataKey="forecast" fill="var(--warning)" name="Forecast %" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {propertyTypeForecast.map((type, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{type.type}</span>
                  <Badge
                    variant="outline"
                    className={
                      type.demand === 'Very High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      type.demand === 'High' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                    }
                  >
                    {type.demand}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}