"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const genreOptions = ['All Genres', 'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];
const platformOptions = ['Any Platform', 'Netflix', 'Amazon Prime', 'Disney+', 'HBO Max', 'Hulu'];
const yearOptions = ['Any Year', '2026', '2025', '2024', '2023', '2020-2022', '2010s', 'classic'];

export default function HomeFilterBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [platform, setPlatform] = useState('Any Platform');
  const [year, setYear] = useState('Any Year');

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (genre !== 'All Genres') {
      params.set('genre', genre);
    }
    if (platform !== 'Any Platform') {
      params.set('platform', platform);
    }
    if (year !== 'Any Year') {
      params.set('year', year);
    }

    params.set('sort', 'popularity');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto rounded-[28px] border border-white/10 bg-[#0d0d0d]/90 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500/80 mb-2">Find Something Great</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Search the catalog with filters that feel instant.</h2>
          </div>
          <p className="text-sm text-gray-400 max-w-xl">
            Search by title, then narrow by genre, platform, or release window before you jump into the full catalog.
          </p>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.7fr))_auto] gap-3">
          <label className="block">
            <span className="sr-only">Search titles</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search movies, series, casts..."
              className="w-full rounded-2xl border border-white/10 bg-[#151515] px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </label>

          <label className="block">
            <span className="sr-only">Genre</span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#151515] px-4 py-3.5 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {genreOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Streaming Platform</span>
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#151515] px-4 py-3.5 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {platformOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Release Year</span>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#151515] px-4 py-3.5 text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 transition-colors shadow-[0_0_20px_rgba(229,9,20,0.35)]"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
