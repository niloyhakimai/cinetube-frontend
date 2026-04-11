"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MovieCard from '@/components/cards/MovieCard';
import { api } from '@/lib/axios';
import { FALLBACK_POSTER } from '@/utils/mediaRoute';

interface MediaData {
  id: string;
  href?: string;
  title: string;
  releaseYear: number;
  genre: string[];
  posterUrl?: string | null;
  averageRating?: number;
}

function MoviesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [movies, setMovies] = useState<MediaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchQuery = searchParams.get('q') || '';
  const selectedGenre = searchParams.get('genre') || 'All';
  const sort = searchParams.get('sort') || 'popularity';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/tmdb/movies', {
          params: {
            q: searchQuery,
            genre: selectedGenre === 'All' ? '' : selectedGenre,
            sort,
            year,
            rating,
            page,
          },
        });

        setMovies(response.data.results || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalResults(response.data.totalResults || 0);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [page, rating, searchQuery, selectedGenre, sort, year]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.push(`/movies?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/movies?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white border-l-4 border-red-600 pl-4 mb-2">
            Explore Movies
          </h1>
          <p className="text-gray-400 pl-4 text-sm hidden sm:block">Found {totalResults} titles</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(event) => updateFilter('q', event.target.value)}
            className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md focus:outline-none focus:border-red-600 w-full md:w-64 transition-all"
          />

          <select
            value={selectedGenre}
            onChange={(event) => updateFilter('genre', event.target.value)}
            className="flex-1 md:flex-none bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>

          <select
            value={sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            className="flex-1 md:flex-none bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="popularity">Most Popular</option>
            <option value="latest">Recent (Newest)</option>
            <option value="highest-rated">Top Rated</option>
            <option value="most-reviewed">Most Reviewed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="animate-pulse bg-[#111] rounded-xl aspect-[2/3] border border-white/5"></div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 p-10 bg-[#111] rounded-xl border border-white/10">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-xl font-semibold">No movies found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                href={movie.href}
                title={movie.title}
                image={movie.posterUrl || FALLBACK_POSTER}
                rating={Number(movie.averageRating) || 0}
                year={movie.releaseYear}
                genre={movie.genre[0] || "Unknown"}
                mediaType="MOVIE"
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-5 py-2.5 bg-[#111] border border-white/10 hover:border-red-500/50 rounded-lg text-sm font-bold hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                &larr; Previous
              </button>
              <span className="text-gray-400 font-medium text-sm">
                Page <span className="text-white bg-white/10 px-2 py-1 rounded">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-5 py-2.5 bg-[#111] border border-white/10 hover:border-red-500/50 rounded-lg text-sm font-bold hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AllMovies() {
  return (
    <div className="min-h-screen bg-[#050505] pt-20">
      <Suspense fallback={<div className="text-center py-20 text-red-500 flex justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>}>
        <MoviesContent />
      </Suspense>
    </div>
  );
}
