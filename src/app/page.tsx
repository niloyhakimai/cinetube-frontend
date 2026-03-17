import Hero from "@/components/home/Hero";
import MovieSlider from "@/components/home/MovieSlider";
import Pricing from "@/components/home/Pricing";
// Dummy data for initial UI testing
const DUMMY_MOVIES = [
  { id: "1", title: "Inception", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop", rating: 8.8, year: 2010, genre: "Sci-Fi" },
  { id: "2", title: "The Dark Knight", image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&auto=format&fit=crop", rating: 9.0, year: 2008, genre: "Action" },
  { id: "3", title: "Interstellar", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop", rating: 8.6, year: 2014, genre: "Sci-Fi" },
  { id: "4", title: "Matrix", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop", rating: 8.7, year: 1999, genre: "Action" },
  { id: "5", title: "Dune", image: "https://images.unsplash.com/photo-1542051812871-75f83cb9df48?w=500&auto=format&fit=crop", rating: 8.0, year: 2021, genre: "Sci-Fi" },
  { id: "6", title: "Blade Runner", image: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=500&auto=format&fit=crop", rating: 8.0, year: 2017, genre: "Action" },
  { id: "7", title: "Avatar", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop", rating: 7.8, year: 2009, genre: "Sci-Fi" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Hero />
      
      <div className="pb-20 -mt-20 relative z-20">
        <MovieSlider title="Trending Now" movies={DUMMY_MOVIES} />
        <MovieSlider title="Newly Added" movies={[...DUMMY_MOVIES].reverse()} />
        <MovieSlider title="Editor's Picks" movies={DUMMY_MOVIES.slice(0, 5)} />
      </div>

      {/* Pricing Section */}
      <Pricing />
    </div>
  );
}