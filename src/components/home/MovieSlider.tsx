"use client";

import { useRef } from 'react';
import MovieCard from '../cards/MovieCard';

interface Movie {
  id: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
}

interface MovieSliderProps {
  title: string;
  movies: Movie[];
}

export default function MovieSlider({ title, movies }: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 400;
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 400;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative group">
      <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-3">
        {title}
      </h2>
      
      {/* Navigation Arrows */}
      <button 
        onClick={slideLeft} 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block backdrop-blur-sm"
      >
        &#10094;
      </button>

      <button 
        onClick={slideRight} 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity hidden md:block backdrop-blur-sm"
      >
        &#10095;
      </button>

      {/* Slider Container */}
      <div 
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>
    </div>
  );
}