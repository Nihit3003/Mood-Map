import React, { useState, useEffect } from 'react';
import { MoodType, MoodConfig } from '../types';
import { Briefcase, Heart, Coffee, Wallet, Sofa, PartyPopper, Sparkles } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: string;
  onSelectMood: (mood: string) => void;
}

// Icon Mapping
const iconMap: Record<string, React.ReactNode> = {
  [MoodType.WORK]: <Briefcase size={24} />,
  [MoodType.DATE]: <Heart size={24} />,
  [MoodType.QUICK_BITE]: <Coffee size={24} />,
  [MoodType.BUDGET]: <Wallet size={24} />,
  [MoodType.COZY]: <Sofa size={24} />,
  [MoodType.PARTY]: <PartyPopper size={24} />,
};

const MOODS: MoodConfig[] = [
  { id: MoodType.WORK, label: 'Work Mode', iconName: 'briefcase', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200', promptContext: 'quiet places with wifi and coffee' },
  { id: MoodType.DATE, label: 'Date Night', iconName: 'heart', color: 'bg-rose-100 text-rose-600 hover:bg-rose-200', promptContext: 'romantic ambience, dim lighting' },
  { id: MoodType.QUICK_BITE, label: 'Quick Bite', iconName: 'coffee', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200', promptContext: 'fast service, good food' },
  { id: MoodType.BUDGET, label: 'Budget', iconName: 'wallet', color: 'bg-green-100 text-green-600 hover:bg-green-200', promptContext: 'cheap eats, good value' },
  { id: MoodType.COZY, label: 'Cozy', iconName: 'sofa', color: 'bg-amber-100 text-amber-600 hover:bg-amber-200', promptContext: 'comfortable seating, warm atmosphere' },
  { id: MoodType.PARTY, label: 'Party', iconName: 'party', color: 'bg-purple-100 text-purple-600 hover:bg-purple-200', promptContext: 'lively music, drinks, crowd' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  const [inputValue, setInputValue] = useState('');
  
  // Clean submit handler
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSelectMood(inputValue.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelectMood(mood.label)}
            className={`p-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center space-y-2 border-2 ${
              selectedMood === mood.label
                ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-lg transform scale-105'
                : 'border-transparent hover:scale-105'
            } ${mood.color}`}
          >
            <div className="p-2 bg-white/50 rounded-full backdrop-blur-sm">
              {iconMap[mood.id]}
            </div>
            <span className="font-semibold text-sm md:text-base">{mood.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500 font-medium">or tell us your vibe</span>
        </div>
      </div>

      <form onSubmit={handleCustomSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-24 py-4 border-2 border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-colors text-slate-800"
          placeholder="e.g., 'Quiet library with a view'..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg font-medium transition-colors flex items-center"
        >
          Find
        </button>
      </form>
    </div>
  );
};