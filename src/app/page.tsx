"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Hero from "@/components/home/Hero";
import MovieSlider from "@/components/home/MovieSlider";
import Pricing from "@/components/home/Pricing";
import { api } from '@/lib/axios';
import { FALLBACK_POSTER } from '@/utils/mediaRoute';
import { blogHighlights, faqItems, genreSpotlights, platformStats, testimonials } from '@/content/site';

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
  mediaType?: 'MOVIE' | 'TV';
  priceType?: string;
}

interface SliderItem {
  id: string;
  href?: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
  mediaType?: string;
  priceType?: string;
}

interface AiRecommendationResponse {
  headline: string;
  summary: string;
  items: CatalogItem[];
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
    mediaType: item.mediaType,
    priceType: item.priceType,
  }));
}

export default function Home() {
  const [featured, setFeatured] = useState<CatalogItem | null>(null);
  const [trendingNow, setTrendingNow] = useState<SliderItem[]>([]);
  const [topRatedThisWeek, setTopRatedThisWeek] = useState<SliderItem[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<SliderItem[]>([]);
  const [editorsPicks, setEditorsPicks] = useState<SliderItem[]>([]);
  const [aiPicks, setAiPicks] = useState<SliderItem[]>([]);
  const [aiHeadline, setAiHeadline] = useState('AI Picks For You');
  const [aiSummary, setAiSummary] = useState('Blending featured titles, strong audience signals, and what CineTube can learn from recent behavior.');
  const [isLoading, setIsLoading] = useState(true);
  const hasLiveFeed =
    trendingNow.length > 0 ||
    topRatedThisWeek.length > 0 ||
    newlyAdded.length > 0 ||
    editorsPicks.length > 0;

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const homeRequests = [
          { key: 'tmdb/home', request: api.get('/tmdb/home') },
          { key: 'tmdb/movies', request: api.get('/tmdb/movies', { params: { sort: 'highest-rated', page: 1 } }) },
          { key: 'tmdb/series', request: api.get('/tmdb/series', { params: { sort: 'highest-rated', page: 1 } }) },
          { key: 'media/home', request: api.get('/media/home') },
          { key: 'ai/recommendations', request: api.get('/ai/recommendations', { params: { limit: 12 } }) },
        ] as const;
        const [tmdbHomeResult, topMoviesResult, topSeriesResult, localHomeResult, aiResult] = await Promise.allSettled(
          homeRequests.map((entry) => entry.request),
        );

        const tmdbHome = tmdbHomeResult.status === 'fulfilled' ? tmdbHomeResult.value.data : null;
        const topMovies = topMoviesResult.status === 'fulfilled' ? (topMoviesResult.value.data.results || []) as CatalogItem[] : [];
        const topSeries = topSeriesResult.status === 'fulfilled' ? (topSeriesResult.value.data.results || []) as CatalogItem[] : [];
        const localHome = localHomeResult.status === 'fulfilled' ? localHomeResult.value.data : null;
        const aiPayload = aiResult.status === 'fulfilled' ? aiResult.value.data as AiRecommendationResponse : null;
        const tmdbPopular = (tmdbHome?.popularMovies || []) as CatalogItem[];
        const tmdbTrendingSeries = (tmdbHome?.trendingSeries || []) as CatalogItem[];

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
        setTrendingNow(toSliderItems([...tmdbPopular.slice(0, 6), ...tmdbTrendingSeries.slice(0, 6)]));
        setTopRatedThisWeek(toSliderItems(mergedTopRated));
        setNewlyAdded(toSliderItems(newlyAddedSource.slice(0, 12)));
        setEditorsPicks(toSliderItems(editorsSource.slice(0, 12)));

        if (aiPayload?.items?.length) {
          setAiHeadline(aiPayload.headline || 'AI Picks For You');
          setAiSummary(aiPayload.summary || aiSummary);
          setAiPicks(toSliderItems(aiPayload.items));
        }

        const failedRequests = [tmdbHomeResult, topMoviesResult, topSeriesResult, localHomeResult, aiResult]
          .map((result, index) => ({ result, key: homeRequests[index].key }))
          .filter((entry) => entry.result.status === 'rejected');

        if (failedRequests.length > 0) {
          console.error(
            'Homepage feed requests failed:',
            failedRequests.map((entry) => ({
              key: entry.key,
              reason: entry.result.status === 'rejected' ? entry.result.reason : null,
              baseURL: api.defaults.baseURL,
            })),
          );
        }
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

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 pt-10 sm:px-6 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
        {platformStats.map((item) => (
          <div key={item.label} className="surface-panel p-6">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">{item.label}</p>
            <p className="mt-3 text-4xl font-black text-white">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.note}</p>
          </div>
        ))}
      </section>

      {!hasLiveFeed && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="surface-panel border border-red-500/20 px-6 py-5 text-sm text-[var(--color-muted)]">
            Live movie and series feeds could not be loaded right now. Check that the backend API is running, then refresh the page.
          </div>
        </section>
      )}

      <div className="relative z-10 pb-6">
        <MovieSlider title="Trending Now" movies={trendingNow} />
        <MovieSlider title="Top Rated This Week" movies={topRatedThisWeek} />
        <MovieSlider title="Newly Added" movies={newlyAdded} />
        <MovieSlider title="Editor's Picks" movies={editorsPicks} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-heading">Genre Spotlights</h2>
            <p className="mt-3 max-w-3xl text-[var(--color-muted)]">
              Jump into curated entry points that make the catalog feel intentional instead of endless.
            </p>
          </div>
          <Link href="/explore" className="secondary-button hidden sm:inline-flex">
            Explore All
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {genreSpotlights.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`surface-panel bg-gradient-to-br ${item.accent} p-6 transition-transform duration-200 hover:-translate-y-1`}
            >
              <p className="text-xl font-black text-white">{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="surface-panel overflow-hidden p-8 sm:p-10">
          <div className="max-w-3xl">
            <span className="pill-label">AI Discovery</span>
            <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">{aiHeadline}</h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">{aiSummary}</p>
          </div>
          {aiPicks.length > 0 && <MovieSlider title="AI Picks For You" movies={aiPicks} />}
        </div>
      </section>

      <Pricing />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="section-heading">What Viewers Say</h2>
          <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
            Social proof matters on a streaming-style product, so the home page should feel like a living platform rather than a static gallery.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="surface-panel p-6">
              <p className="text-lg leading-8 text-white">“{item.quote}”</p>
              <div className="mt-6">
                <p className="font-bold text-white">{item.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="surface-panel p-8">
          <h2 className="section-heading">FAQ Preview</h2>
          <div className="mt-8 space-y-4">
            {faqItems.slice(0, 3).map((item) => (
              <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-bold text-white">{item.question}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{item.answer}</p>
              </div>
            ))}
          </div>
          <Link href="/faq" className="secondary-button mt-6">
            Read All FAQ
          </Link>
        </div>

        <div className="surface-panel p-8">
          <span className="pill-label">Editorial</span>
          <h2 className="mt-5 text-3xl font-black text-white">Blog & Product Highlights</h2>
          <div className="mt-8 space-y-5">
            {blogHighlights.map((item) => (
              <article key={item.slug} className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0">
                <p className="text-lg font-bold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{item.excerpt}</p>
              </article>
            ))}
          </div>
          <Link href="/blog" className="primary-button mt-6">
            Open Blog
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="surface-panel flex flex-col gap-6 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_34%)] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="pill-label">Stay Updated</span>
            <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">Get new picks, platform updates, and premium highlights.</h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">
              Even before a full newsletter backend arrives, the assignment should still show a polished conversion section with a clear call-to-action.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button justify-center">
              Contact Team
            </Link>
            <Link href="/explore?sort=popularity" className="secondary-button justify-center">
              Start Exploring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
