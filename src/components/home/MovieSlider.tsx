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
  href?: string;
  mediaType?: string;
  priceType?: string;
}

interface MovieSliderProps {
  title: string;
  movies: Movie[];
}

export default function MovieSlider({ title, movies }: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft -= 420;
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft += 420;
    }
  };

  return (
    <div className="group relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="section-heading mb-6">{title}</h2>

      <button
        onClick={slideLeft}
        className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-r-2xl border border-white/10 bg-black/70 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 md:block"
      >
        &#10094;
      </button>

      <button
        onClick={slideRight}
        className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-l-2xl border border-white/10 bg-black/70 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 md:block"
      >
        &#10095;
      </button>

      <div ref={sliderRef} className="scrollbar-hide flex gap-4 overflow-x-auto py-4 scroll-smooth">
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>
    </div>
  );
}
