import { GoogleGenAI } from "@google/genai";
import { GeoLocation, Place } from "../types";
import { cacheService } from "./cacheService";

// Using the 2.5 Flash model which supports Google Maps Grounding
const MODEL_NAME = 'gemini-2.5-flash';

// Initialize Gemini Client Lazily
// This prevents top-level crashes if the API key is missing during app initialization
let ai: GoogleGenAI | null = null;

function getAiClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return ai;
}

/**
 * Calculates a "Mood Intelligence Score" for sorting.
 * Now includes mood-specific weighting.
 */
function calculateIntelligenceScore(place: Partial<Place>, mood: string): number {
  let score = 100;
  
  // 1. Rating Impact (Weighted heavily)
  if (place.rating) {
    score += (place.rating - 4.0) * 25; // Significant boost for > 4.0
  }

  // 2. Distance Penalty
  if (place.distanceKm) {
    score -= (place.distanceKm * 8); // Penalize distance
  }

  // 3. Mood Specific Tweaks
  const lowerMood = mood.toLowerCase();
  
  // Budget mood loves cheap places
  if (lowerMood.includes('budget') || lowerMood.includes('cheap')) {
    if (place.priceLevel === '$') score += 30;
    if (place.priceLevel === '$$') score += 10;
    if (place.priceLevel === '$$$$') score -= 50;
  }

  // Date mood loves high price/quality
  if (lowerMood.includes('date') || lowerMood.includes('romantic')) {
    if (place.priceLevel === '$$$' || place.priceLevel === '$$$$') score += 20;
    if (place.rating && place.rating > 4.5) score += 15;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Parses the raw text description to extract structured data 
 * that might not be in the grounding metadata.
 */
function extractDetailsFromText(text: string, placeTitle: string): Partial<Place> {
  const details: Partial<Place> = {};
  
  if (!text) return details;

  // Try to find rating near the title in the text
  const ratingRegex = new RegExp(`${placeTitle}.*?([0-5]\\.[0-9])\\s*stars?`, 'i');
  const ratingMatch = text.match(ratingRegex);
  if (ratingMatch) {
    details.rating = parseFloat(ratingMatch[1]);
  }

  // Price level extraction
  if (text.includes('$$$$')) details.priceLevel = '$$$$';
  else if (text.includes('$$$')) details.priceLevel = '$$$';
  else if (text.includes('$$')) details.priceLevel = '$$';
  else if (text.includes('$')) details.priceLevel = '$';

  return details;
}

export const geminiService = {
  async fetchRecommendations(mood: string, location: GeoLocation, customPrompt?: string): Promise<Place[]> {
    
    // 1. Check Backend Cache (Simulated)
    const cached = cacheService.get(mood, location.latitude, location.longitude);
    if (cached) {
      return cached;
    }

    // 2. Build Prompt
    const basePrompt = customPrompt || `
      I am in a "${mood}" mood.
      Find 8-10 specific places near me that fit this mood perfectly.
      For each place, provide a very brief reason why it fits the mood, its estimated rating (e.g. 4.5), and if it's open.
      
      Requirements:
      - Prioritize high-rated places.
      - If the mood is "Budget", prioritize low cost ($ or $$).
      - If the mood is "Date", prioritize ambiance.
      - If the mood is "Work", prioritize wifi/quiet.
    `;

    try {
      // 3. Call Gemini with Maps Grounding
      const client = getAiClient();
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: basePrompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            }
          }
        }
      });

      // 4. Parse Results
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates returned from Gemini.");
      }

      // Use the helper getter .text directly
      const text = response.text || '';
      const groundingChunks = candidates[0].groundingMetadata?.groundingChunks;

      if (!groundingChunks) {
        // Fallback if no grounding happened
        console.warn("No grounding chunks found.");
        return [];
      }

      const places: Place[] = [];
      const seenIds = new Set<string>();

      // Extract places from Grounding Metadata
      groundingChunks.forEach((chunk: any, index: number) => {
         let title: string | undefined;
         let uri: string | undefined;
         
         if (chunk.maps) {
           title = chunk.maps.title;
           uri = chunk.maps.googleMapsUri || chunk.maps.uri;
         } else if (chunk.web) {
           title = chunk.web.title;
           uri = chunk.web.uri;
         }

         if (title && uri) {
            // Dedupe
            if (seenIds.has(title)) return;
            seenIds.add(title);

            // Extract extra details
            const extraDetails = extractDetailsFromText(text, title);

            // Mock distance if not available
            const distanceKm = Math.random() * 5; 

            const place: Place = {
              id: `place-${index}-${Date.now()}`,
              title: title,
              googleMapsUri: uri,
              rating: extraDetails.rating || 4.0 + (Math.random() * 1.0), 
              address: "Address via Google Maps", 
              tags: [mood, extraDetails.priceLevel || "$$"],
              intelligenceScore: 0, 
              description: `Recommended for your ${mood} mood.`,
              distanceKm: parseFloat(distanceKm.toFixed(1)),
              priceLevel: extraDetails.priceLevel
            };

            // Calculate score with improved logic
            place.intelligenceScore = calculateIntelligenceScore(place, mood);
            places.push(place);
         }
      });

      // Sort by intelligence score initially
      places.sort((a, b) => b.intelligenceScore - a.intelligenceScore);

      // 5. Cache the Result
      cacheService.set(mood, location.latitude, location.longitude, places);

      return places;

    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
};