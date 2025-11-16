import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import {
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Brain,
  Settings,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock accuracy data
const accuracyTrends = [
  { month: 'Jan', mape: 9.2, rmse: 234, mae: 189, r2: 0.94 },
  { month: 'Feb', mape: 8.8, rmse: 221, mae: 176, r2: 0.95 },
  { month: 'Mar', mape: 7.9, rmse: 198, mae: 158, r2: 0.96 },
  { month: 'Apr', mape: 8.4, rmse: 215, mae: 171, r2: 0.95 },
  { month: 'May', mape: 7.6, rmse: 187, mae: 149, r2: 0.97 },
  { month: 'Jun', mape: 8.4, rmse: 203, mae: 162, r2: 0.96 }
];

const cityAccuracy = [
  { city: 'Tokyo', flag: '🇯🇵', mape: 7.2, rmse: 167, confidence: 96.8, trend: 'improving', forecasts: 1847 },
  { city: 'New York', flag: '🇺🇸', mape: 8.9, rmse: 234, confidence: 94.1, trend: 'stable', forecasts: 2156 },
  { city: 'London', flag: '🇬🇧', mape: 9.4, rmse: 278, confidence: 91.7, trend: 'declining', forecasts: 1923 },
  { city: 'Dubai', flag: '🇦🇪', mape: 6.8, rmse: 145, confidence: 97.3, trend: 'improving', forecasts: 1534 },
  { city: 'Singapore', flag: '🇸🇬', mape: 8.1, rmse: 189, confidence: 95.2, trend: 'stable', forecasts: 1298 },
  { city: 'Rome', flag: '🇮🇹', mape: 10.2, rmse: 312, confidence: 89.4, trend: 'improving', forecasts: 1687 }
];

const modelPerformance = [
  {
    model: 'Prophet (Primary)',
    accuracy: 91.6,
    mape: 8.4,
    trainTime: '14 min',
    lastTrained: '2024-06-20',
    status: 'Active',
    confidence: 94.2,
    predictions: 156789
  },
  {
    model: 'ARIMA (Backup)',
    accuracy: 87.3,
    mape: 12.7,
    trainTime: '8 min',
    lastTrained: '2024-06-19',
    status: 'Standby',
    confidence: 89.1,
    predictions: 145632
  },
  {
    model: 'Linear Regression',
    accuracy: 82.1,
    mape: 17.9,
    trainTime: '3 min',
    lastTrained: '2024-06-18',
    status: 'Benchmark',
    confidence: 85.4,
    predictions: 134567
  },
  {
    model: 'XGBoost (Experimental)',
    accuracy: 93.8,
    mape: 6.2,
    trainTime: '45 min',
    lastTrained: '2024-06-15',
    status: 'Testing',
    confidence: 96.7,
    predictions: 89234
  }
];

const forecastHorizons = [
  { horizon: '1 Day', mape: 4.2, rmse: 98, samples: 8934, accuracy: 95.8 },
  { horizon: '7 Days', mape: 6.8, rmse: 154, samples: 7821, accuracy: 93.2 },
  { horizon: '30 Days', mape: 8.4, rmse: 203, samples: 6745, accuracy: 91.6 },
  { horizon: '90 Days', mape: 12.1, rmse: 298, samples: 5234, accuracy: 87.9 },
  { horizon: '180 Days', mape: 16.7, rmse: 412, samples: 3456, accuracy: 83.3 },
  { horizon: '365 Days', mape: 22.4, rmse: 578, samples: 1892, accuracy: 77.6 }
];

const seasonalAccuracy = [
  { season: 'Spring', mape: 7.8, rmse: 189, bias: -2.1, variance: 234 },
  { season: 'Summer', mape: 6.4, rmse: 156, bias: 1.8, variance: 198 },
  { season: 'Autumn', mape: 8.9, rmse: 234, bias: -3.4, variance: 287 },
  { season: 'Winter', mape: 10.2, rmse: 278, bias: 4.2, variance: 324 }
];

const businessMetrics = [
  {
    metric: 'Revenue Forecast Accuracy',
    current: 89.7,
    target: 92.0,
    trend: 'improving',
    impact: 'High',
    description: 'Accuracy of revenue predictions vs actual'
  },
  {
    metric: 'Occupancy Prediction',
    current: 91.4,
    target: 93.0,
    trend: 'stable',
    impact: 'High',
    description: 'How well we predict occupancy rates'
  },
  {
    metric: 'Price Optimization Hit Rate',
    current: 76.8,
    target: 80.0,
    trend: 'improving',
    impact: 'Medium',
    description: 'Success rate of price recommendations'
  },
  {
    metric: 'Demand Spike Detection',
    current: 84.2,
    target: 88.0,
    trend: 'improving',
    impact: 'Medium',
    description: 'Ability to predict sudden demand increases'
  }
];

export function AccuracyMetrics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Model Accuracy & Performance</h2>
          <p className="text-muted-foreground">Comprehensive analysis of forecasting model performance and reliability</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retrain Models
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Model Config
          </Button>
        </div>
      </div>

      {/* Key Accuracy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MAPE (Target &lt; 10%)</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">8.4%</div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">-0.8%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
            <Progress value={84} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Confidence</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">94.2%</div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">+1.4%</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
            <Progress value={94.2} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">R² Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">0.96</div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">+0.02</span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
            <Progress value={96} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Predictions Made</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">156.8K</div>
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-1">this month</span>
            </div>
            <Progress value={78} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trends */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Accuracy Trends Over Time</CardTitle>
            <CardDescription>MAPE and R² score evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" domain={[0, 15]} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" domain={[0.9, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="mape" stroke="var(--primary)" strokeWidth={2} name="MAPE %" />
                <Line yAxisId="right" type="monotone" dataKey="r2" stroke="var(--secondary)" strokeWidth={2} name="R² Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Forecast Horizon Analysis */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Forecast Horizon Performance</CardTitle>
            <CardDescription>Accuracy degradation over time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastHorizons}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="horizon" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="accuracy" fill="var(--warning)" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* City-by-City Performance */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Regional Model Performance</CardTitle>
          <CardDescription>Accuracy breakdown by major markets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityAccuracy.map((city, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{city.flag}</span>
                    <h3 className="font-semibold text-foreground">{city.city}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      city.trend === 'improving' ? 'bg-success/10 text-success border-success/20' :
                      city.trend === 'declining' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                    }
                  >
                    {city.trend}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAPE</span>
                    <span className="font-medium text-foreground">{city.mape}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RMSE</span>
                    <span className="font-medium text-foreground">{city.rmse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-foreground">{city.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forecasts</span>
                    <span className="font-medium text-foreground">{city.forecasts.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress value={city.confidence} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Comparison */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Model Comparison</CardTitle>
            <CardDescription>Performance across different algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelPerformance.map((model, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{model.model}</h4>
                      <Badge
                        variant="outline"
                        className={
                          model.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
                          model.status === 'Testing' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                        }
                      >
                        {model.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold text-foreground">{model.accuracy}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">MAPE</p>
                      <p className="font-medium text-foreground">{model.mape}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Train Time</p>
                      <p className="font-medium text-foreground">{model.trainTime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Predictions</p>
                      <p className="font-medium text-foreground">{model.predictions.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Impact Metrics */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Business Impact Metrics</CardTitle>
            <CardDescription>How accuracy translates to business value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessMetrics.map((metric, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{metric.metric}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          metric.trend === 'improving' ? 'bg-success/10 text-success border-success/20' :
                          metric.trend === 'declining' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                        }
                      >
                        {metric.trend}
                      </Badge>
                      <span className="text-sm font-bold text-foreground">{metric.current}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Target: {metric.target}%</span>
                    <Badge
                      variant="outline"
                      className={
                        metric.impact === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        metric.impact === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-success/10 text-success border-success/20'
                      }
                    >
                      {metric.impact} Impact
                    </Badge>
                  </div>

                  <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Performance */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Seasonal Performance Analysis</CardTitle>
          <CardDescription>Model accuracy varies by season - identify patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="season" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="mape" fill="var(--primary)" name="MAPE %" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {seasonalAccuracy.map((season, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-muted/20">
                <h4 className="font-medium text-foreground">{season.season}</h4>
                <p className="text-lg font-bold text-primary">{season.mape}%</p>
                <p className="text-xs text-muted-foreground">MAPE</p>
                <div className="mt-2 text-xs">
                  <p className="text-muted-foreground">Bias: {season.bias > 0 ? '+' : ''}{season.bias}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}