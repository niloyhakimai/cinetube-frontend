"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

interface TopWeekCarouselProps {
  title: string;
  movies: Movie[];
}

const AUTO_ADVANCE_MS = 4500;

export default function TopWeekCarousel({ title, movies }: TopWeekCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(interval);
  }, [movies.length]);

  useEffect(() => {
    if (activeIndex >= movies.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, movies.length]);

  if (movies.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => setActiveIndex(index);
  const goPrevious = () => setActiveIndex((current) => (current - 1 + movies.length) % movies.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % movies.length);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="section-heading">{title}</h2>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={goPrevious}
            className="secondary-button !h-11 !w-11 !justify-center !rounded-full !px-0 !py-0"
            aria-label="Previous top rated title"
          >
            &#10094;
          </button>
          <button
            type="button"
            onClick={goNext}
            className="secondary-button !h-11 !w-11 !justify-center !rounded-full !px-0 !py-0"
            aria-label="Next top rated title"
          >
            &#10095;
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,14,16,0.96),rgba(8,8,10,0.98))] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {movies.map((movie) => (
            <article key={movie.id} className="min-w-full">
              <div className="grid min-h-[30rem] md:grid-cols-[280px_minmax(0,1fr)]">
                <div className="relative min-h-[18rem] overflow-hidden md:min-h-full">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
                </div>

                <div className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.16),transparent_30%)] p-6 sm:p-8 lg:p-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-300">
                      {movie.mediaType && (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1">
                          {movie.mediaType}
                        </span>
                      )}
                      {movie.priceType && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80">
                          {movie.priceType}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-6 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[2.8rem]">
                      {movie.title}
                    </h3>

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-300">
                      <span>{movie.year}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                      <span className="uppercase tracking-[0.18em] text-red-400">{movie.genre}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                      <span className="text-yellow-400">★ {movie.rating.toFixed(1)}</span>
                    </div>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-gray-300">
                      Audience-rated standouts that are climbing this week. The carousel auto-swipes so viewers can scan the strongest picks without dragging through a long rail.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {movies.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => goToSlide(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === activeIndex ? "w-8 bg-red-500" : "w-2.5 bg-white/20 hover:bg-white/40"
                          }`}
                          aria-label={`Go to ${item.title}`}
                        />
                      ))}
                    </div>

                    <Link
                      href={movie.href || `/movies/${movie.id}`}
                      className="primary-button justify-center"
                    >
                      Open Title
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-4 md:hidden">
          <button
            type="button"
            onClick={goPrevious}
            className="secondary-button !justify-center !rounded-full !px-4 !py-2"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            className="secondary-button !justify-center !rounded-full !px-4 !py-2"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
