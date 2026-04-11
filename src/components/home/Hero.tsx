import Link from 'next/link';
import { FALLBACK_BACKDROP } from '@/utils/mediaRoute';

interface FeaturedData {
  id: string;
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  releaseYear: number;
  genre: string[];
  synopsis?: string;
  href?: string;
  averageRating?: number;
}

export default function Hero({ featuredData }: { featuredData?: FeaturedData | null }) {
  const title = featuredData?.title || 'Cinema Worth Staying In For';
  const year = featuredData?.releaseYear || 2026;
  const genre = featuredData?.genre?.[0] || 'Featured';
  const synopsis =
    featuredData?.synopsis ||
    "A hand-picked spotlight from the week's most talked-about movies and series, ready to launch the moment you press play.";
  const backgroundImageUrl = featuredData?.backdropUrl || featuredData?.posterUrl || FALLBACK_BACKDROP;
  const watchLink = featuredData?.href || (featuredData?.id ? `/movies/${featuredData.id}` : '/movies');

  return (
    <section className="relative overflow-hidden min-h-[72svh] sm:min-h-[64vh]">
      <div
        className="hero-backdrop absolute inset-0 bg-cover"
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.26),transparent_32%),linear-gradient(180deg,rgba(5,5,5,0.22)_0%,rgba(5,5,5,0.56)_34%,rgba(5,5,5,0.92)_100%)] sm:bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.2),transparent_28%),linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.82)_44%,rgba(5,5,5,0.5)_72%,rgba(5,5,5,0.88)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/18 to-[#050505]/10 sm:via-transparent sm:to-[#050505]/20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="pill-label">Featured Tonight</span>
            {typeof featuredData?.averageRating === 'number' && featuredData.averageRating > 0 && (
              <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
                TMDB {featuredData.averageRating.toFixed(1)}
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
            <span>Stream in seconds</span>
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
      </div>
    </section>
  );
}
