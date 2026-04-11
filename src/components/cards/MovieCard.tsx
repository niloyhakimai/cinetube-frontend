import Link from 'next/link';

interface MovieCardProps {
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

export default function MovieCard({
  id,
  title,
  image,
  rating,
  year,
  genre,
  href,
  mediaType,
  priceType,
}: MovieCardProps) {
  return (
    <Link
      href={href || `/movies/${id}`}
      className="group relative flex-none w-40 overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)] md:w-48 lg:w-56"
    >
      <div className="relative aspect-[2/3] w-full">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] group-hover:brightness-75"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {mediaType && (
            <span className="rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
              {mediaType}
            </span>
          )}
          {priceType && (
            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${
              priceType === 'PREMIUM'
                ? 'border border-yellow-500/40 bg-yellow-500/15 text-yellow-400'
                : 'border border-green-500/30 bg-green-500/12 text-green-400'
            }`}>
              {priceType}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md">
          ★ {rating.toFixed(1)}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="truncate text-sm font-bold text-white">{title}</h3>
        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>{year}</span>
          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-gray-300">
            {genre}
          </span>
        </div>
      </div>
    </Link>
  );
}
