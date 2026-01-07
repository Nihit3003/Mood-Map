import React from 'react';
import { SearchFilters } from '../types';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FiltersProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Sort */}
        <div className="flex items-center space-x-3">
            <span className="text-slate-400 flex items-center gap-1 text-sm font-medium">
                <ArrowUpDown size={14} /> Sort
            </span>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {(['relevance', 'rating', 'distance'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilters(prev => ({ ...prev, sortBy: type }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                            filters.sortBy === type 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        {/* Sliders / Toggles */}
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Rating</label>
                <select 
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5"
                >
                    <option value={0}>Any</option>
                    <option value={3.5}>3.5+</option>
                    <option value={4.0}>4.0+</option>
                    <option value={4.5}>4.5+</option>
                </select>
           </div>
           
           <div className="flex items-center gap-2">
               <label className="flex items-center space-x-2 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={filters.onlyOpenNow}
                    onChange={(e) => setFilters(prev => ({ ...prev, onlyOpenNow: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                   />
                   <span className="text-sm text-slate-600 font-medium">Open Now</span>
               </label>
           </div>
        </div>

      </div>
    </div>
  );
};
