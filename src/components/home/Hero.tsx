"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FALLBACK_BACKDROP } from '@/utils/mediaRoute';

interface FeaturedData {
  id: string;
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  previewLink?: string | null;
  releaseYear: number;
  genre: string[];
  synopsis?: string;
  href?: string;
  averageRating?: number;
}

function getYouTubeId(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const HERO_ROTATE_MS = 7000;

export default function Hero({
  featuredData,
  featuredSlides = [],
}: {
  featuredData?: FeaturedData | null;
  featuredSlides?: FeaturedData[];
}) {
  const slides = useMemo(() => {
    const baseSlides = featuredSlides.length > 0
      ? featuredSlides
      : featuredData
        ? [featuredData]
        : [];

    return baseSlides.filter((item, index, collection) => {
      return collection.findIndex((entry) => entry.id === item.id) === index;
    });
  }, [featuredData, featuredSlides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const firstTrailerIndex = useMemo(
    () => slides.findIndex((slide) => Boolean(getYouTubeId(slide.previewLink))),
    [slides],
  );

  useEffect(() => {
    if (slides.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(firstTrailerIndex >= 0 ? firstTrailerIndex : 0);
  }, [firstTrailerIndex, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, HERO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const activeSlide = slides[activeIndex] || featuredData || null;
  const title = activeSlide?.title || 'Cinema Worth Staying In For';
  const year = activeSlide?.releaseYear || 2026;
  const genre = activeSlide?.genre?.[0] || 'Featured';
  const synopsis =
    activeSlide?.synopsis ||
    "A hand-picked spotlight from the week's most talked-about movies and series, ready to launch the moment you press play.";
  const backgroundImageUrl = activeSlide?.backdropUrl || activeSlide?.posterUrl || FALLBACK_BACKDROP;
  const trailerId = getYouTubeId(activeSlide?.previewLink);
  const watchLink = activeSlide?.href || (activeSlide?.id ? `/movies/${activeSlide.id}` : '/movies');

  return (
    <section className="relative min-h-[76svh] overflow-hidden sm:min-h-[68vh]">
      <div className="absolute inset-0">
        {slides.length > 0 ? (
          slides.map((slide, index) => {
            const slideTrailerId = getYouTubeId(slide.previewLink);
            const slideBackground = slide.backdropUrl || slide.posterUrl || FALLBACK_BACKDROP;
            const isActive = index === activeIndex;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              >
                {slideTrailerId ? (
                  <div className="absolute inset-0 scale-[1.18] sm:scale-[1.1]">
                    <iframe
                      key={`${slide.id}-${slideTrailerId}-${isActive ? 'active' : 'idle'}`}
                      src={`https://www.youtube.com/embed/${slideTrailerId}?autoplay=${isActive ? '1' : '0'}&mute=1&controls=0&loop=1&playlist=${slideTrailerId}&playsinline=1&rel=0&modestbranding=1`}
                      title={`${slide.title} trailer background`}
                      className="pointer-events-none h-full w-full"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      tabIndex={-1}
                    />
                  </div>
                ) : (
                  <div
                    className="hero-backdrop absolute inset-0 bg-cover"
                    style={{ backgroundImage: `url('${slideBackground}')` }}
                  />
                )}

                <div
                  className="hero-backdrop absolute inset-0 bg-cover opacity-30"
                  style={{ backgroundImage: `url('${slideBackground}')` }}
                />
              </div>
            );
          })
        ) : (
          <div
            className="hero-backdrop absolute inset-0 bg-cover"
            style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.24),transparent_28%),linear-gradient(180deg,rgba(5,5,5,0.28)_0%,rgba(5,5,5,0.62)_32%,rgba(5,5,5,0.92)_100%)] sm:bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.2),transparent_28%),linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.82)_42%,rgba(5,5,5,0.45)_72%,rgba(5,5,5,0.88)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/18 to-[#050505]/10 sm:via-transparent sm:to-[#050505]/20" />

      <div className="relative z-10 mx-auto flex min-h-[76svh] max-w-7xl items-end px-4 pb-12 pt-28 sm:min-h-[68vh] sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="pill-label">Featured Tonight</span>
              {typeof activeSlide?.averageRating === 'number' && activeSlide.averageRating > 0 && (
                <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
                  TMDB {activeSlide.averageRating.toFixed(1)}
                </span>
              )}
              {trailerId && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                  Trailer Live
                </span>
              )}
            </div>

            <h1 className="max-w-[12ch] text-[2.8rem] font-black leading-[0.92] tracking-tight text-white sm:max-w-4xl sm:text-5xl md:text-7xl xl:text-8xl">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-gray-300 sm:mt-6 sm:text-sm">
              <span>{year}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
              <span className="uppercase tracking-[0.2em] text-red-400">{genre}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
              <span>{trailerId ? 'Muted autoplay trailer' : 'Stream in seconds'}</span>
            </div>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
              {synopsis}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link href={watchLink} className="primary-button w-full justify-center sm:w-auto sm:justify-start">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Watching
              </Link>

              <Link href="/explore?sort=highest-rated" className="secondary-button w-full justify-center sm:w-auto sm:justify-start">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-8 5h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
                Explore Catalog
              </Link>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="hidden w-full max-w-[15rem] gap-3 lg:flex lg:flex-col">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-3xl border px-4 py-4 text-left transition-all ${
                      index === activeIndex
                        ? 'border-red-500/40 bg-red-500/12 shadow-[0_18px_36px_rgba(229,9,20,0.14)]'
                        : 'border-white/10 bg-black/35 hover:bg-white/8'
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{slide.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-400">{slide.genre?.[0] || 'Featured'}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex ? 'w-8 bg-red-500' : 'w-2.5 bg-white/25 hover:bg-white/40'
                    }`}
                    aria-label={`Show ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
