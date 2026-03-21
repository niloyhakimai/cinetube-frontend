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
  const trailerLink = watchLink;

  return (
    <section className="relative overflow-hidden min-h-[82vh] lg:min-h-[88vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_28%),linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.84)_40%,rgba(5,5,5,0.48)_68%,rgba(5,5,5,0.85)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28 lg:pt-36 lg:pb-36">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Featured Tonight
            </span>
            {typeof featuredData?.averageRating === 'number' && featuredData.averageRating > 0 && (
              <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-yellow-400">
                TMDB {featuredData.averageRating.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight text-white max-w-4xl">
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-300">
            <span>{year}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
            <span className="uppercase tracking-[0.2em] text-red-400">{genre}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
            <span>Stream in seconds</span>
          </div>

          <p className="mt-6 max-w-2xl text-lg md:text-xl leading-8 text-gray-200">
            {synopsis}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href={watchLink}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-8 py-4 text-white font-bold shadow-[0_0_22px_rgba(229,9,20,0.32)] transition-all hover:bg-red-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Watching
            </Link>

            <Link
              href={trailerLink}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-white font-bold backdrop-blur-md transition-all hover:bg-white/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-5.197-3.03A1 1 0 008 9v6a1 1 0 001.555.832l5.197-3.03a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Play Trailer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
