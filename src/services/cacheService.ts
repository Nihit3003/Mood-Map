import { Place } from '../types';

/**
 * SIMULATED BACKEND LAYER
 * 
 * In a real-world scenario, this would be a Node.js + Redis layer.
 * Here we use localStorage and in-memory Map to cache Gemini/Maps results
 * to prevent redundant API calls and save quota.
 */

const CACHE_PREFIX = 'moodmap_cache_v1_';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

interface CacheEntry {
  timestamp: number;
  data: Place[];
  location: { lat: number; lng: number };
}

export const cacheService = {
  generateKey(mood: string, lat: number, lng: number): string {
    // Round coords to ~100m to group nearby requests
    const rLat = lat.toFixed(3);
    const rLng = lng.toFixed(3);
    return `${CACHE_PREFIX}${mood.toLowerCase()}_${rLat}_${rLng}`;
  },

  get(mood: string, lat: number, lng: number): Place[] | null {
    const key = this.generateKey(mood, lat, lng);
    const raw = localStorage.getItem(key);
    
    if (!raw) return null;

    try {
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      console.log(`[Backend Cache] HIT for ${mood}`);
      return entry.data;
    } catch (e) {
      return null;
    }
  },

  set(mood: string, lat: number, lng: number, data: Place[]): void {
    const key = this.generateKey(mood, lat, lng);
    const entry: CacheEntry = {
      timestamp: Date.now(),
      data,
      location: { lat, lng }
    };
    try {
      localStorage.setItem(key, JSON.stringify(entry));
      console.log(`[Backend Cache] STORED for ${mood}`);
    } catch (e) {
      console.warn('LocalStorage full or error', e);
    }
  },

  // Simple fuzzy cleanup
  prune(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        // Check TTL logic here if strictly needed, or just clear old ones
      }
    }
  }
};
