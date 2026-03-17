"use client";

import { useEffect, useState } from 'react';
import Hero from "@/components/home/Hero";
import MovieSlider from "@/components/home/MovieSlider";
import Pricing from "@/components/home/Pricing";
import { api } from '@/lib/axios';

export default function Home() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/media');
        // Add a placeholder image since we do not have an image field in DB yet
        const formattedMovies = response.data.media.map((movie: any) => ({
          ...movie,
          image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop",
          rating: 8.5 // Placeholder rating
        }));
        setMovies(formattedMovies);
      } catch (error) {
        console.error("Error fetching movies for home page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Hero />
      
      <div className="pb-10 -mt-20 relative z-20">
        <MovieSlider title="Trending Now" movies={movies} />
        <MovieSlider title="Newly Added" movies={[...movies].reverse()} />
      </div>

      <Pricing />
    </div>
  );
}