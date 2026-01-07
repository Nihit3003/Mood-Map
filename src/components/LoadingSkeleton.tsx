import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-80 flex flex-col animate-pulse">
          <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="flex gap-2 mb-4">
             <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
             <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
          </div>
          <div className="mt-auto flex gap-2">
            <div className="h-10 flex-1 bg-slate-200 rounded-lg"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
