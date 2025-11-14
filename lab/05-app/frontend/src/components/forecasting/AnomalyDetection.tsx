import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertTriangle,
  Activity,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock anomaly data
const anomalyData = [
  { date: '2024-01-15', expected: 285, actual: 428, anomaly: true, severity: 'high', type: 'spike' },
  { date: '2024-01-16', expected: 290, actual: 445, anomaly: true, severity: 'high', type: 'spike' },
  { date: '2024-01-17', expected: 295, actual: 302, anomaly: false, severity: 'none', type: 'normal' },
  { date: '2024-02-08', expected: 315, actual: 189, anomaly: true, severity: 'medium', type: 'drop' },
  { date: '2024-02-09', expected: 320, actual: 195, anomaly: true, severity: 'medium', type: 'drop' },
  { date: '2024-03-12', expected: 380, actual: 620, anomaly: true, severity: 'critical', type: 'spike' },
  { date: '2024-03-13', expected: 385, actual: 598, anomaly: true, severity: 'critical', type: 'spike' },
  { date: '2024-04-20', expected: 420, actual: 245, anomaly: true, severity: 'high', type: 'drop' },
  { date: '2024-05-15', expected: 450, actual: 720, anomaly: true, severity: 'critical', type: 'spike' },
  { date: '2024-06-22', expected: 480, actual: 295, anomaly: true, severity: 'medium', type: 'drop' }
];

const detectedAnomalies = [
  {
    id: 'ANO-001',
    date: '2024-06-22',
    city: 'Tokyo',
    flag: '🇯🇵',
    type: 'Sudden Drop',
    severity: 'Critical',
    impact: -38.5,
    expectedValue: 15420,
    actualValue: 9485,
    cause: 'Earthquake warning - mass cancellations',
    status: 'Investigating',
    duration: '2 days',
    confidence: 96.8,
    actionTaken: 'Emergency response team activated'
  },
  {
    id: 'ANO-002',
    date: '2024-06-18',
    city: 'New York',
    flag: '🇺🇸',
    type: 'Unexpected Spike',
    severity: 'High',
    impact: +156.2,
    expectedValue: 22340,
    actualValue: 57250,
    cause: 'Taylor Swift surprise concert announcement',
    status: 'Resolved',
    duration: '4 days',
    confidence: 94.2,
    actionTaken: 'Dynamic pricing activated'
  },
  {
    id: 'ANO-003',
    date: '2024-06-15',
    city: 'London',
    flag: '🇬🇧',
    type: 'Gradual Decline',
    severity: 'Medium',
    impact: -22.1,
    expectedValue: 18750,
    actualValue: 14610,
    cause: 'Transport strikes affecting tourism',
    status: 'Monitoring',
    duration: '7 days',
    confidence: 87.5,
    actionTaken: 'Host support outreach initiated'
  },
  {
    id: 'ANO-004',
    date: '2024-06-10',
    city: 'Dubai',
    flag: '🇦🇪',
    type: 'Price Anomaly',
    severity: 'High',
    impact: +89.4,
    expectedValue: 220,
    actualValue: 417,
    cause: 'Formula 1 weekend - supply shortage',
    status: 'Expected',
    duration: '3 days',
    confidence: 98.1,
    actionTaken: 'Revenue optimization deployed'
  },
  {
    id: 'ANO-005',
    date: '2024-06-05',
    city: 'Singapore',
    flag: '🇸🇬',
    type: 'Booking Pattern',
    severity: 'Low',
    impact: +15.8,
    expectedValue: 9840,
    actualValue: 11395,
    cause: 'Business conference overlap',
    status: 'Resolved',
    duration: '2 days',
    confidence: 82.3,
    actionTaken: 'Capacity planning adjusted'
  }
];

const alertRules = [
  {
    rule: 'Demand Spike Detection',
    threshold: '+50% above forecast',
    frequency: 'Real-time',
    status: 'Active',
    triggered: 12,
    description: 'Detects sudden increases in booking demand'
  },
  {
    rule: 'Demand Drop Alert',
    threshold: '-30% below forecast',
    frequency: 'Hourly',
    status: 'Active',
    triggered: 8,
    description: 'Identifies unexpected drops in demand'
  },
  {
    rule: 'Price Anomaly Monitor',
    threshold: '±75% from expected',
    frequency: 'Real-time',
    status: 'Active',
    triggered: 15,
    description: 'Monitors unusual pricing patterns'
  },
  {
    rule: 'Cancellation Surge',
    threshold: '3x normal rate',
    frequency: 'Real-time',
    status: 'Active',
    triggered: 4,
    description: 'Detects mass cancellation events'
  },
  {
    rule: 'Booking Pattern Shift',
    threshold: '±40% from pattern',
    frequency: 'Daily',
    status: 'Paused',
    triggered: 22,
    description: 'Identifies changes in booking behavior'
  }
];

const impactAnalysis = [
  { metric: 'Revenue Impact', current: -2400000, projected: -1800000, recovery: '2 weeks' },
  { metric: 'Occupancy Impact', current: -15.2, projected: -8.4, recovery: '10 days' },
  { metric: 'Host Confidence', current: -12.8, projected: -5.2, recovery: '3 weeks' },
  { metric: 'Guest Satisfaction', current: -8.9, projected: -2.1, recovery: '1 week' }
];

