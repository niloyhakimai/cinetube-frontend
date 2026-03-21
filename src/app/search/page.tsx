"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';
import { FALLBACK_POSTER } from '@/utils/mediaRoute';

interface Media {
  id: string;
  href?: string;
  title: string;
  mediaType: string;
  releaseYear: number;
  posterUrl?: string | null;
  genre: string[];
  averageRating?: number | string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const platform = searchParams.get('platform') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'popularity';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (platform) {
          const response = await api.get('/media/search', {
            params: { q, genre, platform, year, rating, sort, page, limit: 12 },
          });

          const mappedResults = (response.data.data || []).map((item: any) => ({
            id: item.id,
            href: `/movies/${item.id}`,
            title: item.title,
            mediaType: item.mediaType || 'LIBRARY',
            releaseYear: item.releaseYear,
            posterUrl: item.posterUrl,
            genre: item.genre || [],
            averageRating: item.averageRating,
          }));

          setResults(mappedResults);
          setTotalPages(response.data.pagination?.pages || 1);
          setTotalResults(response.data.pagination?.total || 0);
          return;
        }

        const response = await api.get('/tmdb/search', {
          params: {
            q,
            genre,
            year,
            rating,
            sort,
            page,
          },
        });

        setResults(response.data.results || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalResults(response.data.totalResults || 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [genre, page, platform, q, rating, sort, year]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Search Results
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {isLoading ? (
              <span className="animate-pulse bg-gray-700/50 h-5 w-48 rounded block mt-1"></span>
            ) : (
              `Found ${totalResults} matching titles ${q ? `for "${q}"` : ''}`
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse bg-[#111] rounded-xl aspect-[2/3] border border-white/5 shadow-lg"></div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111]/50 backdrop-blur-md rounded-2xl border border-white/10">
            <svg className="w-20 h-20 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 text-center max-w-md">
              We couldn't find any movies or shows matching your current filters. Try adjusting your search.
            </p>
            <Link href="/" className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(229,9,20,0.4)]">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {results.map((media) => (
                <Link
                  key={media.id}
                  href={media.href || `/movies/${media.id}`}
                  className="group relative block rounded-xl overflow-hidden bg-[#111] border border-white/5 transition-all duration-300 hover:scale-105 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(229,9,20,0.3)]"
                >
                  <div className="aspect-[2/3] w-full bg-[#1a1a1a] relative">
                    <img
                      src={media.posterUrl || FALLBACK_POSTER}
                      alt={media.title}
                      className="object-cover w-full h-full"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
                        {media.genre[0] || media.mediaType}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {media.releaseYear}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm truncate" title={media.title}>
                      {media.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &larr; Previous
                </button>

                <span className="text-gray-400 font-medium text-sm">
                  Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchResultsContent />
    </Suspense>
  );
}

function SearchLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Search Results</h1>
          <p className="text-gray-400 text-sm md:text-base">
            <span className="animate-pulse bg-gray-700/50 h-5 w-48 rounded block mt-1"></span>
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse bg-[#111] rounded-xl aspect-[2/3] border border-white/5 shadow-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
