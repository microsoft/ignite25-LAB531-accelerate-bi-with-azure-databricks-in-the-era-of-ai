import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Sun,
  Snowflake,
  Umbrella,
  Flower,
  ArrowUp,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Mock seasonality data
const seasonalPatterns = [
  { month: 'Jan', demand: 72, price: 165, occupancy: 68, events: 'New Year, Winter Sports' },
  { month: 'Feb', demand: 76, price: 170, occupancy: 71, events: 'Valentine\'s Day, Fashion Week' },
  { month: 'Mar', demand: 85, price: 180, occupancy: 78, events: 'Spring Break, Business Travel' },
  { month: 'Apr', demand: 89, price: 185, occupancy: 82, events: 'Cherry Blossom, Easter' },
  { month: 'May', demand: 92, price: 190, occupancy: 85, events: 'Golden Week, Conferences' },
  { month: 'Jun', demand: 95, price: 195, occupancy: 88, events: 'Summer Start, Weddings' },
  { month: 'Jul', demand: 100, price: 220, occupancy: 94, events: 'Summer Peak, Festivals' },
  { month: 'Aug', demand: 98, price: 215, occupancy: 91, events: 'Summer Holidays, Olympics' },
  { month: 'Sep', demand: 87, price: 185, occupancy: 80, events: 'Back to School, Business' },
  { month: 'Oct', demand: 84, price: 175, occupancy: 77, events: 'Autumn Colors, Conferences' },
  { month: 'Nov', demand: 78, price: 160, occupancy: 72, events: 'Thanksgiving, Black Friday' },
  { month: 'Dec', demand: 88, price: 200, occupancy: 82, events: 'Christmas, New Year' }
];

const weeklyPatterns = [
  { day: 'Monday', business: 85, leisure: 45, avg: 65 },
  { day: 'Tuesday', business: 88, leisure: 42, avg: 65 },
  { day: 'Wednesday', business: 92, leisure: 48, avg: 70 },
  { day: 'Thursday', business: 89, leisure: 52, avg: 70 },
  { day: 'Friday', business: 78, leisure: 85, avg: 82 },
  { day: 'Saturday', business: 45, leisure: 95, avg: 70 },
  { day: 'Sunday', business: 42, leisure: 88, avg: 65 }
];

const eventImpact = [
  {
    event: 'Summer Olympics 2024',
    city: 'Paris',
    flag: '🇫🇷',
    startDate: '2024-07-15',
    endDate: '2024-08-15',
    demandIncrease: 156,
    priceIncrease: 78,
    duration: '1 month',
    category: 'Major Sports',
    status: 'upcoming'
  },
  {
    event: 'Cherry Blossom Season',
    city: 'Tokyo',
    flag: '🇯🇵',
    startDate: '2024-03-20',
    endDate: '2024-05-10',
    demandIncrease: 89,
    priceIncrease: 45,
    duration: '7 weeks',
    category: 'Natural',
    status: 'completed'
  },
  {
    event: 'Art Basel',
    city: 'Miami',
    flag: '🇺🇸',
    startDate: '2024-12-06',
    endDate: '2024-12-08',
    demandIncrease: 134,
    priceIncrease: 92,
    duration: '3 days',
    category: 'Arts & Culture',
    status: 'upcoming'
  },
  {
    event: 'Oktoberfest',
    city: 'Munich',
    flag: '🇩🇪',
    startDate: '2024-09-21',
    endDate: '2024-10-06',
    demandIncrease: 167,
    priceIncrease: 112,
    duration: '16 days',
    category: 'Festival',
    status: 'upcoming'
  },
  {
    event: 'Fashion Week',
    city: 'Milan',
    flag: '🇮🇹',
    startDate: '2024-09-17',
    endDate: '2024-09-23',
    demandIncrease: 145,
    priceIncrease: 88,
    duration: '1 week',
    category: 'Fashion',
    status: 'upcoming'
  }
];

