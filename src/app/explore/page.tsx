"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MovieCard from '@/components/cards/MovieCard';
import { api } from '@/lib/axios';
import { commonGenres } from '@/content/site';
import { FALLBACK_POSTER } from '@/utils/mediaRoute';

interface ExploreItem {
  id: string;
  href: string;
  title: string;
  posterUrl?: string | null;
  averageRating: number;
  releaseYear: number;
  genre: string[];
  mediaType: 'MOVIE' | 'TV';
  priceType: string;
  source: 'MANUAL' | 'TMDB';
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const platform = searchParams.get('platform') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'popularity';
  const mediaType = searchParams.get('mediaType') || 'ALL';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/catalog/explore', {
          params: {
            q,
            genre,
            platform,
            year,
            rating,
            sort,
            mediaType,
            page,
            limit: 12,
          },
        });

        setItems(response.data.items || []);
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error('Explore catalog error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [genre, mediaType, page, platform, q, rating, sort, year]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set('page', '1');
    router.push(`/explore?${params.toString()}`);
  };

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.pages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)] bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.14),transparent_35%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <span className="pill-label">Explore</span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Unified discovery across local titles and TMDB sync.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
            Search with one consistent surface, keep filters in view, and compare premium vs free titles without jumping between disconnected pages.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="surface-panel h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <div className="mt-6 space-y-4">
            <input
              value={q}
              onChange={(event) => updateFilter('q', event.target.value)}
              placeholder="Search titles..."
              className="input-shell"
            />

            <select value={mediaType} onChange={(event) => updateFilter('mediaType', event.target.value)} className="select-shell">
              <option value="ALL">All Media Types</option>
              <option value="MOVIE">Movies</option>
              <option value="TV">Series</option>
            </select>

            <select value={genre} onChange={(event) => updateFilter('genre', event.target.value)} className="select-shell">
              <option value="">All Genres</option>
              {commonGenres.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>

            <select value={year} onChange={(event) => updateFilter('year', event.target.value)} className="select-shell">
              <option value="">Any Year</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2020-2024">2020-2024</option>
              <option value="2010s">2010s</option>
              <option value="classic">Classics</option>
            </select>

            <select value={rating} onChange={(event) => updateFilter('rating', event.target.value)} className="select-shell">
              <option value="">Any Rating</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
            </select>

            <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} className="select-shell">
              <option value="popularity">Most Popular</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="most-reviewed">Most Reviewed</option>
              <option value="latest">Latest</option>
            </select>

            <button type="button" onClick={() => router.push('/explore')} className="secondary-button w-full justify-center">
              Reset Filters
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">Catalog Results</h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">Showing {pagination.total} matched titles.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[var(--color-muted)]">
              Sticky filters, 4-card rhythm, unified data
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="aspect-[2/3] animate-pulse rounded-3xl border border-white/10 bg-[var(--color-surface)]"></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="surface-panel p-12 text-center">
              <h3 className="text-2xl font-bold text-white">No titles matched these filters.</h3>
              <p className="mt-4 text-[var(--color-muted)]">Try broadening your genre, rating, or media type filters to reopen the catalog.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <MovieCard
                    key={item.id}
                    id={item.id}
                    href={item.href}
                    title={item.title}
                    image={item.posterUrl || FALLBACK_POSTER}
                    rating={Number(item.averageRating) || 0}
                    year={item.releaseYear}
                    genre={item.genre[0] || 'Unknown'}
                    mediaType={item.mediaType}
                    priceType={item.priceType}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} className="secondary-button disabled:opacity-50">
                    Previous
                  </button>
                  <span className="text-sm text-[var(--color-muted)]">
                    Page <span className="font-bold text-white">{page}</span> of {pagination.pages}
                  </span>
                  <button type="button" onClick={() => changePage(page + 1)} disabled={page === pagination.pages} className="secondary-button disabled:opacity-50">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-background)]"></div>}>
      <ExploreContent />
    </Suspense>
  );
}
