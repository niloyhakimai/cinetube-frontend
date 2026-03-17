import Link from 'next/link';

interface MovieCardProps {
  id: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
}

export default function MovieCard({ id, title, image, rating, year, genre }: MovieCardProps) {
  return (
    <Link href={`/movies/${id}`} className="group relative flex-none w-40 md:w-48 lg:w-56 overflow-hidden rounded-md transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer shadow-lg">
      {/* Movie Poster */}
      <div className="relative w-full aspect-2/3">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-75"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <span>★</span> {rating.toFixed(1)}
        </div>
      </div>

      {/* Hover Information (Glassy Effect) */}
      <div className="absolute bottom-0 w-full p-3 bg-linear-to-t from-black via-black/80 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="text-white font-bold text-sm truncate">{title}</h3>
        <div className="flex items-center justify-between mt-1 text-gray-400 text-xs">
          <span>{year}</span>
          <span className="border border-gray-500 px-1.5 py-0.5 rounded text-[10px]">{genre}</span>
        </div>
      </div>
    </Link>
  );
}
