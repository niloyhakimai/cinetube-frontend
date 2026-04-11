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
    router.push(`/explore?${params.toString()}`);
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
    <div className="relative w-full max-w-[450px] md:max-w-[500px]">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Titles, people, genres..."
          className="h-12 w-full rounded-[22px] border border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg)] px-4 pr-24 text-sm text-[var(--nav-foreground)] shadow-[0_18px_50px_rgba(0,0,0,0.24)] outline-none transition-all placeholder:text-[var(--nav-muted)] focus:border-red-500/45 focus:bg-[var(--nav-shell-bg-strong)] focus:shadow-[0_0_0_4px_rgba(229,9,20,0.14)]"
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-12 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${isOpen ? 'border-red-500/50 bg-red-600 text-white shadow-[0_0_14px_rgba(229,9,20,0.45)]' : 'border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] text-[var(--nav-muted)] hover:text-[var(--nav-foreground)]'}`}
          title="Advanced Filters"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        <button
          type="submit"
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 absolute left-0 top-full z-[140] mt-3 flex h-[75vh] w-full flex-col overflow-hidden rounded-[30px] border border-[var(--nav-border-strong)] bg-[var(--nav-panel-bg)] shadow-[0_32px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl duration-200 md:left-auto md:right-0 md:h-auto md:max-h-[85vh] md:w-[600px] md:max-w-[calc(100vw-2rem)]">
          <div className="flex items-center justify-between border-b border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] p-4 md:hidden">
            <h3 className="text-lg font-bold text-[var(--nav-foreground)]">Advanced Filters</h3>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="rounded-full bg-[var(--nav-hover-bg)] p-1.5 text-[var(--nav-muted)] transition-all hover:text-[var(--nav-foreground)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)]">Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full appearance-none rounded-xl border border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] px-3 py-2 text-sm text-[var(--nav-foreground)] outline-none focus:border-red-500/50">
                  <option value="">All Genres</option>
                  <option value="Action">Action</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Horror">Horror</option>
                  <option value="Thriller">Thriller</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)]">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full appearance-none rounded-xl border border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] px-3 py-2 text-sm text-[var(--nav-foreground)] outline-none focus:border-red-500/50">
                  <option value="">Any Platform</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Amazon Prime">Amazon Prime</option>
                  <option value="Hulu">Hulu</option>
                  <option value="HBO Max">HBO Max</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)]">Release Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full appearance-none rounded-xl border border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] px-3 py-2 text-sm text-[var(--nav-foreground)] outline-none focus:border-red-500/50">
                  <option value="">Any Time</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2020-2022">2020 - 2022</option>
                  <option value="2010s">2010s</option>
                  <option value="classic">Classics (Pre-2010)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)]">
                  <span>Min Rating (IMDb)</span>
                  <span className="font-bold text-red-500">{rating ? `${rating}+ Stars` : 'Any'}</span>
                </label>
                <input 
                  type="range" min="0" max="10" step="0.5" 
                  value={rating || 0} 
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-red-600"
                />
              </div>
            </div>

            <hr className="my-6 border-white/10" />

            <div className="mb-2 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-muted)]">Sort By</label>
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
                    className={`flex-grow rounded-full px-3 py-2 text-center text-sm font-medium transition-all sm:flex-grow-0 md:px-4 ${sortBy === opt.id ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'border border-[var(--nav-border-strong)] bg-[var(--nav-hover-bg)] text-[var(--nav-muted)] hover:text-[var(--nav-foreground)]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto flex shrink-0 gap-3 border-t border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg-strong)] p-4 md:p-5">
            <button 
              type="button" 
              onClick={clearFilters} 
              className="secondary-button flex-1 !justify-center !rounded-2xl !px-5 !py-3 text-sm md:flex-none"
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={submitSearch} 
              className="flex-1 rounded-2xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(229,9,20,0.24)] transition-colors hover:bg-red-700 md:flex-none"
            >
              Apply & Explore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdvancedSearchFallback() {
  return <div className="h-12 w-full max-w-[450px] md:max-w-[500px] rounded-[22px] bg-white/10 animate-pulse"></div>;
}

export default function AdvancedSearch() {
  return (
    <Suspense fallback={<AdvancedSearchFallback />}>
      <AdvancedSearchContent />
    </Suspense>
  );
}
