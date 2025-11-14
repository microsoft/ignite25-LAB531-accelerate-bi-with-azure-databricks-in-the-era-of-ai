import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import {
  DollarSign,
  Users,
  Building,
  ArrowUp,
  ArrowDown,
  Play,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Base scenario data
const baseScenario = {
  avgPrice: 195,
  marketingSpend: 2500000,
  supplyIncrease: 0,
  seasonalAdjustment: 0,
  competitorPricing: 0,
  demandProjection: 147250,
  revenueProjection: 28713750,
  occupancyRate: 84.2,
  customerSatisfaction: 4.2
};

// Predefined scenarios
const predefinedScenarios = [
  {
    id: 'summer_peak',
    name: 'Summer Peak Strategy',
    description: 'Optimize for high summer demand',
    parameters: {
      avgPrice: 230,
      marketingSpend: 1800000,
      supplyIncrease: 15,
      seasonalAdjustment: 25
    },
    results: {
      demandProjection: 189200,
      revenueProjection: 43516000,
      occupancyRate: 91.4,
      roi: 156.8
    },
    status: 'recommended'
  },
  {
    id: 'budget_conscious',
    name: 'Budget-Conscious Expansion',
    description: 'Cost-effective growth strategy',
    parameters: {
      avgPrice: 175,
      marketingSpend: 1200000,
      supplyIncrease: 8,
      seasonalAdjustment: -5
    },
    results: {
      demandProjection: 162400,
      revenueProjection: 28420000,
      occupancyRate: 78.6,
      roi: 118.4
    },
    status: 'conservative'
  },
  {
    id: 'aggressive_growth',
    name: 'Aggressive Market Capture',
    description: 'High investment, high return',
    parameters: {
      avgPrice: 210,
      marketingSpend: 4200000,
      supplyIncrease: 25,
      seasonalAdjustment: 15
    },
    results: {
      demandProjection: 234500,
      revenueProjection: 49245000,
      occupancyRate: 88.9,
      roi: 189.7
    },
    status: 'aggressive'
  },
  {
    id: 'economic_downturn',
    name: 'Economic Downturn Response',
    description: 'Defensive strategy for tough times',
    parameters: {
      avgPrice: 165,
      marketingSpend: 1500000,
      supplyIncrease: -5,
      seasonalAdjustment: -15
    },
    results: {
      demandProjection: 118900,
      revenueProjection: 19618500,
      occupancyRate: 72.3,
      roi: 94.2
    },
    status: 'defensive'
  }
];

// Mock data for scenario comparison
const scenarioComparisonData = [
  { month: 'Jul', baseline: 147, summer_peak: 189, budget: 162, aggressive: 235, downturn: 119 },
  { month: 'Aug', baseline: 152, summer_peak: 198, budget: 168, aggressive: 248, downturn: 123 },
  { month: 'Sep', baseline: 139, summer_peak: 156, budget: 151, aggressive: 201, downturn: 112 },
  { month: 'Oct', baseline: 134, summer_peak: 145, budget: 146, aggressive: 187, downturn: 108 },
  { month: 'Nov', baseline: 128, summer_peak: 138, budget: 139, aggressive: 174, downturn: 103 },
  { month: 'Dec', baseline: 145, summer_peak: 168, budget: 159, aggressive: 202, downturn: 117 }
];

const impactFactors = [
  {
    factor: 'Price Elasticity',
    baseValue: -1.2,
    description: '1% price increase = 1.2% demand decrease',
    sensitivity: 'High',
    weight: 0.35
  },
  {
    factor: 'Marketing ROI',
    baseValue: 3.8,
    description: '$1 marketing = $3.80 revenue',
    sensitivity: 'Medium',
    weight: 0.25
  },
  {
    factor: 'Supply-Demand Balance',
    baseValue: 0.8,
    description: 'Current supply utilization rate',
    sensitivity: 'Medium',
    weight: 0.20
  },
  {
    factor: 'Seasonal Variance',
    baseValue: 1.15,
    description: 'Summer demand multiplier',
    sensitivity: 'High',
    weight: 0.20
  }
];


export function ScenarioPlanning() {
  const [selectedScenario, setSelectedScenario] = useState('custom');
  const [customParameters, setCustomParameters] = useState({
    avgPrice: [195],
    marketingSpend: [2500000],
    supplyIncrease: [0],
    seasonalAdjustment: [0],
    competitorPricing: [0]
  });

  const [results, setResults] = useState(baseScenario);

  // Calculate results based on parameters
  const calculateResults = (params: any) => {
    const priceChange = (params.avgPrice[0] - baseScenario.avgPrice) / baseScenario.avgPrice;
    const marketingChange = (params.marketingSpend[0] - baseScenario.marketingSpend) / baseScenario.marketingSpend;
    const supplyChange = params.supplyIncrease[0] / 100;
    const seasonalChange = params.seasonalAdjustment[0] / 100;

    // Simple demand calculation (this would be much more complex in reality)
    const demandImpact =
      (priceChange * -1.2) + // Price elasticity
      (marketingChange * 0.3) + // Marketing impact
      (supplyChange * 0.15) + // Supply impact
      (seasonalChange * 0.4); // Seasonal impact

    const newDemand = Math.round(baseScenario.demandProjection * (1 + demandImpact));
    const newRevenue = Math.round(newDemand * params.avgPrice[0]);
    const newOccupancy = Math.min(95, baseScenario.occupancyRate * (1 + demandImpact * 0.8));

    return {
      demandProjection: newDemand,
      revenueProjection: newRevenue,
      occupancyRate: Math.round(newOccupancy * 10) / 10,
      customerSatisfaction: Math.max(3.0, Math.min(5.0, baseScenario.customerSatisfaction + (priceChange * -0.5)))
    };
  };

  const handleParameterChange = (param: string, value: number[]) => {
    const newParams = { ...customParameters, [param]: value };
    setCustomParameters(newParams);
    setResults({ ...baseScenario, ...calculateResults(newParams) });
  };

  const loadPredefinedScenario = (scenarioId: string) => {
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const newParams = {
        avgPrice: [scenario.parameters.avgPrice],
        marketingSpend: [scenario.parameters.marketingSpend],
        supplyIncrease: [scenario.parameters.supplyIncrease],
        seasonalAdjustment: [scenario.parameters.seasonalAdjustment],
        competitorPricing: [0]
      };
      setCustomParameters(newParams);
      setResults({
        ...baseScenario,
        ...scenario.results,
        avgPrice: scenario.parameters.avgPrice,
        marketingSpend: scenario.parameters.marketingSpend
      });
    }
  };

  const resetToBaseline = () => {
    setCustomParameters({
      avgPrice: [195],
      marketingSpend: [2500000],
      supplyIncrease: [0],
      seasonalAdjustment: [0],
      competitorPricing: [0]
    });
    setResults(baseScenario);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Scenario Planning & What-If Analysis</h2>
          <p className="text-muted-foreground">Model different strategies and their impact on demand and revenue</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={resetToBaseline} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Baseline
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Scenario
          </Button>
        </div>
      </div>

      <Tabs value={selectedScenario} onValueChange={setSelectedScenario} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="predefined">Predefined Scenarios</TabsTrigger>
          <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-6">
          {/* Predefined Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedScenarios.map((scenario, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedScenario('custom');
                  loadPredefinedScenario(scenario.id);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">{scenario.name}</CardTitle>
                      <CardDescription className="mt-1">{scenario.description}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        scenario.status === 'recommended' ? 'bg-success/10 text-success border-success/20' :
                        scenario.status === 'aggressive' ? 'bg-warning/10 text-warning border-warning/20' :
                        scenario.status === 'defensive' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                      }
                    >
                      {scenario.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-lg font-bold text-primary">{scenario.results.demandProjection.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Projected Demand</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                      <p className="text-lg font-bold text-secondary">${(scenario.results.revenueProjection / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy Rate</span>
                      <span className="font-medium text-foreground">{scenario.results.occupancyRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ROI</span>
                      <span className="font-medium text-foreground">{scenario.results.roi}%</span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full gap-2">
                    <Play className="h-3 w-3" />
                    Run This Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Scenario Comparison Chart */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Scenario Comparison</CardTitle>
              <CardDescription>Demand projections across different strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scenarioComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="baseline" stroke="var(--muted-foreground)" strokeWidth={2} name="Baseline" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="summer_peak" stroke="var(--success)" strokeWidth={2} name="Summer Peak" />
                  <Line type="monotone" dataKey="budget" stroke="var(--secondary)" strokeWidth={2} name="Budget Conscious" />
                  <Line type="monotone" dataKey="aggressive" stroke="var(--warning)" strokeWidth={2} name="Aggressive Growth" />
                  <Line type="monotone" dataKey="downturn" stroke="var(--destructive)" strokeWidth={2} name="Economic Downturn" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parameter Controls */}
            <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Scenario Parameters</CardTitle>
                <CardDescription>Adjust variables to model different business scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Adjustment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Average Nightly Price</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">${customParameters.avgPrice[0]}</span>
                      <Badge
                        variant="outline"
                        className={
                          customParameters.avgPrice[0] > baseScenario.avgPrice
                            ? 'bg-success/10 text-success border-success/20'
                            : customParameters.avgPrice[0] < baseScenario.avgPrice
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                        }
                      >
                        {customParameters.avgPrice[0] > baseScenario.avgPrice ? '+' : ''}
                        {Math.round(((customParameters.avgPrice[0] - baseScenario.avgPrice) / baseScenario.avgPrice) * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={customParameters.avgPrice}
                    onValueChange={(value) => handleParameterChange('avgPrice', value)}
                    max={300}
                    min={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Marketing Spend */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Marketing Spend (Monthly)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">${(customParameters.marketingSpend[0] / 1000000).toFixed(1)}M</span>
                      <Badge
                        variant="outline"
                        className={
                          customParameters.marketingSpend[0] > baseScenario.marketingSpend
                            ? 'bg-success/10 text-success border-success/20'
                            : customParameters.marketingSpend[0] < baseScenario.marketingSpend
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-muted/20 text-muted-foreground border-muted-foreground/20'
                        }
                      >
                        {customParameters.marketingSpend[0] > baseScenario.marketingSpend ? '+' : ''}
                        {Math.round(((customParameters.marketingSpend[0] - baseScenario.marketingSpend) / baseScenario.marketingSpend) * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={customParameters.marketingSpend}
                    onValueChange={(value) => handleParameterChange('marketingSpend', value)}
                    max={5000000}
                    min={500000}
                    step={100000}
                    className="w-full"
                  />
                </div>

                {/* Supply Increase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Supply Change</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{customParameters.supplyIncrease[0] > 0 ? '+' : ''}{customParameters.supplyIncrease[0]}%</span>
                    </div>
                  </div>
                  <Slider
                    value={customParameters.supplyIncrease}
                    onValueChange={(value) => handleParameterChange('supplyIncrease', value)}
                    max={50}
                    min={-20}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Seasonal Adjustment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Seasonal Adjustment</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{customParameters.seasonalAdjustment[0] > 0 ? '+' : ''}{customParameters.seasonalAdjustment[0]}%</span>
                    </div>
                  </div>
                  <Slider
                    value={customParameters.seasonalAdjustment}
                    onValueChange={(value) => handleParameterChange('seasonalAdjustment', value)}
                    max={40}
                    min={-30}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Dashboard */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Projected Results</CardTitle>
                <CardDescription>Impact of your scenario parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-lg font-bold text-primary">{results.demandProjection.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {results.demandProjection > baseScenario.demandProjection ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">
                          +{Math.round(((results.demandProjection - baseScenario.demandProjection) / baseScenario.demandProjection) * 100)}%
                        </span>
                      </>
                    ) : results.demandProjection < baseScenario.demandProjection ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">
                          {Math.round(((results.demandProjection - baseScenario.demandProjection) / baseScenario.demandProjection) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No change</span>
                    )}
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <DollarSign className="h-5 w-5 text-secondary" />
                    <span className="text-lg font-bold text-secondary">${(results.revenueProjection / 1000000).toFixed(1)}M</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {results.revenueProjection > baseScenario.revenueProjection ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">
                          +{Math.round(((results.revenueProjection - baseScenario.revenueProjection) / baseScenario.revenueProjection) * 100)}%
                        </span>
                      </>
                    ) : results.revenueProjection < baseScenario.revenueProjection ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">
                          {Math.round(((results.revenueProjection - baseScenario.revenueProjection) / baseScenario.revenueProjection) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No change</span>
                    )}
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building className="h-5 w-5 text-warning" />
                    <span className="text-lg font-bold text-warning">{results.occupancyRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {results.occupancyRate > baseScenario.occupancyRate ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">
                          +{(results.occupancyRate - baseScenario.occupancyRate).toFixed(1)}%
                        </span>
                      </>
                    ) : results.occupancyRate < baseScenario.occupancyRate ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive">
                          {(results.occupancyRate - baseScenario.occupancyRate).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No change</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <h4 className="font-medium text-foreground mb-2">Scenario Assessment</h4>
                  <div className="space-y-2 text-xs">
                    {results.revenueProjection > baseScenario.revenueProjection * 1.1 && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Strong revenue growth projected</span>
                      </div>
                    )}
                    {results.occupancyRate > 90 && (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        <span>High occupancy - consider supply expansion</span>
                      </div>
                    )}
                    {customParameters.avgPrice[0] > baseScenario.avgPrice * 1.2 && (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        <span>High price increase may impact demand</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Factors */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Impact Factors & Sensitivity</CardTitle>
              <CardDescription>Understanding how different variables affect demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactFactors.map((factor, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{factor.factor}</h4>
                      <Badge
                        variant="outline"
                        className={
                          factor.sensitivity === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          factor.sensitivity === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-success/10 text-success border-success/20'
                        }
                      >
                        {factor.sensitivity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Base Value:</span>
                      <span className="font-medium text-foreground">{factor.baseValue}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="font-medium text-foreground">{Math.round(factor.weight * 100)}%</span>
                    </div>
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