export function AnomalyDetection() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filteredAnomalies = detectedAnomalies.filter(anomaly =>
    selectedSeverity === 'all' || anomaly.severity.toLowerCase() === selectedSeverity
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Anomaly Detection & Monitoring</h2>
          <p className="text-muted-foreground">Real-time detection of unusual demand patterns and market disruptions</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Configure Alerts</Button>
        </div>
      </div>

      {/* Current Alert Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>2 Critical Anomalies</strong> detected in the last 24 hours requiring immediate attention.
          </AlertDescription>
        </Alert>

        <Alert className="border-warning/20 bg-warning/5">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            <strong>5 High Severity</strong> patterns being monitored across all markets.
          </AlertDescription>
        </Alert>

        <Alert className="border-success/20 bg-success/5">
          <AlertCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            <strong>Model Accuracy:</strong> 94.2% anomaly detection rate with 3.1% false positives.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomaly Timeline */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Anomaly Detection Timeline</CardTitle>
            <CardDescription>Expected vs actual demand with anomaly highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={anomalyData}>
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
                <Area
                  type="monotone"
                  dataKey="expected"
                  stackId="1"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.3}
                  name="Expected Demand"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stackId="2"
                  stroke="var(--warning)"
                  fill="var(--warning)"
                  fillOpacity={0.4}
                  name="Actual Demand"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detection Stats */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Detection Statistics</CardTitle>
            <CardDescription>Model performance and alert metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Anomalies Detected</span>
                <span className="text-lg font-bold text-destructive">27</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">False Positives</span>
                <span className="text-lg font-bold text-warning">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Accuracy Rate</span>
                <span className="text-lg font-bold text-success">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Response Time</span>
                <span className="text-lg font-bold text-primary">8.4 min</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/20 space-y-3">
              <h4 className="font-medium text-foreground">Severity Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Critical</span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">4</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">8</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medium</span>
                  <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted-foreground/20">12</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Low</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">3</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detected Anomalies List */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Anomalies</CardTitle>
          <CardDescription>Detailed view of detected anomalies and their analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAnomalies.map((anomaly, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{anomaly.flag}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{anomaly.type}</h3>
                        <Badge
                          variant="outline"
                          className={
                            anomaly.severity === 'Critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            anomaly.severity === 'High' ? 'bg-warning/10 text-warning border-warning/20' :
                            anomaly.severity === 'Medium' ? 'bg-muted/20 text-muted-foreground border-muted-foreground/20' :
                            'bg-success/10 text-success border-success/20'
                          }
                        >
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {anomaly.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{anomaly.city} • {anomaly.date} • {anomaly.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {anomaly.impact > 0 ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-success" />
                          <span className="font-bold text-success">+{anomaly.impact}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-4 w-4 text-destructive" />
                          <span className="font-bold text-destructive">{anomaly.impact}%</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Impact</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Value</p>
                    <p className="font-semibold text-foreground">{anomaly.expectedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Value</p>
                    <p className="font-semibold text-foreground">{anomaly.actualValue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <span className="text-sm font-medium text-foreground">Likely Cause: </span>
                    <span className="text-sm text-muted-foreground">{anomaly.cause}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Action Taken: </span>
                    <span className="text-sm text-muted-foreground">{anomaly.actionTaken}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      anomaly.status === 'Resolved' ? 'bg-success/10 text-success border-success/20' :
                      anomaly.status === 'Investigating' ? 'bg-warning/10 text-warning border-warning/20' :
                      anomaly.status === 'Expected' ? 'bg-primary/10 text-primary border-primary/20' :
                      'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                    }
                  >
                    {anomaly.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Activity className="h-3 w-3" />
                      View Impact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Rules Configuration */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Alert Rules</CardTitle>
            <CardDescription>Configure anomaly detection thresholds and monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{rule.rule}</h4>
                      <Badge
                        variant="outline"
                        className={
                          rule.status === 'Active'
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                        }
                      >
                        {rule.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Threshold: {rule.threshold}</span>
                      <span>Frequency: {rule.frequency}</span>
                      <span>Triggered: {rule.triggered}x</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Analysis */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Business Impact Analysis</CardTitle>
            <CardDescription>Current and projected impact of detected anomalies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {impactAnalysis.map((impact, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{impact.metric}</h4>
                    <span className="text-xs text-muted-foreground">Recovery: {impact.recovery}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Impact</p>
                      <p className={`font-bold ${impact.current < 0 ? 'text-destructive' : 'text-success'}`}>
                        {impact.current < 0 ? '' : '+'}{impact.current}
                        {impact.metric.includes('Revenue') ? '' : impact.metric.includes('Impact') ? '%' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projected Impact</p>
                      <p className={`font-bold ${impact.projected < 0 ? 'text-warning' : 'text-success'}`}>
                        {impact.projected < 0 ? '' : '+'}{impact.projected}
                        {impact.metric.includes('Revenue') ? '' : impact.metric.includes('Impact') ? '%' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}