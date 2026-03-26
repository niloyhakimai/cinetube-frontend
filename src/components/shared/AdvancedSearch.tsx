"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdvancedSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const submitSearch = () => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (genre) params.append('genre', genre);
    if (platform) params.append('platform', platform);
    if (year) params.append('year', year);
    if (rating) params.append('rating', rating);
    if (sortBy) params.append('sort', sortBy);

    setIsOpen(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    submitSearch();
  };

  const clearFilters = () => {
    setQuery('');
    setGenre('');
    setPlatform('');
    setYear('');
    setRating('');
    setSortBy('latest');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative flex items-center">
        {/* Main Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titles, people, genres..."
          className="w-full bg-[#111]/80 border border-white/20 text-white placeholder-gray-400 px-4 py-2.5 rounded-full focus:outline-none focus:border-red-600 focus:bg-[#111] transition-all backdrop-blur-md pr-24"
        />

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-12 p-1.5 rounded-full transition-colors ${isOpen ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(229,9,20,0.5)]' : 'text-gray-400 hover:text-white'}`}
          title="Advanced Filters"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="absolute right-2 bg-red-600 hover:bg-red-700 p-1.5 rounded-full text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Floating Glassy Filter Panel (Works perfectly on both Mobile and Desktop) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-3 h-[75vh] md:h-auto md:max-h-[85vh] md:left-auto md:right-0 md:w-[600px] bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 md:hidden bg-[#111]">
            <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 bg-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Genre */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-3 md:py-2 focus:border-red-500 focus:outline-none appearance-none">
                  <option value="">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Horror">Horror</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-3 md:py-2 focus:border-red-500 focus:outline-none appearance-none">
                  <option value="">Any Platform</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Amazon Prime">Amazon Prime</option>
                  <option value="Hulu">Hulu</option>
                  <option value="HBO Max">HBO Max</option>
                </select>
              </div>

              {/* Release Year */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Release Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 text-white rounded-lg px-3 py-3 md:py-2 focus:border-red-500 focus:outline-none appearance-none">
                  <option value="">Any Time</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2020-2022">2020 - 2022</option>
                  <option value="2010s">2010s</option>
                  <option value="classic">Classics (Pre-2010)</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Min Rating (IMDb)</span>
                  <span className="text-red-500 font-bold">{rating ? `${rating}+ Stars` : 'Any'}</span>
                </label>
                <input 
                  type="range" min="0" max="10" step="0.5" 
                  value={rating || 0} 
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full accent-red-600 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2"
                />
              </div>
            </div>

            <hr className="border-white/10 my-6" />

            {/* Sort By */}
            <div className="space-y-3 mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort By</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { id: 'latest', label: 'Latest Releases' },
                  { id: 'highest-rated', label: 'Highest Rated' },
                  { id: 'most-reviewed', label: 'Most Reviewed' },
                  { id: 'popularity', label: 'Most Popular' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`px-3 py-2 md:px-4 rounded-full text-sm font-medium transition-all flex-grow sm:flex-grow-0 text-center ${sortBy === opt.id ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons (Sticky at bottom) */}
          <div className="p-4 md:p-5 border-t border-white/10 bg-[#111] md:bg-transparent flex gap-3 justify-end mt-auto shrink-0">
            <button 
              type="button" 
              onClick={clearFilters} 
              className="flex-1 md:flex-none px-5 py-2.5 md:py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={submitSearch} 
              className="flex-[2] md:flex-none px-6 py-2.5 md:py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
            >
              Apply & Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedSearchFallback() {
  return <div className="h-11 w-full rounded-full bg-white/10 animate-pulse"></div>;
}

export default function AdvancedSearch() {
  return (
    <Suspense fallback={<AdvancedSearchFallback />}>
      <AdvancedSearchContent />
    </Suspense>
  );
}
