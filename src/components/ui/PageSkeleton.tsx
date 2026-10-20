import React from 'react';
import { Sprout } from 'lucide-react';

interface PageSkeletonProps {
  isFullScreen?: boolean;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ isFullScreen = false }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`w-full ${
        isFullScreen
          ? 'min-h-screen bg-[#F6F8F0] flex flex-col items-center justify-center p-4'
          : 'space-y-6 animate-fadeIn py-2'
      }`}
    >
      {/* Top Banner / Header Skeleton */}
      <div className="bg-white rounded-2xl p-5 border border-[#DDE8DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F2E5] animate-pulse flex items-center justify-center text-[#2F9E59]">
              <Sprout className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-48 sm:w-64 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-3.5 w-32 sm:w-40 bg-slate-100 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:block h-9 w-28 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        {/* Pulse Bar Indicator */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#2F9E59] via-[#21864A] to-[#0B5137] h-full w-2/5 rounded-full animate-indeterminate" />
        </div>
      </div>

      {/* Grid of Content Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((cardId) => (
          <div
            key={cardId}
            className="bg-white rounded-2xl p-5 border border-[#DDE8DC] shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-5 w-16 bg-emerald-50 rounded-full animate-pulse border border-emerald-100" />
            </div>
            <div className="h-28 w-full bg-slate-100 rounded-xl animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-5/6 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-3 w-4/6 bg-slate-100 rounded-md animate-pulse" />
              <div className="h-3 w-3/6 bg-slate-100 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Screen-reader note */}
      <span className="sr-only">कृषीस्कॅन AI माहिती लोड होत आहे... (Loading KrushiScan AI data...)</span>
    </div>
  );
};
