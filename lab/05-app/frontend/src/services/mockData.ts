import { Property, Host, Review, AvailabilityDate, DEMO_DESTINATIONS } from '../types/api';
import { getRandomFromArray, getRandomNumber } from '../lib/utils';

/**
 * Mock data service for offline development
 * Provides comprehensive property data for all 6 demo cities
 */
class MockDataService {
  private properties: Property[] = [];
  private hosts: Host[] = [];
  private reviews: Review[] = [];

  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize all mock data
   */
  private initializeMockData(): void {
    this.generateHosts();
    this.generateProperties();
    this.generateReviews();
  }

  /**
   * Generate mock host data
   */
  private generateHosts(): void {
    const hostNames = [
      'Emma Johnson', 'Liam Chen', 'Sofia Rodriguez', 'Oliver Kim', 'Isabella Wong',
      'Noah Martinez', 'Ava Thompson', 'Lucas Garcia', 'Mia Davis', 'Ethan Wilson',
      'Charlotte Brown', 'Mason Lee', 'Amelia Taylor', 'William Anderson', 'Harper Clark'
    ];

    this.hosts = hostNames.map((name, index) => ({
      id: `host-${index + 1}`,
      name,
      avatar_url: `https://images.unsplash.com/photo-${1500000000 + index * 100000}?w=150&h=150&fit=crop&crop=face`,
      is_superhost: Math.random() > 0.6,
      joined_date: `2020-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
      response_rate: getRandomNumber(85, 100),
      response_time: getRandomFromArray(['within an hour', 'within a few hours', 'within a day']),
      verified: Math.random() > 0.2,
    }));
  }

  /**
   * Generate availability calendar
   */
  private generateAvailabilityCalendar(): AvailabilityDate[] {
    const calendar: AvailabilityDate[] = [];
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      calendar.push({
        date: date.toISOString().split('T')[0],
        available: Math.random() > 0.3, // 70% availability
        price: getRandomNumber(80, 300),
      });
    }

    return calendar;
  }

  /**
   * Generate properties for each city
   */
  private generateProperties(): void {
    const propertyTypes: Array<'apartment' | 'house' | 'villa' | 'condo'> = ['apartment', 'house', 'villa', 'condo'];
    
    const amenitiesList = [
      'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
      'TV', 'Hot tub', 'Pool', 'Gym', 'Free parking', 'Breakfast',
      'Pets allowed', 'Smoking allowed', 'Events allowed', 'Family friendly',
      'Accessible', 'Elevator', 'Hair dryer', 'Iron', 'Laptop workspace',
      'Crib', 'High chair', 'Beach access', 'Ski access', 'City center'
    ];

    const cityImageMappings = {
      'Tokyo, Japan': [
        'https://images.unsplash.com/photo-1697461881783-7fb7392b2ce4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMG1vZGVybiUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1691334016976-d36da0a28a7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwc2t5bGluZSUyMGNpdHl8ZW58MXx8fHwxNzU3NDE4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'New York, United States': [
        'https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1643406416661-0456c5d1b53e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwTWFuaGF0dGFuJTIwc2t5bGluZXxlbnwxfHx8fDE3NTc0MTg1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'London, United Kingdom': [
        'https://images.unsplash.com/photo-1527774436903-af05f4d201c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBhcGFydG1lbnQlMjBmbGF0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1664611213083-716234af473d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBCaWclMjBCZW4lMjB0b3dlciUyMGJyaWRnZXxlbnwxfHx8fDE3NTc0MTg1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'Dubai, United Arab Emirates': [
        'https://images.unsplash.com/photo-1574213183659-c3b6df87d99f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGx1eHVyeSUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1590490359854-dfba19688d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NTc0MTkyNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1643904736472-8b77e93ca3d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMEJ1cmolMjBLaGFsaWZhJTIwc2t5bGluZXxlbnwxfHx8fDE3NTczNzI2MzN8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'Singapore, Singapore': [
        'https://images.unsplash.com/photo-1631152695193-61c709e578f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MTkyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NzQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1614505241498-80a3ec936595?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NTczOTk1NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MDg2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1727880676753-9ba90268d3ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaW5nYXBvcmUlMjBNYXJpbmElMjBCYXklMjBza3lsaW5lfGVufDF8fHx8MTc1NzQxODU4MHww&ixlib=rb-4.1.0&q=80&w=1080'
      ],
      'Rome, Italy': [
        'https://images.unsplash.com/photo-1694678803912-567a0de15710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSb21lJTIwaGlzdG9yaWMlMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NTc0MTkyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1527774436903-af05f4d201c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMb25kb24lMjBhcGFydG1lbnQlMjBmbGF0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1556218620-f2d061804f1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU3NDE5MjUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1649663724528-3bd2ce98b6e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGludGVyaW9yJTIwbHV4dXJ5fGVufDF8fHx8MTc1NzQxOTI1MHww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1696987016869-ea9ac58b6096?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwbG9mdCUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc1NTQxOTI0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1610123172763-1f587473048f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc1NzM2MDYxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        'https://images.unsplash.com/photo-1652337882191-6c61a9f6dac0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSb21lJTIwQ29sb3NzZXVtJTIwSXRhbHklMjBhbmNpZW50fGVufDF8fHx8MTc1NzQxODU4MHww&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    };

    const propertyTitles = {
      'Tokyo, Japan': [
        'Modern Shibuya Studio', 'Traditional Asakusa House', 'Sleek Ginza Apartment',
        'Zen Garden Retreat', 'Contemporary Harajuku Loft', 'Minimalist Shinjuku Pad',
        'Cultural Ueno District Home', 'Trendy Roppongi Residence'
      ],
      'New York, United States': [
        'Manhattan Skyline Loft', 'Brooklyn Heights Brownstone', 'SoHo Artist Studio',
        'Central Park West Apartment', 'East Village Gem', 'Upper East Side Classic',
        'Tribeca Modern Penthouse', 'Chelsea Industrial Loft'
      ],
      'London, United Kingdom': [
        'Victorian Notting Hill House', 'Modern Shoreditch Loft', 'Covent Garden Flat',
        'Kensington Garden Apartment', 'Camden Market Studio', 'Mayfair Luxury Suite',
        'Greenwich Village Home', 'Canary Wharf High-Rise'
      ],
      'Dubai, United Arab Emirates': [
        'Luxury Downtown Dubai Apartment', 'Marina View Penthouse', 'Desert Villa in Arabian Ranches',
        'Modern Business Bay Suite', 'JBR Beachfront Flat', 'Burj Khalifa Sky-high Condo',
        'Old Dubai Traditional Majlis', 'DIFC Ultra-modern Loft'
      ],
      'Singapore, Singapore': [
        'Marina Bay Luxury Suite', 'Chinatown Heritage Shophouse', 'Orchard Road Modern Condo',
        'Garden City Green Apartment', 'Sentosa Island Resort Villa', 'CBD Executive Suite',
        'Tiong Bahru Colonial House', 'Sky Garden Penthouse'
      ],
      'Rome, Italy': [
        'Colosseum View Historic Apartment', 'Vatican District Penthouse', 'Trastevere Charming Flat',
        'Roman Countryside Villa', 'Testaccio Modern Loft', 'Centro Storico Palazzo Suite',
        'Villa Borghese Garden Apartment', 'Monti Rooftop Terrace'
      ]
    };

    DEMO_DESTINATIONS.forEach((city) => {
      const titles = propertyTitles[city];
      const images = cityImageMappings[city];
      
      for (let i = 0; i < 8; i++) {
        const propertyId = `${city.toLowerCase().replace(/[^a-z]/g, '-')}-${i + 1}`;
        const propertyType = getRandomFromArray(propertyTypes);
        const bedrooms = getRandomNumber(1, 4);
        const bathrooms = getRandomNumber(1, 3);
        const maxGuests = bedrooms * 2;
        const pricePerNight = getRandomNumber(80, 400);
        const rating = Math.round((getRandomNumber(40, 50) / 10) * 10) / 10;
        const reviewCount = getRandomNumber(5, 200);
        const hostIndex = getRandomNumber(0, this.hosts.length - 1);

        // Select amenities (8-15 random amenities)
        const selectedAmenities = [];
        const numAmenities = getRandomNumber(8, 15);
        const shuffledAmenities = [...amenitiesList].sort(() => 0.5 - Math.random());
        selectedAmenities.push(...shuffledAmenities.slice(0, numAmenities));

        // Generate property images (3-6 images per property)
        const numImages = getRandomNumber(3, 6);
        const propertyImages = [];
        for (let j = 0; j < numImages; j++) {
          const baseImage = getRandomFromArray(images);
          propertyImages.push(`${baseImage}&auto=format&fit=crop&crop=center&q=80`);
        }

        const property: Property = {
          id: propertyId,
          title: titles[i],
          location: city,
          property_type: propertyType,
          bedrooms,
          bathrooms,
          max_guests: maxGuests,
          price_per_night: pricePerNight,
          rating,
          review_count: reviewCount,
          images: propertyImages,
          amenities: selectedAmenities,
          description: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${city}`,
          host_id: this.hosts[hostIndex].id,
          is_superhost: this.hosts[hostIndex].is_superhost,
          availability_calendar: this.generateAvailabilityCalendar(),
        };

        this.properties.push(property);
      }
    });
  }


  /**
   * Generate mock reviews
   */
  private generateReviews(): void {
    const reviewComments = [
      "Amazing stay! The location was perfect and the host was very responsive.",
      "Beautiful property with great attention to detail. Would definitely stay again!",
      "Clean, comfortable, and exactly as described. Highly recommend!",
      "Perfect location for exploring the city. The apartment had everything we needed.",
      "Wonderful host and beautiful space. Felt like home away from home.",
      "Great value for money. The property exceeded our expectations.",
      "Stylish and modern with all the amenities. Loved our stay here.",
      "Fantastic location and the host went above and beyond to help us.",
    ];

    const guestNames = [
      'Sarah M.', 'David L.', 'Jennifer K.', 'Michael R.', 'Lisa H.',
      'James P.', 'Emily W.', 'Robert F.', 'Amanda S.', 'Chris T.'
    ];

    this.properties.forEach(property => {
      const numReviews = Math.min(property.review_count, 20); // Limit to 20 reviews per property
      
      for (let i = 0; i < numReviews; i++) {
        const review: Review = {
          id: `${property.id}-review-${i + 1}`,
          guest_name: getRandomFromArray(guestNames),
          guest_avatar: `https://images.unsplash.com/photo-${1600000000 + getRandomNumber(100000, 999999)}?w=100&h=100&fit=crop&crop=face`,
          rating: getRandomNumber(4, 5), // High ratings (4-5 stars)
          comment: getRandomFromArray(reviewComments),
          created_at: this.generateRandomDate(),
          property_id: property.id,
        };
        
        this.reviews.push(review);
      }
    });
  }

  /**
   * Generate random date within the last 2 years
   */
  private generateRandomDate(): string {
    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    
    const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
    return new Date(randomTime).toISOString();
  }

  /**
   * Get all properties
   */
  getProperties(): Property[] {
    return [...this.properties];
  }

  /**
   * Get properties by destination
   */
  getPropertiesByDestination(destination: string): Property[] {
    return this.properties.filter(property => 
      property.location.toLowerCase() === destination.toLowerCase()
    );
  }

  /**
   * Get property by ID
   */
  getPropertyById(id: string): Property | undefined {
    return this.properties.find(property => property.id === id);
  }

  /**
   * Get host by ID
   */
  getHostById(id: string): Host | undefined {
    return this.hosts.find(host => host.id === id);
  }

  /**
   * Get reviews for property
   */
  getReviewsForProperty(propertyId: string): Review[] {
    return this.reviews.filter(review => review.property_id === propertyId);
  }

  /**
   * Search properties with criteria
   */
  searchProperties(criteria: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    maxPrice?: number;
    minPrice?: number;
    propertyType?: string;
    amenities?: string[];
  }): Property[] {
    let filtered = [...this.properties];

    if (criteria.destination) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(criteria.destination!.toLowerCase())
      );
    }

    if (criteria.guests) {
      filtered = filtered.filter(property => property.max_guests >= criteria.guests!);
    }

    if (criteria.maxPrice) {
      filtered = filtered.filter(property => property.price_per_night <= criteria.maxPrice!);
    }

    if (criteria.minPrice) {
      filtered = filtered.filter(property => property.price_per_night >= criteria.minPrice!);
    }

    if (criteria.propertyType) {
      filtered = filtered.filter(property => property.property_type === criteria.propertyType);
    }

    if (criteria.amenities && criteria.amenities.length > 0) {
      filtered = filtered.filter(property =>
        criteria.amenities!.every(amenity =>
          property.amenities.includes(amenity)
        )
      );
    }

    return filtered;
  }

  /**
   * Get random properties for featured listings
   */
  getFeaturedProperties(count: number = 6): Property[] {
    const shuffled = [...this.properties].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;
