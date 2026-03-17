"use client";

import { useEffect, useState } from 'react';
import MovieCard from '@/components/cards/MovieCard';
import { api } from '@/lib/axios';

interface MediaData {
  id: string;
  title: string;
  releaseYear: number;
  genre: string[];
}

export default function Series() {
  const [series, setSeries] = useState<MediaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get('/media');
        // Note: For now, we are fetching all media. 
        // Later, you can filter this backend call by a 'mediaType' field.
        setSeries(response.data.media);
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const filteredSeries = series.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || item.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white border-l-4 border-red-600 pl-4">
            TV Series Library
          </h1>
          
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search series..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md focus:outline-none focus:border-red-600 w-full md:w-64"
            />
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="All">All Genres</option>
              <option value="Action">Action</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Thriller">Thriller</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredSeries.map((item) => (
            <MovieCard 
              key={item.id}
              id={item.id}
              title={item.title}
              image="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop"
              rating={8.8} 
              year={item.releaseYear}
              genre={item.genre[0] || "Unknown"}
            />
          ))}
        </div>
        
        {filteredSeries.length === 0 && (
          <div className="text-center text-gray-500 mt-20 p-10 bg-[#111] rounded-xl border border-white/10">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-semibold">No series found matching your search.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}