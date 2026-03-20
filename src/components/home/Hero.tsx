import Link from 'next/link';

interface FeaturedData {
  id: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  genre: string[];
  synopsis?: string;
}


export default function Hero({ featuredData }: { featuredData?: FeaturedData | null }) {
  

  const title = featuredData?.title || 'Stranger Things';
  const year = featuredData?.releaseYear || 2016;
  const genre = featuredData?.genre?.[0] || 'Sci-Fi';
  const synopsis = featuredData?.synopsis || 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.';
  const backgroundImageUrl = featuredData?.posterUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop';
  const watchLink = featuredData?.id ? `/movies/${featuredData.id}` : '/movies/example-id';

  return (
    <div className="relative w-full h-[85vh] lg:h-[90vh] flex items-center">
      {/* Background Image & Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: `url('${backgroundImageUrl}')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 drop-shadow-lg uppercase tracking-wide">
            {title}
          </h1>
          
          <div className="flex items-center space-x-4 text-gray-300 text-sm md:text-base font-medium mb-6">
            <span>{year}</span>
            <span className="px-2 py-0.5 border border-gray-500 rounded text-xs">16+</span>
            
            {/* যদি অরিজিনাল ডাটা না থাকে, শুধু তখনই 4 Seasons দেখাবে */}
            {!featuredData && <span>4 Seasons</span>} 
            
            <span className="text-red-500 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded uppercase font-bold">
              {genre}
            </span>
          </div>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl line-clamp-3">
            {synopsis}
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href={watchLink}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Watching
            </Link>
            
            <button className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-md font-bold transition-all">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Play Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}