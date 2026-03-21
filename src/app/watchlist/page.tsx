"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MovieCard from '@/components/cards/MovieCard';
import { api } from '@/lib/axios';

interface WatchlistItem {
  id: string;
  media: {
    id: string;
    title: string;
    genre: string[];
    releaseYear: number;
    posterUrl?: string | null;
  };
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await api.get('/watchlist');
        setWatchlist(response.data.watchlist);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <h1 className="text-3xl md:text-4xl font-extrabold mb-10 border-l-4 border-red-600 pl-4">
          My Watchlist
        </h1>

        {watchlist.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 p-10 bg-[#111] rounded-xl border border-white/10 shadow-2xl">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-xl font-semibold text-white">Your watchlist is empty.</p>
            <p className="text-sm mt-2 mb-8">Discover great movies and add them to your list!</p>
            <Link 
              href="/movies" 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded font-bold transition-colors shadow-[0_0_15px_rgba(229,9,20,0.4)]"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchlist.map((item) => (
              <MovieCard 
                key={item.id}
                id={item.media.id}
                title={item.media.title}
                image={item.media.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop"}
                rating={8.5} 
                year={item.media.releaseYear}
                genre={item.media.genre[0] || "Unknown"}
              />
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
