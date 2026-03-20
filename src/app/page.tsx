"use client";

import { useEffect, useState } from 'react';
import Hero from "@/components/home/Hero";
import MovieSlider from "@/components/home/MovieSlider";
import Pricing from "@/components/home/Pricing";
import { api } from '@/lib/axios';

interface MediaItem {
  id: string;
  title: string;
  posterUrl: string;
  averageRating: number;
  releaseYear: number;
  genre: string[];
  synopsis?: string;
}

export default function Home() {
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [editorsPicks, setEditorsPicks] = useState<any[]>([]); // <-- নতুন স্টেট
  const [newlyAdded, setNewlyAdded] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get('/media/home');
        
        setFeatured(response.data.featured);
        
        // MovieSlider Data Formatter
        const formatForSlider = (items: any[]) => items.map(item => ({
          id: item.id,
          title: item.title,
          image: item.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop",
          rating: item.averageRating || 0,
          year: item.releaseYear,
          genre: item.genre?.[0] || 'Unknown' 
        }));

        // ডাটাগুলো স্টেটে সেভ করা হচ্ছে
        setEditorsPicks(formatForSlider(response.data.editorsPicks || [])); // <-- Editor's picks ডাটা
        setNewlyAdded(formatForSlider(response.data.newlyAdded || []));
        setTopRated(formatForSlider(response.data.topRated || []));

      } catch (error) {
        console.error("Error fetching homepage data:", error);
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
     
      {/* Hero Section */}
      <Hero featuredData={featured} />
      
      {/* Sliders Section */}
      <div className="pb-10 -mt-20 relative z-20">
        
        <MovieSlider title="Top Rated This Week" movies={topRated} />
        <MovieSlider title="Newly Added" movies={newlyAdded} />
        {/* Editor's Picks Slider (শুধু ডাটা থাকলেই দেখাবে) */}
        {editorsPicks.length > 0 && (
          <MovieSlider title="Editor's Picks" movies={editorsPicks} />
        )}

      </div>

      <Pricing />
    </div>
  );
}