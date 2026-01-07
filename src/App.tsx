import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MoodSelector } from './components/MoodSelector';
import { PlaceCard } from './components/PlaceCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Filters } from './components/Filters';
import { geminiService } from './services/geminiService';
import { GeoLocation, Place, SearchFilters } from './types';
import { MapPin, Navigation, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [mood, setMood] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Filters State
  const [filters, setFilters] = useState<SearchFilters>({
    minRating: 0,
    maxDistanceKm: 10,
    sortBy: 'relevance',
    onlyOpenNow: false,
  });

  // Location Fetching Logic
  const fetchLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      // Force high accuracy and don't use cached position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (err) => {
          let errorMessage = "Please enable location services to find places near you.";
          if (err.code === 1) errorMessage = "Location permission denied.";
          if (err.code === 2) errorMessage = "Location unavailable.";
          if (err.code === 3) errorMessage = "Location request timed out.";
          setLocationError(errorMessage);
          console.error(err);
        },
        {
          enableHighAccuracy: true, // Forces GPS/Wi-Fi over IP
          timeout: 10000,
          maximumAge: 0 // Prevents using a stale cached position
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Initial Location Fetch
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleMoodSelect = useCallback(async (selectedMood: string) => {
    if (!location) {
      if (locationError) {
        setError(locationError);
      } else {
        setError("Waiting for location... Please ensure GPS is enabled.");
      }
      return;
    }

    setMood(selectedMood);
    setLoading(true);
    setError(null);
    setPlaces([]); // Clear previous

    try {
      const results = await geminiService.fetchRecommendations(selectedMood, location);
      setPlaces(results);
    } catch (err) {
      setError("Failed to fetch recommendations. The service might be busy or the API key is invalid.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location, locationError]);

  const handleRetry = () => {
    if (mood) {
      handleMoodSelect(mood);
    } else {
      window.location.reload();
    }
  };

  // Apply Filters & Sorting (Client-side Intelligence)
  const filteredPlaces = useMemo(() => {
    let result = [...places];

    // Filter
    if (filters.minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= filters.minRating);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          return (a.distanceKm || 0) - (b.distanceKm || 0);
        case 'relevance':
        default:
          return b.intelligenceScore - a.intelligenceScore;
      }
    });

    return result;
  }, [places, filters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
               <Navigation size={20} className="transform -rotate-45" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              MoodMap
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            {location ? (
              <button 
                onClick={fetchLocation}
                className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                title="Update Location"
              >
                <MapPin size={16} />
                <span className="hidden sm:inline">Location Active</span>
              </button>
            ) : (
              <span className="text-orange-500 flex items-center gap-1 font-medium">
                 {locationError ? <AlertCircle size={16}/> : <div className="animate-spin h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full"></div>}
                 {locationError ? 'Location Access Needed' : 'Locating...'}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Intro / Mood Selection */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              Where does your mood take you?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Select a vibe below and our AI will scout the best spots nearby, optimizing for atmosphere, ratings, and convenience.
            </p>
          </div>
          
          <MoodSelector selectedMood={mood} onSelectMood={handleMoodSelect} />
        </section>

        {/* Results Section */}
        <section>
          {(loading || places.length > 0) && (
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {mood && <span className="text-indigo-600">"{mood}"</span>} Recommendations
                  {places.length > 0 && !loading && (
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{filteredPlaces.length}</span>
                  )}
                </h3>
                {!loading && places.length > 0 && (
                  <button 
                    onClick={() => handleMoodSelect(mood)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Refresh Results"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}
             </div>
          )}

          {places.length > 0 && !loading && (
            <Filters filters={filters} setFilters={setFilters} />
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
              <div className="flex justify-center mb-2">
                <AlertCircle className="text-red-500 h-8 w-8" />
              </div>
              <p className="text-red-600 font-medium mb-2">Oops, something went wrong.</p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {filteredPlaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                places.length > 0 && (
                   <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                     <p>No places match your selected filters.</p>
                     <button onClick={() => setFilters({minRating: 0, maxDistanceKm: 10, sortBy: 'relevance', onlyOpenNow: false})} className="text-indigo-600 text-sm font-medium mt-2 hover:underline">Clear Filters</button>
                   </div>
                )
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}