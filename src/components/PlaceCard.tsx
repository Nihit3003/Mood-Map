import React from 'react';
import { Place } from '../types';
import { Star, MapPin, ExternalLink, Navigation } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="h-32 bg-slate-200 relative overflow-hidden">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <span className="text-4xl">📍</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
          {place.distanceKm} km
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">{place.title}</h3>
          {place.rating && (
            <div className="flex items-center space-x-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-3 line-clamp-2 flex-1">
          {place.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {place.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {tag}
            </span>
          ))}
          {place.priceLevel && (
             <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
             {place.priceLevel}
           </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50 flex gap-2">
          <a 
            href={place.googleMapsUri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Navigation size={16} />
            <span>Navigate</span>
          </a>
          <a 
            href={place.googleMapsUri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};