const holidaySeasons = [
  {
    season: 'Christmas & New Year',
    period: 'Dec 20 - Jan 5',
    icon: Snowflake,
    demandMultiplier: 1.85,
    priceMultiplier: 1.65,
    bookingWindow: '45-60 days',
    keyMarkets: ['New York', 'London', 'Rome'],
    insights: 'Family travel peak, premium pricing opportunity'
  },
  {
    season: 'Summer Peak',
    period: 'Jul 1 - Aug 31',
    icon: Sun,
    demandMultiplier: 2.12,
    priceMultiplier: 1.89,
    bookingWindow: '60-90 days',
    keyMarkets: ['Tokyo', 'Rome', 'Singapore'],
    insights: 'Highest demand period, capacity constraints likely'
  },
  {
    season: 'Spring Break',
    period: 'Mar 15 - Apr 15',
    icon: Flower,
    demandMultiplier: 1.67,
    priceMultiplier: 1.43,
    bookingWindow: '30-45 days',
    keyMarkets: ['Dubai', 'Singapore', 'Rome'],
    insights: 'Youth travel surge, shorter booking windows'
  },
  {
    season: 'Autumn Business',
    period: 'Sep 1 - Nov 30',
    icon: Umbrella,
    demandMultiplier: 1.34,
    priceMultiplier: 1.21,
    bookingWindow: '14-30 days',
    keyMarkets: ['New York', 'London', 'Tokyo'],
    insights: 'Conference season, corporate bookings dominate'
  }
];

const citySeasonality = {
  'Tokyo': [
    { season: 'Spring', score: 95, reason: 'Cherry blossoms' },
    { season: 'Summer', score: 88, reason: 'Olympics legacy' },
    { season: 'Autumn', score: 82, reason: 'Business conferences' },
    { season: 'Winter', score: 65, reason: 'Cold weather' }
  ],
  'Dubai': [
    { season: 'Winter', score: 98, reason: 'Perfect weather' },
    { season: 'Spring', score: 85, reason: 'Events season' },
    { season: 'Autumn', score: 78, reason: 'Good weather returns' },
    { season: 'Summer', score: 45, reason: 'Extreme heat' }
  ],
  'New York': [
    { season: 'Summer', score: 92, reason: 'Tourism peak' },
    { season: 'Autumn', score: 89, reason: 'Fall foliage' },
    { season: 'Spring', score: 78, reason: 'Mild weather' },
    { season: 'Winter', score: 71, reason: 'Holiday season' }
  ]
};

