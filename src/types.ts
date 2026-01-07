export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  title: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  openStatus?: string;
  googleMapsUri?: string;
  distanceKm?: number;
  imageUrl?: string;
  description?: string;
  priceLevel?: string; // $, $$, $$$, $$$$
  tags: string[];
  intelligenceScore: number; // Calculated score
}

export enum MoodType {
  WORK = 'Work',
  DATE = 'Date',
  QUICK_BITE = 'Quick Bite',
  BUDGET = 'Budget',
  COZY = 'Cozy',
  PARTY = 'Party',
  CUSTOM = 'Custom'
}

export interface MoodConfig {
  id: string;
  label: string;
  iconName: string; // Using string to map to Lucide icons dynamically or statically
  color: string;
  promptContext: string;
}

export interface SearchFilters {
  minRating: number;
  maxDistanceKm: number;
  sortBy: 'relevance' | 'rating' | 'distance';
  onlyOpenNow: boolean;
}