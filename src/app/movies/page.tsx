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

export default function AllMovies() {
  const [movies, setMovies] = useState<MediaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/media');
        setMovies(response.data.media);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Filter Logic
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
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
            Explore Library
          </h1>
          
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search movies by title..." 
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
              <option value="Horror">Horror</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id}
              id={movie.id}
              title={movie.title}
              image="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop"
              rating={8.5} 
              year={movie.releaseYear}
              genre={movie.genre[0] || "Unknown"}
            />
          ))}
        </div>
        
        {filteredMovies.length === 0 && (
          <div className="text-center text-gray-500 mt-20 p-10 bg-[#111] rounded-xl border border-white/10">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl font-semibold">No movies found matching your search.</p>
          </div>
        )}
        
      </div>
    </div>
  );
}