export function SeasonalityAnalysis() {
  const [selectedView, setSelectedView] = useState('patterns');
  const [selectedCity, setSelectedCity] = useState('Tokyo');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Seasonality & Event Analysis</h2>
          <p className="text-muted-foreground">Pattern recognition and event-driven demand forecasting</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tokyo">🇯🇵 Tokyo</SelectItem>
              <SelectItem value="New York">🇺🇸 New York</SelectItem>
              <SelectItem value="Dubai">🇦🇪 Dubai</SelectItem>
              <SelectItem value="London">🇬🇧 London</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">Add Event</Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="patterns">Seasonal Patterns</TabsTrigger>
          <TabsTrigger value="events">Event Impact</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Seasons</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Seasonality Chart */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Monthly Demand Patterns</CardTitle>
                <CardDescription>Seasonal trends across demand, pricing, and occupancy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalPatterns}>
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
                    <Line type="monotone" dataKey="demand" stroke="var(--primary)" strokeWidth={2} name="Demand Index" />
                    <Line type="monotone" dataKey="occupancy" stroke="var(--secondary)" strokeWidth={2} name="Occupancy %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* City Seasonality Radar */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Seasonal Performance - {selectedCity}
                </CardTitle>
                <CardDescription>Relative performance by season</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={citySeasonality[selectedCity as keyof typeof citySeasonality] || []}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="season" tick={{ fill: 'var(--muted-foreground)' }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <Radar
                      name="Seasonal Score"
                      dataKey="score"
                      stroke="var(--warning)"
                      fill="var(--warning)"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {(citySeasonality[selectedCity as keyof typeof citySeasonality] || []).map((season, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{season.season}</span>
                      <span className="text-muted-foreground">{season.reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Details Table */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Monthly Breakdown</CardTitle>
              <CardDescription>Detailed seasonal patterns with key events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Month</th>
                      <th className="text-center py-2 text-sm font-medium text-muted-foreground">Demand Index</th>
                      <th className="text-center py-2 text-sm font-medium text-muted-foreground">Avg Price</th>
                      <th className="text-center py-2 text-sm font-medium text-muted-foreground">Occupancy</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Key Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonalPatterns.map((pattern, index) => (
                      <tr key={index} className="border-b border-border/20">
                        <td className="py-3 font-medium text-foreground">{pattern.month}</td>
                        <td className="text-center py-3">
                          <div className="flex items-center justify-center">
                            <span className="font-medium text-foreground">{pattern.demand}</span>
                            {pattern.demand >= 90 && <TrendingUp className="h-3 w-3 ml-1 text-success" />}
                            {pattern.demand < 80 && <TrendingDown className="h-3 w-3 ml-1 text-destructive" />}
                          </div>
                        </td>
                        <td className="text-center py-3 text-foreground">${pattern.price}</td>
                        <td className="text-center py-3 text-foreground">{pattern.occupancy}%</td>
                        <td className="py-3 text-muted-foreground text-sm">{pattern.events}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Event Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventImpact.map((event, index) => (
              <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{event.flag}</span>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{event.event}</CardTitle>
                        <CardDescription className="text-xs">{event.city}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        event.status === 'upcoming'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-success/10 text-success border-success/20'
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{event.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Demand Increase</span>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3 text-success" />
                      <span className="font-medium text-success">+{event.demandIncrease}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price Increase</span>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3 text-success" />
                      <span className="font-medium text-success">+{event.priceIncrease}%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Event Timeline */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Event Timeline 2024</CardTitle>
              <CardDescription>Major events and their expected impact on demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventImpact
                  .filter(event => event.status === 'upcoming')
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/20">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-warning" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{event.flag}</span>
                          <h3 className="font-semibold text-foreground">{event.event}</h3>
                          <Badge variant="outline" className="text-xs">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-success">Demand: +{event.demandIncrease}%</span>
                          <span className="text-warning">Price: +{event.priceIncrease}%</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-medium text-foreground">{event.city}</p>
                        <p className="text-xs text-muted-foreground">{event.duration}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-6">
          {/* Holiday Season Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {holidaySeasons.map((holiday, index) => {
              const IconComponent = holiday.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">{holiday.season}</CardTitle>
                        <CardDescription>{holiday.period}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-2xl font-bold text-primary">{holiday.demandMultiplier}x</p>
                        <p className="text-xs text-muted-foreground">Demand Multiplier</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                        <p className="text-2xl font-bold text-secondary">{holiday.priceMultiplier}x</p>
                        <p className="text-xs text-muted-foreground">Price Multiplier</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Booking Window</span>
                        <span className="font-medium text-foreground">{holiday.bookingWindow}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Key Markets: </span>
                        <span className="font-medium text-foreground">{holiday.keyMarkets.join(', ')}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/20">
                      <p className="text-xs text-muted-foreground">{holiday.insights}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          {/* Weekly Pattern Chart */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Weekly Demand Patterns</CardTitle>
              <CardDescription>Business vs leisure travel patterns throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="business" fill="var(--primary)" name="Business Travel" />
                  <Bar dataKey="leisure" fill="var(--secondary)" name="Leisure Travel" />
                  <Bar dataKey="avg" fill="var(--warning)" name="Average Demand" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}