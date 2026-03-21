"use client";

import { useEffect, useState } from 'react';
import Hero from "@/components/home/Hero";
import MovieSlider from "@/components/home/MovieSlider";
import Pricing from "@/components/home/Pricing";
import { api } from '@/lib/axios';
import { FALLBACK_POSTER } from '@/utils/mediaRoute';

interface CatalogItem {
  id: string;
  href?: string;
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  averageRating?: number;
  releaseYear: number;
  genre: string[];
  source?: 'MANUAL' | 'TMDB';
  synopsis?: string;
}

interface SliderItem {
  id: string;
  href?: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
}

function toSliderItems(items: CatalogItem[]): SliderItem[] {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    title: item.title,
    image: item.posterUrl || FALLBACK_POSTER,
    rating: Number(item.averageRating) || 0,
    year: item.releaseYear,
    genre: item.genre?.[0] || 'Unknown',
  }));
}

export default function Home() {
  const [featured, setFeatured] = useState<CatalogItem | null>(null);
  const [topRatedThisWeek, setTopRatedThisWeek] = useState<SliderItem[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<SliderItem[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [tmdbHomeResult, topMoviesResult, topSeriesResult, localHomeResult] = await Promise.allSettled([
          api.get('/tmdb/home'),
          api.get('/tmdb/movies', { params: { sort: 'highest-rated', page: 1 } }),
          api.get('/tmdb/series', { params: { sort: 'highest-rated', page: 1 } }),
          api.get('/media/home'),
        ]);

        const tmdbHome = tmdbHomeResult.status === 'fulfilled' ? tmdbHomeResult.value.data : null;
        const topMovies = topMoviesResult.status === 'fulfilled' ? (topMoviesResult.value.data.results || []) as CatalogItem[] : [];
        const topSeries = topSeriesResult.status === 'fulfilled' ? (topSeriesResult.value.data.results || []) as CatalogItem[] : [];
        const localHome = localHomeResult.status === 'fulfilled' ? localHomeResult.value.data : null;
        const tmdbPopular = (tmdbHome?.popularMovies || []) as CatalogItem[];

        const localEditors =
          ((localHome?.editorsPicks || []) as CatalogItem[]).filter((item) => item.source !== 'TMDB');
        const localNewlyAdded =
          ((localHome?.newlyAdded || []) as CatalogItem[]).filter((item) => item.source !== 'TMDB');

        const mergedTopRated = [...topMovies, ...topSeries]
          .sort((left, right) => (Number(right.averageRating) || 0) - (Number(left.averageRating) || 0))
          .slice(0, 12);

        const newlyAddedSource = localNewlyAdded.length > 0 ? localNewlyAdded : tmdbPopular;
        const editorsSource =
          localEditors.length > 0 ? localEditors : localNewlyAdded.length > 0 ? localNewlyAdded : tmdbPopular;

        setFeatured((tmdbHome?.featured as CatalogItem | null) || localEditors[0] || localNewlyAdded[0] || tmdbPopular[0] || null);
        setTopRatedThisWeek(toSliderItems(mergedTopRated));
        setNewlyAdded(toSliderItems(newlyAddedSource.slice(0, 12)));
        setEditorsPicks(toSliderItems(editorsSource.slice(0, 12)));
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
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
      <Hero featuredData={featured} />

      <div className="relative z-10 pt-10 pb-6">
        <MovieSlider title="Top Rated This Week" movies={topRatedThisWeek} />
        <MovieSlider title="Newly Added" movies={newlyAdded} />
        <MovieSlider title="Editor's Picks" movies={editorsPicks} />
      </div>

      <Pricing />
    </div>
  );
}
